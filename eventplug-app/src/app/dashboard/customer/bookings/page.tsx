import { redirect } from "next/navigation"
import Link from "next/link"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"
import { CurrencyDisplay } from "@/components/shared"
import { EmptyState } from "@/components/shared"

export default async function CustomerBookingsPage() {
  const session = await getSession()
  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login")
  }

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    redirect("/login")
  }

  const bookings = await db.booking.findMany({
    where: { customerId: customerProfile.id },
    include: {
      vendor: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        description="Your bookings will appear here once you book a vendor."
      />
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Bookings</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/dashboard/customer/bookings/${booking.id}`}
          >
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{booking.vendor.businessName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.eventLocation}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <BookingStatusBadge status={booking.status} />
                    <CurrencyDisplay
                      amount={booking.totalAmount.toString()}
                      className="text-sm font-medium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
