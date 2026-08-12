import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarCheck, FileText, MessageSquare, Banknote } from "lucide-react"
import { addDays, startOfMonth } from "date-fns"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { getUnreadCount } from "@/lib/modules/messaging/unread"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"
import { CurrencyDisplay } from "@/components/shared"

export default async function VendorDashboardPage() {
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

  const now = new Date()
  const sevenDaysFromNow = addDays(now, 7)
  const monthStart = startOfMonth(now)

  const [
    activeBookingsCount,
    pendingQuotesCount,
    unreadMessagesCount,
    upcomingBookings,
    monthlyPayments,
  ] = await Promise.all([
    db.booking.count({
      where: {
        vendorId: vendorProfile.id,
        status: { in: ["CONFIRMED", "IN_PROGRESS", "AWAITING_DEPOSIT"] },
      },
    }),
    db.quoteRequest.count({
      where: {
        vendorId: vendorProfile.id,
        status: "PENDING",
      },
    }),
    getUnreadCount(session.user.id),
    db.booking.findMany({
      where: {
        vendorId: vendorProfile.id,
        status: "CONFIRMED",
        eventDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        customer: { select: { fullName: true } },
      },
      orderBy: { eventDate: "asc" },
      take: 5,
    }),
    db.payment.aggregate({
      where: {
        booking: { vendorId: vendorProfile.id },
        status: "SUCCESS",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
  ])

  const monthlyEarnings = monthlyPayments._sum.amount
    ? Number(monthlyPayments._sum.amount)
    : 0

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
          description="Awaiting your response"
        />
        <StatCard
          title="Unread Messages"
          value={unreadMessagesCount}
          icon={<MessageSquare />}
          description="New messages"
        />
        <StatCard
          title="Monthly Earnings"
          value={`GH₵${monthlyEarnings.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          icon={<Banknote />}
          description="This month"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No confirmed bookings in the next 7 days.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/vendor/bookings/${booking.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{booking.customer.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.eventLocation}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-sm text-muted-foreground">
                      {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
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
