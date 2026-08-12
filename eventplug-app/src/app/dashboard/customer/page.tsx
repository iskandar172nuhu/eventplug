import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarCheck, FileText, MessageSquare, CalendarDays } from "lucide-react"
import { addDays } from "date-fns"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { getUnreadCount } from "@/lib/modules/messaging/unread"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"

export default async function CustomerDashboardPage() {
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

  const now = new Date()
  const thirtyDaysFromNow = addDays(now, 30)

  const [activeBookingsCount, pendingQuotesCount, unreadMessagesCount, upcomingEvents] =
    await Promise.all([
      db.booking.count({
        where: {
          customerId: customerProfile.id,
          status: { in: ["CONFIRMED", "IN_PROGRESS", "AWAITING_DEPOSIT"] },
        },
      }),
      db.quoteRequest.count({
        where: {
          customerId: customerProfile.id,
          status: "PENDING",
        },
      }),
      getUnreadCount(session.user.id),
      db.booking.findMany({
        where: {
          customerId: customerProfile.id,
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          eventDate: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
        },
        include: {
          vendor: { select: { businessName: true } },
        },
        orderBy: { eventDate: "asc" },
        take: 5,
      }),
    ])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Bookings"
          value={activeBookingsCount}
          icon={<CalendarCheck />}
          description="Confirmed & in progress"
        />
        <StatCard
          title="Pending Quotes"
          value={pendingQuotesCount}
          icon={<FileText />}
          description="Awaiting vendor response"
        />
        <StatCard
          title="Unread Messages"
          value={unreadMessagesCount}
          icon={<MessageSquare />}
          description="New messages"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents.length}
          icon={<CalendarDays />}
          description="Within 30 days"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming events in the next 30 days.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/customer/bookings/${booking.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{booking.vendor.businessName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.eventLocation}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
