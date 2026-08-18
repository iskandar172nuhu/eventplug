"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { submitReviewAction } from "@/actions/review"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ReviewFormProps {
  bookingId: string
  vendorName: string
}

export function ReviewForm({ bookingId, vendorName }: ReviewFormProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [hoverRating, setHoverRating] = React.useState(0)
  const [reviewText, setReviewText] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    if (reviewText.length < 10) {
      toast.error("Review must be at least 10 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("bookingId", bookingId)
      formData.append("rating", String(rating))
      formData.append("reviewText", reviewText)

      const result = await submitReviewAction(formData)
      if (result.success) {
        toast.success("Review submitted!")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to submit review")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Leave Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {vendorName}</DialogTitle>
          <DialogDescription>
            Share your experience with this vendor
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Your Review</Label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/1000 characters (minimum 10)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
