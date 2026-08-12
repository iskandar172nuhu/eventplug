import { db } from "@/lib/db"

export async function autoTransitionBookings() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = await db.booking.updateMany({
    where: {
      status: "CONFIRMED",
      eventDate: { lte: today },
    },
    data: { status: "IN_PROGRESS" },
  })

  return { transitioned: result.count }
}
