"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { QuoteRequestSchema, QuotationSchema } from "@/lib/validations/quote"
import { createQuoteConversation } from "@/lib/modules/messaging/conversations"
import { revalidatePath } from "next/cache"

type ActionResult =
  | { success: true; quoteRequestId?: string; bookingId?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function submitQuoteRequestAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const raw = Object.fromEntries(formData)
  const inspirationUrls = formData.getAll("inspirationUrls") as string[]
  const parsed = QuoteRequestSchema.safeParse({
    ...raw,
    inspirationUrls,
    guestCount: Number(raw.guestCount),
    budget: raw.budget ? Number(raw.budget) : undefined,
  })
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const quoteRequest = await db.quoteRequest.create({
    data: {
      customerId: customerProfile.id,
      vendorId: parsed.data.vendorId,
      eventType: parsed.data.eventType,
      eventDate: parsed.data.eventDate,
      eventLocation: parsed.data.eventLocation,
      guestCount: parsed.data.guestCount,
      description: parsed.data.description,
      budget: parsed.data.budget,
      notes: parsed.data.notes,
      inspirationUrls: parsed.data.inspirationUrls ?? [],
      status: "PENDING",
    },
  })

  // Create linked conversation
  const vendor = await db.vendorProfile.findUniqueOrThrow({
    where: { id: parsed.data.vendorId },
  })
  await createQuoteConversation(quoteRequest.id, customerProfile.id, vendor.id)

  revalidatePath("/dashboard/customer/quotes")
  revalidatePath("/dashboard/vendor/quotes")
  return { success: true, quoteRequestId: quoteRequest.id }
}

export async function submitQuotationAction(formData: FormData): Promise<ActionResult> {
  await requireAuth("VENDOR")

  const raw = Object.fromEntries(formData)
  const parsed = QuotationSchema.safeParse({
    ...raw,
    totalPrice: Number(raw.totalPrice),
    depositRequired: Number(raw.depositRequired),
    travelFee: raw.travelFee ? Number(raw.travelFee) : undefined,
    itemisedDetails: JSON.parse(raw.itemisedDetails as string),
    extras: raw.extras ? JSON.parse(raw.extras as string) : undefined,
  })
  if (!parsed.success) {
    return { success: false, error: "Validation failed" }
  }

  await db.quotation.create({ data: { ...parsed.data, status: "SENT" } })
  await db.quoteRequest.update({
    where: { id: parsed.data.quoteRequestId },
    data: { status: "SENT" },
  })

  revalidatePath("/dashboard/customer/quotes")
  revalidatePath("/dashboard/vendor/quotes")
  return { success: true }
}

export async function acceptQuotationAction(quotationId: string): Promise<ActionResult> {
  await requireAuth("CUSTOMER")

  const quotation = await db.quotation.findUniqueOrThrow({
    where: { id: quotationId },
    include: { quoteRequest: true },
  })

  // Create booking from accepted quotation
  const booking = await db.booking.create({
    data: {
      customerId: quotation.quoteRequest.customerId,
      vendorId: quotation.quoteRequest.vendorId,
      quotationId: quotation.id,
      eventDate: quotation.quoteRequest.eventDate,
      eventLocation: quotation.quoteRequest.eventLocation,
      totalAmount: quotation.totalPrice,
      depositAmount: quotation.depositRequired,
      status: "AWAITING_DEPOSIT",
    },
  })

  await db.quotation.update({
    where: { id: quotationId },
    data: { status: "ACCEPTED" },
  })
  await db.quoteRequest.update({
    where: { id: quotation.quoteRequestId },
    data: { status: "ACCEPTED" },
  })

  revalidatePath("/dashboard/customer/bookings")
  revalidatePath("/dashboard/vendor/bookings")
  return { success: true, bookingId: booking.id }
}

export async function declineQuotationAction(quotationId: string): Promise<ActionResult> {
  await requireAuth("CUSTOMER")

  await db.quotation.update({
    where: { id: quotationId },
    data: { status: "DECLINED" },
  })

  revalidatePath("/dashboard/customer/quotes")
  return { success: true }
}
