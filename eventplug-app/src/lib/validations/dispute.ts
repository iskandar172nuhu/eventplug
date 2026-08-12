import { z } from "zod"

export const DisputeTypeEnum = z.enum([
  "VENDOR_NO_SHOW",
  "ITEM_NOT_DELIVERED",
  "QUALITY_ISSUE",
  "PAYMENT_ISSUE",
  "OTHER",
])

export const DisputeSchema = z.object({
  bookingId: z.string().min(1),
  disputeType: DisputeTypeEnum,
  description: z.string().min(20, "Please provide a detailed description").max(2000),
  evidenceUrls: z.array(z.string().url()).max(5, "Maximum 5 evidence images").optional(),
})

export type DisputeInput = z.infer<typeof DisputeSchema>
