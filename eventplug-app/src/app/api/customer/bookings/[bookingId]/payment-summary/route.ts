import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bookingId } = await params

    const customerProfile = await db.customerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!customerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        vendor: { select: { businessName: true } },
      },
    })

    if (!booking || booking.customerId !== customerProfile.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: booking.id,
      vendorName: booking.vendor.businessName,
      eventDate: booking.eventDate.toISOString(),
      totalAmount: Number(booking.totalAmount),
      depositAmount: Number(booking.depositAmount),
      amountPaid: Number(booking.amountPaid),
      status: booking.status,
    })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
