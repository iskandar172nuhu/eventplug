import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { AvailabilityCalendar } from "./availability-calendar"

export default async function VendorCalendarPage() {
  const session = await getSession()
  if (!session || session.user.role !== "VENDOR") {
    redirect("/login")
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!vendorProfile) {
    redirect("/login")
  }

  const availabilityRecords = await db.vendorAvailability.findMany({
    where: { vendorId: vendorProfile.id },
  })

  const serializedRecords = availabilityRecords.map((record) => ({
    id: record.id,
    date: record.dayOfWeek !== null ? null : record.date.toISOString().split("T")[0],
    dayOfWeek: record.dayOfWeek,
    isUnavailable: record.isUnavailable,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Availability Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Manage when you are available for bookings. Customers will not be able to
          book you on dates marked as unavailable.
        </p>
      </div>
      <AvailabilityCalendar initialRecords={serializedRecords} />
    </div>
  )
}
