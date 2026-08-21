"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { DisputeSchema } from "@/lib/validations/dispute"
import { assertValidTransition } from "@/lib/modules/booking/status-machine"
import { createNotification } from "@/lib/modules/notifications/create"
import { revalidatePath } from "next/cache"

export async function raiseDisputeAction(formData: FormData) {
  const session = await requireAuth()

  const raw = Object.fromEntries(formData)
  const evidenceUrls = formData.getAll("evidenceUrls") as string[]
  const parsed = DisputeSchema.safeParse({ ...raw, evidenceUrls })
  if (!parsed.success) return { success: false, error: "Validation failed" }

  const { bookingId, disputeType, description } = parsed.data
  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      vendor: { select: { userId: true, businessName: true } },
    },
  })

  // Validate transition
  assertValidTransition(booking.status, "DISPUTED")

  await db.dispute.create({
    data: {
      bookingId,
      vendorId: booking.vendorId,
      raisedBy: session.user.id,
      disputeType,
      description,
      evidenceUrls: evidenceUrls,
      status: "OPEN",
    },
  })

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "DISPUTED" },
  })

  // Notify the vendor about the dispute
  await createNotification({
    userId: booking.vendor.userId,
    title: "Dispute Raised",
    body: `A dispute has been raised on booking #${bookingId.slice(-8)}: ${disputeType.replace(/_/g, " ").toLowerCase()}`,
    link: `/dashboard/vendor/bookings/${bookingId}`,
  })

  revalidatePath("/dashboard/admin/disputes")
  revalidatePath("/dashboard/customer/bookings")
  revalidatePath("/dashboard/vendor/bookings")
  return { success: true }
}

export async function resolveDisputeAction(
  disputeId: string,
  outcome: "CUSTOMER_FAVOUR" | "VENDOR_FAVOUR" | "MUTUAL_RESOLUTION",
  resolutionNote: string,
  bookingOutcome: "COMPLETED" | "CANCELLED"
) {
  await requireAuth("ADMIN")

  const dispute = await db.dispute.findUniqueOrThrow({
    where: { id: disputeId },
    include: {
      booking: {
        include: {
          customer: { select: { userId: true } },
        },
      },
    },
  })

  await db.dispute.update({
    where: { id: disputeId },
    data: { outcome, resolutionNote, status: "RESOLVED" },
  })

  // Transition booking based on admin decision
  assertValidTransition(dispute.booking.status, bookingOutcome)
  await db.booking.update({
    where: { id: dispute.bookingId },
    data: { status: bookingOutcome },
  })

  // Notify the customer about the dispute resolution
  await createNotification({
    userId: dispute.booking.customer.userId,
    title: "Dispute Resolved",
    body: `Your dispute on booking #${dispute.bookingId.slice(-8)} has been resolved: ${outcome.replace(/_/g, " ").toLowerCase()}`,
    link: `/dashboard/customer/bookings/${dispute.bookingId}`,
  })

  revalidatePath("/dashboard/admin/disputes")
  revalidatePath("/dashboard/customer/bookings")
  revalidatePath("/dashboard/vendor/bookings")
  return { success: true }
}
