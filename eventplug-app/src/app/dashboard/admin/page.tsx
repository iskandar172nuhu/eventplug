import { redirect } from "next/navigation"
import { Users, Store, CalendarCheck, CheckCircle2 } from "lucide-react"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [
    totalCustomers,
    totalApprovedVendors,
    totalBookings,
    completedBookings,
    totalBookingValue,
    popularCategories,
    recentBookings,
    recentReviews,
  ] = await Promise.all([
    db.customerProfile.count(),
    db.vendorProfile.count({ where: { status: "APPROVED" } }),
    db.booking.count(),
    db.booking.count({ where: { status: "COMPLETED" } }),
    db.booking.aggregate({ _sum: { totalAmount: true } }),
    db.vendorCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: { select: { primaryVendors: true } },
      },
      orderBy: { primaryVendors: { _count: "desc" } },
      take: 5,
    }),
    db.booking.findMany({
      include: {
        customer: { select: { fullName: true } },
        vendor: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    db.review.findMany({
      include: {
        customer: { select: { fullName: true } },
        vendor: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])

  const totalValue = totalBookingValue._sum.totalAmount
    ? Number(totalBookingValue._sum.totalAmount)
    : 0

  // Merge recent bookings and reviews into a single feed sorted by date
  const activityFeed = [
    ...recentBookings.map((b) => ({
      id: b.id,
      type: "booking" as const,
      description: `${b.customer.fullName} booked ${b.vendor.businessName}`,
      status: b.status,
      date: b.createdAt,
    })),
    ...recentReviews.map((r) => ({
      id: r.id,
      type: "review" as const,
      description: `${r.customer.fullName} reviewed ${r.vendor.businessName}`,
      rating: r.rating,
      date: r.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={<Users />}
          description="Registered customers"
        />
        <StatCard
          title="Approved Vendors"
          value={totalApprovedVendors}
          icon={<Store />}
          description="Active on platform"
        />
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={<CalendarCheck />}
          description={`${completedBookings} completed`}
        />
        <StatCard
          title="Total Booking Value"
          value={`GH₵${totalValue.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          icon={<CheckCircle2 />}
          description="All-time revenue"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {popularCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <div className="space-y-3">
                {popularCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="font-medium">{cat.name}</span>
                    <Badge variant="secondary">
                      {cat._count.primaryVendors} vendor{cat._count.primaryVendors !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("en-GH", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {item.type === "booking" && (
                      <BookingStatusBadge status={item.status} />
                    )}
                    {item.type === "review" && (
                      <Badge variant="outline">
                        {"★".repeat(item.rating)}
                      </Badge>
                    )}
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
