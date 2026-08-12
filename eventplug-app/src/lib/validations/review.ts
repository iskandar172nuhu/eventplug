import { z } from "zod"

export const ReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  reviewText: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be at most 1000 characters"),
})

export type ReviewInput = z.infer<typeof ReviewSchema>
