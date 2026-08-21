"use server"
import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { ReviewSchema } from "@/lib/validations/review"
import { createNotification } from "@/lib/modules/notifications/create"
import { revalidatePath } from "next/cache"

export async function submitReviewAction(formData: FormData) {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({ where: { userId: session.user.id } })

  const raw = Object.fromEntries(formData)
  const parsed = ReviewSchema.safeParse({ ...raw, rating: Number(raw.rating) })
  if (!parsed.success) return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors }

  const { bookingId, rating, reviewText } = parsed.data

  // Verify booking is COMPLETED
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId } })
  if (booking.status !== "COMPLETED") return { success: false, error: "Can only review completed bookings" }
  if (booking.customerId !== customerProfile.id) return { success: false, error: "Not your booking" }

  // Check for existing review
  const existingReview = await db.review.findUnique({ where: { bookingId } })
  if (existingReview) return { success: false, error: "You have already reviewed this booking" }

  // Create review
  await db.review.create({
    data: {
      bookingId,
      customerId: customerProfile.id,
      vendorId: booking.vendorId,
      rating,
      reviewText,
      isVisible: true,
    },
  })

  // Recalculate vendor average rating
  const allReviews = await db.review.findMany({
    where: { vendorId: booking.vendorId, isVisible: true },
    select: { rating: true },
  })
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

  await db.vendorProfile.update({
    where: { id: booking.vendorId },
    data: {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    },
  })

  // Notify vendor about the new review
  const vendor = await db.vendorProfile.findUniqueOrThrow({
    where: { id: booking.vendorId },
    select: { userId: true },
  })
  await createNotification({
    userId: vendor.userId,
    title: "New Review",
    body: `${customerProfile.fullName} left a ${rating}-star review`,
    link: "/dashboard/vendor/reviews",
  })

  revalidatePath(`/vendors/${booking.vendorId}`)
  revalidatePath("/dashboard/customer/reviews")
  revalidatePath("/dashboard/vendor/reviews")
  return { success: true }
}
