import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"
import { reserveInventory } from "@/lib/modules/inventory/reserve"

const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status") as BookingStatus | null
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))

  // Build where clause scoped by role
  let where: Record<string, unknown> = {}

  if (session.user.role === "CUSTOMER") {
    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!customerProfile) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
    }
    where = { customerId: customerProfile.id }
  } else if (session.user.role === "VENDOR") {
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!vendorProfile) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 })
    }
    where = { vendorId: vendorProfile.id }
  }
  // Admin sees all - where remains empty

  if (status) {
    where.status = status
  }

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: { select: { fullName: true } },
        vendor: { select: { businessName: true } },
        bookingItems: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    }),
    db.booking.count({ where }),
  ])

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      customerName: b.customer.fullName,
      vendorName: b.vendor.businessName,
      eventDate: b.eventDate.toISOString(),
      eventLocation: b.eventLocation,
      totalAmount: Number(b.totalAmount),
      depositAmount: Number(b.depositAmount),
      amountPaid: Number(b.amountPaid),
      status: b.status,
      items: b.bookingItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      createdAt: b.createdAt.toISOString(),
    })),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Only customers can create bookings" }, { status: 403 })
  }

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!customerProfile) {
    return NextResponse.json({ error: "Customer profile not found" }, { status: 404 })
  }

  const body = await request.json()
  const { items } = body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart items are required" }, { status: 400 })
  }

  // Validate cart items structure
  for (const item of items) {
    if (!item.rentalItemId || !item.eventDate || !item.quantity || !item.vendorId) {
      return NextResponse.json(
        { error: "Each item must have rentalItemId, eventDate, quantity, and vendorId" },
        { status: 400 }
      )
    }
  }

  // Group items by vendorId
  const itemsByVendor = new Map<string, typeof items>()
  for (const item of items) {
    const existing = itemsByVendor.get(item.vendorId) || []
    existing.push(item)
    itemsByVendor.set(item.vendorId, existing)
  }

  const bookingIds: string[] = []

  try {
    for (const [vendorId, vendorItems] of itemsByVendor) {
      const booking = await db.$transaction(async (tx) => {
        let totalAmount = 0
        const bookingItemsData = []

        for (const item of vendorItems) {
          const eventDate = new Date(item.eventDate)

          // Fetch rental item for pricing
          const rentalItem = await tx.rentalItem.findUnique({
            where: { id: item.rentalItemId },
            select: {
              pricePerUnit: true,
              deliveryAvailable: true,
              deliveryCharge: true,
              name: true,
              serviceLocation: true,
            },
          })

          if (!rentalItem) {
            throw new Error(`Rental item ${item.rentalItemId} not found`)
          }

          await reserveInventory(tx, item.rentalItemId, eventDate, item.quantity)

          const unitPrice = Number(rentalItem.pricePerUnit)
          const lineTotal = unitPrice * item.quantity
          const deliveryCharge =
            item.deliveryPreference === "delivery" && rentalItem.deliveryAvailable
              ? Number(rentalItem.deliveryCharge || 0)
              : 0
          totalAmount += lineTotal + deliveryCharge

          bookingItemsData.push({
            rentalItemId: item.rentalItemId,
            description: rentalItem.name,
            quantity: item.quantity,
            unitPrice,
            totalPrice: lineTotal,
            deliveryCharge: deliveryCharge > 0 ? deliveryCharge : null,
          })
        }

        const depositAmount = Math.ceil(totalAmount * 0.3)
        const firstItem = vendorItems[0]

        // Get service location from first rental item
        const firstRentalItem = await tx.rentalItem.findUnique({
          where: { id: firstItem.rentalItemId },
          select: { serviceLocation: true },
        })

        const created = await tx.booking.create({
          data: {
            customerId: customerProfile.id,
            vendorId,
            eventDate: new Date(firstItem.eventDate),
            eventLocation: firstRentalItem?.serviceLocation || "",
            totalAmount,
            depositAmount,
            status: "AWAITING_DEPOSIT",
            bookingItems: { createMany: { data: bookingItemsData } },
          },
        })

        return created
      })

      bookingIds.push(booking.id)
    }

    return NextResponse.json({ bookingIds }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create booking"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
