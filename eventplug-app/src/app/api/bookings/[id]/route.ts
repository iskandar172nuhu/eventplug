import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"
import { assertValidTransition } from "@/lib/modules/booking/status-machine"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: bookingId } = await params

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { id: true, fullName: true, userId: true } },
      vendor: { select: { id: true, businessName: true, userId: true } },
      bookingItems: true,
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          paymentType: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
        },
      },
      review: { select: { id: true, rating: true } },
      dispute: { select: { id: true, status: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Verify user has access
  const hasAccess =
    session.user.role === "ADMIN" ||
    booking.customer.userId === session.user.id ||
    booking.vendor.userId === session.user.id

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    id: booking.id,
    customerName: booking.customer.fullName,
    vendorName: booking.vendor.businessName,
    eventDate: booking.eventDate.toISOString(),
    eventLocation: booking.eventLocation,
    totalAmount: Number(booking.totalAmount),
    depositAmount: Number(booking.depositAmount),
    amountPaid: Number(booking.amountPaid),
    outstandingAmount: Number(booking.totalAmount) - Number(booking.amountPaid),
    status: booking.status,
    notes: booking.notes,
    items: booking.bookingItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      deliveryCharge: item.deliveryCharge ? Number(item.deliveryCharge) : null,
      setupCharge: item.setupCharge ? Number(item.setupCharge) : null,
    })),
    payments: booking.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentType: p.paymentType,
      paymentMethod: p.paymentMethod,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    })),
    review: booking.review
      ? { id: booking.review.id, rating: booking.review.rating }
      : null,
    dispute: booking.dispute
      ? { id: booking.dispute.id, status: booking.dispute.status }
      : null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: bookingId } = await params
  const body = await request.json()
  const { status: newStatus } = body

  if (!newStatus || !Object.values(BookingStatus).includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: { select: { userId: true } },
      vendor: { select: { userId: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  // Verify user has access to update this booking
  const hasAccess =
    session.user.role === "ADMIN" ||
    booking.customer.userId === session.user.id ||
    booking.vendor.userId === session.user.id

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Validate the status transition
  try {
    assertValidTransition(booking.status, newStatus as BookingStatus)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid status transition"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Apply the update
  const updated = await db.booking.update({
    where: { id: bookingId },
    data: { status: newStatus as BookingStatus },
  })

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updatedAt.toISOString(),
  })
}
