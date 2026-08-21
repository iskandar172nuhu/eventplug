"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { getPaymentProvider } from "@/lib/payment-providers"
import { PaymentType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/lib/modules/notifications/create"

/**
 * PAYMENT ARCHITECTURE NOTES
 *
 * This action uses a three-phase approach:
 *   Phase 1: Short DB transaction to validate and create PENDING payment
 *   Phase 2: External provider call OUTSIDE any DB transaction
 *   Phase 3: Short DB transaction to reconcile provider result
 *
 * CONCURRENCY / IDEMPOTENCY LIMITATIONS (current MOCK provider):
 * - A "recent PENDING payment" guard prevents obvious double-submission
 * - However, this does NOT provide true payment-provider idempotency
 * - Two requests arriving within milliseconds could both pass the guard
 *   before either commits
 *
 * When Paystack/Hubtel is integrated, the following are REQUIRED:
 * 1. Provider-level idempotency key (sent with each payment request)
 * 2. Webhook verification (provider confirms payment asynchronously)
 * 3. Database-level payment-intent/idempotency column with unique constraint
 * 4. Webhook reconciliation should be the source of truth, not inline result
 *
 * The $transaction boundaries here provide database consistency only.
 * A DB rollback CANNOT undo a successful external charge.
 */

export async function initiatePaymentAction(
  bookingId: string,
  paymentType: "FULL" | "DEPOSIT" | "BALANCE"
) {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  // ─── PHASE 1: Validate + Create PENDING Payment (short transaction) ────────

  const phase1Result = await db.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
    })

    // Ownership check
    if (booking.customerId !== customerProfile.id) {
      return { ok: false as const, error: "Not your booking" }
    }

    // Status check
    if (booking.status === "CANCELLED") {
      return { ok: false as const, error: "Cannot pay for a cancelled booking" }
    }

    // Calculate amount server-side from fresh booking state
    const totalAmount = Number(booking.totalAmount)
    const depositAmount = Number(booking.depositAmount)
    const amountPaid = Number(booking.amountPaid)
    const outstanding = totalAmount - amountPaid

    let amount: number
    switch (paymentType) {
      case "DEPOSIT": {
        const remainingDeposit = depositAmount - amountPaid
        amount = remainingDeposit > 0 ? Math.min(remainingDeposit, outstanding) : 0
        break
      }
      case "FULL":
      case "BALANCE":
        amount = outstanding
        break
      default:
        return { ok: false as const, error: "Invalid payment type" }
    }

    if (amount <= 0) {
      return { ok: false as const, error: "No outstanding amount" }
    }

    // Duplicate-submission guard: reject if a recent PENDING payment exists
    // for the same booking and payment type (created within the last 60 seconds)
    const recentPending = await tx.payment.findFirst({
      where: {
        bookingId,
        paymentType: paymentType as PaymentType,
        status: "PENDING",
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    })

    if (recentPending) {
      return { ok: false as const, error: "A payment is already being processed. Please wait." }
    }

    // Create PENDING payment record
    const payment = await tx.payment.create({
      data: {
        bookingId,
        amount,
        paymentType: paymentType as PaymentType,
        paymentMethod: "MOCK",
        status: "PENDING",
      },
    })

    return {
      ok: true as const,
      paymentId: payment.id,
      amount,
      vendorId: booking.vendorId,
      bookingStatus: booking.status,
    }
  })

  if (!phase1Result.ok) {
    return { success: false, error: phase1Result.error }
  }

  const { paymentId, amount, vendorId, bookingStatus } = phase1Result

  // ─── PHASE 2: Call Payment Provider (OUTSIDE transaction) ──────────────────

  const provider = getPaymentProvider()
  let providerResult: { status: "PENDING" | "SUCCESS" | "FAILED"; providerRef: string }

  try {
    providerResult = await provider.initiatePayment({
      bookingId,
      amount: Math.round(amount * 100), // Convert to pesewas
      currency: "GHS",
      paymentType,
      customerPhone: customerProfile.phoneNumber,
      customerEmail: session.user.email,
      description: `Payment for booking ${bookingId}`,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/callback`,
    })
  } catch {
    // Provider call failed — mark payment as FAILED
    await db.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    })
    return { success: false, error: "Payment provider unavailable. Please try again." }
  }

  // ─── PHASE 3: Reconcile Provider Result (short transaction) ────────────────

  if (providerResult.status === "SUCCESS") {
    await db.$transaction(async (tx) => {
      // Update payment to SUCCESS
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCESS", providerRef: providerResult.providerRef },
      })

      // Re-read booking for fresh amountPaid (guards against concurrent writes)
      const booking = await tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
      })

      const totalAmount = Number(booking.totalAmount)
      const depositAmount = Number(booking.depositAmount)
      const currentAmountPaid = Number(booking.amountPaid)

      // Cap at totalAmount to prevent overpayment
      const newAmountPaid = Math.min(currentAmountPaid + amount, totalAmount)

      // Determine if booking should transition
      const shouldConfirm =
        booking.status === "AWAITING_DEPOSIT" && newAmountPaid >= depositAmount

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          amountPaid: newAmountPaid,
          ...(shouldConfirm ? { status: "CONFIRMED" } : {}),
        },
      })
    })

    // ─── Notifications (outside transaction) ───────────────────────────────

    const vendor = await db.vendorProfile.findUniqueOrThrow({
      where: { id: vendorId },
      select: { userId: true },
    })

    await createNotification({
      userId: vendor.userId,
      title: "Payment Received",
      body: `A ${paymentType.toLowerCase()} payment of GH₵ ${amount.toFixed(2)} was received`,
      link: "/dashboard/vendor/payments",
    })

    await createNotification({
      userId: session.user.id,
      title: "Payment Successful",
      body: `Your ${paymentType.toLowerCase()} payment of GH₵ ${amount.toFixed(2)} was processed successfully`,
      link: `/dashboard/customer/bookings/${bookingId}`,
    })

    revalidatePath("/dashboard/customer/bookings")
    revalidatePath("/dashboard/customer/payments")
    revalidatePath("/dashboard/vendor/bookings")
    revalidatePath("/dashboard/vendor/payments")
    return { success: true, paymentId }
  } else {
    // Provider returned FAILED or PENDING
    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: providerResult.status === "PENDING" ? "PENDING" : "FAILED",
        providerRef: providerResult.providerRef,
      },
    })

    if (providerResult.status === "PENDING") {
      // Real providers may return PENDING (awaiting webhook confirmation)
      // For now, treat as success-pending — payment stays PENDING until webhook confirms
      revalidatePath("/dashboard/customer/bookings")
      return { success: true, paymentId }
    }

    return { success: false, error: "Payment failed. Please try again." }
  }
}
