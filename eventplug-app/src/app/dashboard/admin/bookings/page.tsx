import { redirect } from "next/navigation"
import type { BookingStatus } from "@prisma/client"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { getPaginationArgs } from "@/lib/db/helpers"
import { AdminBookingsList } from "./bookings-list"

interface AdminBookingsPageProps {
  searchParams: Promise<{
    status?: string
    from?: string
    to?: string
    category?: string
    page?: string
  }>
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const params = await searchParams
  const { skip, take, page, pageSize } = getPaginationArgs({
    page: params.page ? parseInt(params.page, 10) : 1,
    pageSize: 20,
  })

  const where: Record<string, unknown> = {}

  if (params.status) {
    where.status = params.status as BookingStatus
  }

  if (params.from || params.to) {
    where.eventDate = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lte: new Date(params.to) } : {}),
    }
  }

  if (params.category) {
    where.vendor = {
      primaryCategoryId: params.category,
    }
  }

  const [bookings, total, categories] = await Promise.all([
    db.booking.findMany({
      where,
      include: {
        customer: { select: { fullName: true } },
        vendor: { select: { businessName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.booking.count({ where }),
    db.vendorCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { displayOrder: "asc" },
    }),
  ])

  const totalPages = Math.ceil(total / pageSize)

  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    customerName: b.customer.fullName,
    vendorName: b.vendor.businessName,
    eventDate: b.eventDate.toISOString(),
    status: b.status,
    totalAmount: b.totalAmount.toString(),
    createdAt: b.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">All Bookings</h2>
      <AdminBookingsList
        bookings={serializedBookings}
        categories={categories}
        currentPage={page}
        totalPages={totalPages}
        total={total}
        filters={{
          status: params.status || "",
          from: params.from || "",
          to: params.to || "",
          category: params.category || "",
        }}
      />
    </div>
  )
}
