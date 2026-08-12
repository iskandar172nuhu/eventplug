import { redirect } from "next/navigation"
import { BarChart3, TrendingUp, Users, Award } from "lucide-react"
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyDisplay } from "@/components/shared"

export default async function VendorAnalyticsPage() {
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
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))

  // Build last 6 months labels
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i)
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
      label: format(date, "MMM"),
    }
  })

  // Fetch bookings by month
  const bookings = await db.booking.findMany({
    where: {
      vendorId: vendorProfile.id,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      id: true,
      createdAt: true,
      totalAmount: true,
      customerId: true,
    },
  })

  const bookingsByMonth = months.map((month) => {
    const count = bookings.filter(
      (b) => b.createdAt >= month.start && b.createdAt <= month.end
    ).length
    return { label: month.label, value: count }
  })

  // Earnings by month from payments
  const payments = await db.payment.findMany({
    where: {
      booking: { vendorId: vendorProfile.id },
      status: "SUCCESS",
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  })

  const earningsByMonth = months.map((month) => {
    const total = payments
      .filter((p) => p.createdAt >= month.start && p.createdAt <= month.end)
      .reduce((sum, p) => sum + Number(p.amount), 0)
    return { label: month.label, value: total }
  })

  // Average rating trend - reviews by month
  const reviews = await db.review.findMany({
    where: {
      vendorId: vendorProfile.id,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      rating: true,
      createdAt: true,
    },
  })

  const ratingByMonth = months.map((month) => {
    const monthReviews = reviews.filter(
      (r) => r.createdAt >= month.start && r.createdAt <= month.end
    )
    const avg =
      monthReviews.length > 0
        ? monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length
        : null
    return { label: month.label, value: avg }
  })

  // Most booked service/item (top 3)
  const bookingItems = await db.bookingItem.findMany({
    where: {
      booking: { vendorId: vendorProfile.id },
    },
    select: {
      description: true,
      quantity: true,
    },
  })

  const itemCounts: Record<string, number> = {}
  for (const item of bookingItems) {
    itemCounts[item.description] = (itemCounts[item.description] || 0) + item.quantity
  }
  const topItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }))

  // Customer repeat rate
  const customerBookingCounts: Record<string, number> = {}
  for (const b of bookings) {
    customerBookingCounts[b.customerId] =
      (customerBookingCounts[b.customerId] || 0) + 1
  }
  const totalCustomers = Object.keys(customerBookingCounts).length
  const repeatCustomers = Object.values(customerBookingCounts).filter(
    (count) => count > 1
  ).length
  const repeatRate =
    totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

  // Top-level totals
  const totalBookingsCount = bookings.length
  const totalEarnings = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  // Find max values for bar chart scaling
  const maxBookings = Math.max(...bookingsByMonth.map((m) => m.value), 1)
  const maxEarnings = Math.max(...earningsByMonth.map((m) => m.value), 1)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings (6mo)"
          value={totalBookingsCount}
          icon={<BarChart3 />}
          description="Last 6 months"
        />
        <StatCard
          title="Total Earnings (6mo)"
          value={`GH₵${totalEarnings.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp />}
          description="Last 6 months"
        />
        <StatCard
          title="Average Rating"
          value={vendorProfile.averageRating.toFixed(1)}
          icon={<Award />}
          description={`${vendorProfile.totalReviews} reviews`}
        />
        <StatCard
          title="Repeat Rate"
          value={`${repeatRate}%`}
          icon={<Users />}
          description={`${repeatCustomers} of ${totalCustomers} customers`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings by Month Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {bookingsByMonth.map((month) => (
                <div key={month.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{month.value}</span>
                  <div
                    className="w-full rounded-t bg-brand-primary transition-all"
                    style={{
                      height: `${(month.value / maxBookings) * 100}%`,
                      minHeight: month.value > 0 ? "4px" : "0px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{month.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Earnings by Month Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Month (GH₵)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {earningsByMonth.map((month) => (
                <div key={month.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">
                    {month.value > 0 ? `${(month.value / 1000).toFixed(1)}k` : "0"}
                  </span>
                  <div
                    className="w-full rounded-t bg-green-500 transition-all"
                    style={{
                      height: `${(month.value / maxEarnings) * 100}%`,
                      minHeight: month.value > 0 ? "4px" : "0px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{month.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Rating Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-2">
              {ratingByMonth.map((month) => (
                <div key={month.label} className="flex flex-col items-center gap-1">
                  <span className="text-lg font-bold">
                    {month.value !== null ? month.value.toFixed(1) : "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">{month.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Booked Service/Item */}
        <Card>
          <CardHeader>
            <CardTitle>Most Booked (Top 3)</CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.count} booked
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
