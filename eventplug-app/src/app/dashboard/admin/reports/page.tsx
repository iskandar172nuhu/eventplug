import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { AdminReportsClient } from "./reports-client"

interface AdminReportsPageProps {
  searchParams: Promise<{
    from?: string
    to?: string
  }>
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const params = await searchParams
  const from = params.from ? new Date(params.from) : null
  const to = params.to ? new Date(params.to) : null

  const dateFilter = {
    ...(from ? { gte: from } : {}),
    ...(to ? { lte: to } : {}),
  }
  const hasDateFilter = from || to

  // Bookings data
  const bookings = hasDateFilter
    ? await db.booking.findMany({
        where: { createdAt: dateFilter },
        include: {
          customer: { select: { fullName: true } },
          vendor: { select: { businessName: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  // Payments data
  const payments = hasDateFilter
    ? await db.payment.findMany({
        where: { createdAt: dateFilter },
        include: {
          booking: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  // Vendor activity data
  const vendorActivity = hasDateFilter
    ? await db.vendorProfile.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true,
          businessName: true,
          averageRating: true,
          bookingsAsVendor: {
            where: { createdAt: dateFilter },
            select: { totalAmount: true },
          },
        },
      })
    : []

  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    customerName: b.customer.fullName,
    vendorName: b.vendor.businessName,
    eventDate: b.eventDate.toISOString(),
    status: b.status,
    totalAmount: b.totalAmount.toString(),
  }))

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    bookingRef: p.booking.id.slice(0, 8).toUpperCase(),
    amount: p.amount.toString(),
    paymentType: p.paymentType,
    paymentMethod: p.paymentMethod,
    status: p.status,
    date: p.createdAt.toISOString(),
  }))

  const serializedVendorActivity = vendorActivity
    .map((v) => ({
      id: v.id,
      vendorName: v.businessName,
      bookingsCount: v.bookingsAsVendor.length,
      totalEarned: v.bookingsAsVendor
        .reduce((sum, b) => sum + Number(b.totalAmount), 0)
        .toString(),
      avgRating: v.averageRating,
    }))
    .filter((v) => v.bookingsCount > 0)
    .sort((a, b) => b.bookingsCount - a.bookingsCount)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reports</h2>
      <AdminReportsClient
        bookings={serializedBookings}
        payments={serializedPayments}
        vendorActivity={serializedVendorActivity}
        filters={{ from: params.from || "", to: params.to || "" }}
      />
    </div>
  )
}
