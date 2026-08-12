import { Star } from "lucide-react"

interface Review {
  id: string
  rating: number
  reviewText: string
  createdAt: Date | string
  customer: {
    fullName: string
  }
}

interface ReviewsListProps {
  reviews: Review[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const visibleReviews = reviews
    .filter((r) => "isVisible" in r ? (r as Review & { isVisible: boolean }).isVisible : true)
    .slice(0, 10)

  if (visibleReviews.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reviews</h2>
      <div className="space-y-4">
        {visibleReviews.map((review) => {
          const date = new Date(review.createdAt)
          const formattedDate = date.toLocaleDateString("en-GH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })

          return (
            <div
              key={review.id}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
              <p className="text-sm">{review.reviewText}</p>
              <p className="text-xs text-muted-foreground font-medium">
                — {review.customer.fullName}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
