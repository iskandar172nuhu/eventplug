"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { getPaymentProvider } from "@/lib/payment-providers"
import { PaymentType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/lib/modules/notifications/create"

export async function initiatePaymentAction(
  bookingId: string,
  paymentType: "FULL" | "DEPOSIT" | "BALANCE"
) {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
  })

  if (booking.customerId !== customerProfile.id) {
    return { success: false, error: "Not your booking" }
  }

  // Prevent payment on cancelled bookings
  if (booking.status === "CANCELLED") {
    return { success: false, error: "Cannot pay for a cancelled booking" }
  }

  // Calculate amount based on payment type
  const totalAmount = Number(booking.totalAmount)
  const depositAmount = Number(booking.depositAmount)
  const amountPaid = Number(booking.amountPaid)

  let amount: number
  switch (paymentType) {
    case "FULL":
      amount = totalAmount - amountPaid
      break
    case "DEPOSIT":
      amount = depositAmount
      break
    case "BALANCE":
      amount = totalAmount - amountPaid
      break
    default:
      return { success: false, error: "Invalid payment type" }
  }

  if (amount <= 0) {
    return { success: false, error: "No outstanding amount" }
  }

  // Create pending payment record
  const payment = await db.payment.create({
    data: {
      bookingId,
      amount,
      paymentType: paymentType as PaymentType,
      paymentMethod: "MOCK",
      status: "PENDING",
    },
  })

  // Call payment provider
  const provider = getPaymentProvider()
  const result = await provider.initiatePayment({
    bookingId,
    amount: Math.round(amount * 100), // Convert to pesewas
    currency: "GHS",
    paymentType,
    customerPhone: customerProfile.phoneNumber,
    customerEmail: session.user.email,
    description: `Payment for booking ${bookingId}`,
    callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/callback`,
  })

  if (result.status === "SUCCESS") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCESS", providerRef: result.providerRef },
    })

    const newAmountPaid = amountPaid + amount
    await db.booking.update({
      where: { id: bookingId },
      data: {
        amountPaid: newAmountPaid,
        ...(booking.status === "AWAITING_DEPOSIT" &&
        newAmountPaid >= depositAmount
          ? { status: "CONFIRMED" }
          : {}),
      },
    })

    // Notify vendor about received payment
    const vendor = await db.vendorProfile.findUniqueOrThrow({
      where: { id: booking.vendorId },
      select: { userId: true },
    })
    await createNotification({
      userId: vendor.userId,
      title: "Payment Received",
      body: `A ${paymentType.toLowerCase()} payment of GH₵ ${amount.toFixed(2)} was received`,
      link: "/dashboard/vendor/payments",
    })

    // Notify customer about successful payment
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
    return { success: true, paymentId: payment.id }
  } else {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", providerRef: result.providerRef },
    })
    return { success: false, error: "Payment failed. Please try again." }
  }
}
