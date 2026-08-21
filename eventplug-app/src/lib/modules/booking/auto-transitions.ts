import { db } from "@/lib/db"
import { createNotification } from "@/lib/modules/notifications/create"

export async function autoTransitionBookings() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find bookings that will be transitioned so we can notify
  const bookingsToTransition = await db.booking.findMany({
    where: {
      status: "CONFIRMED",
      eventDate: { lte: today },
    },
    select: {
      id: true,
      customer: { select: { userId: true } },
      vendor: { select: { userId: true, businessName: true } },
    },
  })

  const result = await db.booking.updateMany({
    where: {
      status: "CONFIRMED",
      eventDate: { lte: today },
    },
    data: { status: "IN_PROGRESS" },
  })

  // Notify both customer and vendor for each transitioned booking
  for (const booking of bookingsToTransition) {
    await createNotification({
      userId: booking.customer.userId,
      title: "Booking In Progress",
      body: `Your booking with ${booking.vendor.businessName} is now in progress`,
      link: `/dashboard/customer/bookings/${booking.id}`,
    })

    await createNotification({
      userId: booking.vendor.userId,
      title: "Booking In Progress",
      body: `Booking #${booking.id.slice(-8)} is now in progress`,
      link: `/dashboard/vendor/bookings/${booking.id}`,
    })
  }

  return { transitioned: result.count }
}
