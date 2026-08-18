import { Star, MessageSquare } from "lucide-react"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { EmptyState } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ReviewForm } from "./review-form"

export default async function CustomerReviewsPage() {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  // Fetch submitted reviews
  const reviews = await db.review.findMany({
    where: { customerId: customerProfile.id },
    include: {
      vendor: { select: { businessName: true, slug: true } },
      booking: { select: { eventDate: true, eventLocation: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Fetch completed bookings that have not been reviewed yet
  const eligibleBookings = await db.booking.findMany({
    where: {
      customerId: customerProfile.id,
      status: "COMPLETED",
      review: null,
    },
    include: {
      vendor: { select: { businessName: true, slug: true } },
    },
    orderBy: { eventDate: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Reviews</h2>
        <p className="text-muted-foreground">
          View your submitted reviews and leave feedback for completed bookings
        </p>
      </div>

      {/* Eligible for review */}
      {eligibleBookings.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Ready for Review</h3>
          <div className="grid gap-4">
            {eligibleBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {booking.vendor.businessName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        {booking.eventLocation}
                      </p>
                    </div>
                    <ReviewForm bookingId={booking.id} vendorName={booking.vendor.businessName} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {eligibleBookings.length > 0 && reviews.length > 0 && <Separator />}

      {/* Submitted reviews */}
      {reviews.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Your Reviews</h3>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {review.vendor.businessName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <p className="text-sm">{review.reviewText}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(review.booking.eventDate).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>·</span>
                    <span>{review.booking.eventLocation}</span>
                    <span>·</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : eligibleBookings.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Once you complete a booking, you'll be able to leave a review for the vendor here."
          icon={<MessageSquare />}
        />
      ) : null}
    </div>
  )
}
