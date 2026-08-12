import { z } from "zod"

export const QuoteRequestSchema = z.object({
  vendorId: z.string().min(1),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.coerce.date({ required_error: "Event date is required" }),
  eventLocation: z.string().min(1, "Event location is required"),
  guestCount: z.number().int().min(1, "Guest count must be at least 1").max(10000),
  description: z.string().min(10, "Please describe your requirements").max(1000),
  budget: z.number().positive("Budget must be positive").optional(),
  notes: z.string().max(500).optional(),
  inspirationUrls: z.array(z.string().url()).max(5, "Maximum 5 inspiration images").optional(),
})

export const QuotationSchema = z.object({
  quoteRequestId: z.string().min(1),
  totalPrice: z.number().positive("Price must be positive"),
  itemisedDetails: z.array(z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
  })).min(1, "At least one line item is required"),
  extras: z.array(z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
  })).optional(),
  travelFee: z.number().min(0).optional(),
  depositRequired: z.number().positive("Deposit amount is required"),
  paymentNotes: z.string().max(500).optional(),
  expiresAt: z.coerce.date({ required_error: "Expiry date is required" }),
})

export type QuoteRequestInput = z.infer<typeof QuoteRequestSchema>
export type QuotationInput = z.infer<typeof QuotationSchema>
