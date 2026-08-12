"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star } from "lucide-react"
import { toast } from "sonner"

import { ReviewSchema, type ReviewInput } from "@/lib/validations/review"
import { submitReviewAction } from "@/actions/review"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  bookingId: string
  onSuccess?: () => void
}

export function ReviewForm({ bookingId, onSuccess }: ReviewFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [hoveredRating, setHoveredRating] = React.useState(0)

  const form = useForm<ReviewInput>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      bookingId,
      rating: 0,
      reviewText: "",
    },
  })

  async function onSubmit(data: ReviewInput) {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.set("bookingId", data.bookingId)
      formData.set("rating", String(data.rating))
      formData.set("reviewText", data.reviewText)

      const result = await submitReviewAction(formData)
      if (result.success) {
        toast.success("Review submitted successfully!")
        form.reset()
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to submit review")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => field.onChange(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          (hoveredRating || field.value) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reviewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience (minimum 10 characters)..."
                  className="min-h-[120px]"
                  maxLength={1000}
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/1000
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  )
}
