"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { assertValidTransition } from "@/lib/modules/booking/status-machine"
import { reserveInventory } from "@/lib/modules/inventory/reserve"
import { createNotification } from "@/lib/modules/notifications/create"
import { BookingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import type { CartItem } from "@/lib/cart/cart-context"

type ActionResult = { success: true; bookingId?: string; bookingIds?: string[] } | { success: false; error: string }

export async function updateBookingStatusAction(
  bookingId: string,
  newStatus: BookingStatus
): Promise<ActionResult> {
  await requireAuth()

  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })

  assertValidTransition(booking.status, newStatus)

  await db.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
  })

  revalidatePath("/dashboard/customer/bookings")
  revalidatePath("/dashboard/vendor/bookings")
  return { success: true }
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  const session = await requireAuth()

  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      customer: { select: { userId: true, fullName: true } },
      vendor: { select: { userId: true, businessName: true } },
    },
  })

  // Customers can cancel PENDING/AWAITING_DEPOSIT without approval
  // CONFIRMED cancellation also allowed but triggers vendor notification
  assertValidTransition(booking.status, "CANCELLED")

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })

  // Notify the other party about the cancellation
  if (session.user.role === "CUSTOMER") {
    // Customer cancelled — notify vendor
    await createNotification({
      userId: booking.vendor.userId,
      title: "Booking Cancelled",
      body: `${booking.customer.fullName} cancelled their booking #${bookingId.slice(-8)}`,
      link: `/dashboard/vendor/bookings/${bookingId}`,
    })
  } else if (session.user.role === "VENDOR") {
    // Vendor cancelled — notify customer
    await createNotification({
      userId: booking.customer.userId,
      title: "Booking Cancelled",
      body: `${booking.vendor.businessName} cancelled your booking #${bookingId.slice(-8)}`,
      link: `/dashboard/customer/bookings/${bookingId}`,
    })
  }

  // If vendor cancels a CONFIRMED booking, flag for admin review
  if (booking.status === "CONFIRMED" && session.user.role === "VENDOR") {
    // TODO: Create admin notification for vendor-initiated cancellation
  }

  revalidatePath("/dashboard/customer/bookings")
  revalidatePath("/dashboard/vendor/bookings")
  return { success: true }
}

export async function markBookingCompleteAction(bookingId: string): Promise<ActionResult> {
  await requireAuth("VENDOR")

  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      customer: { select: { userId: true } },
      vendor: { select: { businessName: true } },
    },
  })

  assertValidTransition(booking.status, "COMPLETED")

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
  })

  // Increment vendor's total bookings
  await db.vendorProfile.update({
    where: { id: booking.vendorId },
    data: { totalBookings: { increment: 1 } },
  })

  // Notify customer that booking is completed
  await createNotification({
    userId: booking.customer.userId,
    title: "Booking Completed",
    body: `${booking.vendor.businessName} marked your booking #${bookingId.slice(-8)} as completed. You can now leave a review.`,
    link: `/dashboard/customer/bookings/${bookingId}`,
  })

  revalidatePath("/dashboard/customer/bookings")
  revalidatePath("/dashboard/vendor/bookings")
  return { success: true }
}

export async function createRentalBookingAction(
  cartItems: CartItem[]
): Promise<ActionResult> {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Cart is empty" }
  }

  // Group items by vendorId
  const itemsByVendor = new Map<string, CartItem[]>()
  for (const item of cartItems) {
    const existing = itemsByVendor.get(item.vendorId) || []
    existing.push(item)
    itemsByVendor.set(item.vendorId, existing)
  }

  const bookingIds: string[] = []

  // Create one booking per vendor inside a transaction
  for (const [vendorId, items] of itemsByVendor) {
    const booking = await db.$transaction(async (tx) => {
      let totalAmount = 0
      const bookingItemsData = []

      for (const item of items) {
        const eventDate = new Date(item.eventDate)
        // Reserve inventory
        await reserveInventory(tx, item.rentalItemId, eventDate, item.quantity)

        const lineTotal = item.unitPrice * item.quantity
        const deliveryCharge =
          item.deliveryPreference === "delivery" ? item.deliveryCharge : 0
        totalAmount += lineTotal + deliveryCharge

        bookingItemsData.push({
          rentalItemId: item.rentalItemId,
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: lineTotal,
          deliveryCharge: deliveryCharge > 0 ? deliveryCharge : null,
        })
      }

      const depositAmount = Math.ceil(totalAmount * 0.3) // 30% deposit
      const firstItem = items[0]

      const created = await tx.booking.create({
        data: {
          customerId: customerProfile.id,
          vendorId,
          eventDate: new Date(firstItem.eventDate),
          eventLocation: firstItem.serviceLocation,
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

  revalidatePath("/dashboard/customer/bookings")
  return { success: true, bookingIds }
}
