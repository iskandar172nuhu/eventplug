"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/shared"
import { toggleReviewVisibilityAction } from "@/actions/admin"

interface ReviewRow {
  id: string
  customerName: string
  vendorName: string
  rating: number
  reviewText: string
  isVisible: boolean
  createdAt: string
}

interface AdminReviewsListProps {
  reviews: ReviewRow[]
}

export function AdminReviewsList({ reviews }: AdminReviewsListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmReviewId, setConfirmReviewId] = useState<string | null>(null)

  async function handleToggle(reviewId: string, isVisible: boolean) {
    setLoading(reviewId)
    await toggleReviewVisibilityAction(reviewId, isVisible)
    setLoading(null)
    setConfirmReviewId(null)
  }

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No reviews yet.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{review.customerName}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{review.vendorName}</span>
                    <Badge variant="outline" className="text-yellow-700">
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </Badge>
                    {review.isVisible ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {review.reviewText}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {review.isVisible ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      disabled={loading === review.id}
                      onClick={() => setConfirmReviewId(review.id)}
                    >
                      {loading === review.id ? "Hiding..." : "Hide"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading === review.id}
                      onClick={() => handleToggle(review.id, true)}
                    >
                      {loading === review.id ? "Showing..." : "Show"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmReviewId}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmReviewId(null)
          }
        }}
        title="Hide Review"
        description="Are you sure you want to hide this review? It will no longer be visible to customers on the vendor's profile."
        confirmText="Hide Review"
        variant="destructive"
        onConfirm={() => {
          if (confirmReviewId) {
            handleToggle(confirmReviewId, false)
          }
        }}
      />
    </>
  )
}
