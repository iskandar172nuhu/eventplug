import { redirect } from "next/navigation"
import Link from "next/link"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"
import { CurrencyDisplay, EmptyState } from "@/components/shared"
import { VendorBookingActions } from "./booking-actions"

export default async function VendorBookingsPage() {
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

  const bookings = await db.booking.findMany({
    where: { vendorId: vendorProfile.id },
    include: {
      customer: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        description="Your bookings will appear here when customers book your services."
      />
    )
  }

  const serializedBookings = bookings.map((booking) => ({
    id: booking.id,
    customerName: booking.customer.fullName,
    eventDate: booking.eventDate.toISOString(),
    eventLocation: booking.eventLocation,
    totalAmount: booking.totalAmount.toString(),
    status: booking.status,
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bookings</h2>
      <VendorBookingActions bookings={serializedBookings} />
    </div>
  )
}
