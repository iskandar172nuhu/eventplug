import { Star, MessageSquare } from "lucide-react"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { EmptyState } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VendorReviewsPage() {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const reviews = await db.review.findMany({
    where: { vendorId: vendorProfile.id, isVisible: true },
    include: {
      customer: { select: { fullName: true } },
      booking: { select: { eventDate: true, eventLocation: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
          <p className="text-muted-foreground">
            See what your customers are saying about your services
          </p>
        </div>
        <EmptyState
          title="No reviews yet"
          description="Customer reviews will appear here once they leave feedback for completed bookings."
          icon={<MessageSquare />}
        />
      </div>
    )
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
          <p className="text-muted-foreground">
            See what your customers are saying about your services
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-lg">{avgRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{review.customer.fullName}</CardTitle>
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
    </div>
  )
}
