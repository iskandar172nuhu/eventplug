"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/shared"
import { cancelBookingAction } from "@/actions/booking"
import { raiseDisputeAction } from "@/actions/dispute"
import { submitReviewAction } from "@/actions/review"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DISPUTE_TYPES = [
  { value: "VENDOR_NO_SHOW", label: "Vendor No-Show" },
  { value: "ITEM_NOT_DELIVERED", label: "Item Not Delivered" },
  { value: "QUALITY_ISSUE", label: "Quality Issue" },
  { value: "PAYMENT_ISSUE", label: "Payment Issue" },
  { value: "OTHER", label: "Other" },
] as const

interface CustomerBookingDetailActionsProps {
  bookingId: string
  vendorName: string
  canCancel: boolean
  canDispute: boolean
  canReview: boolean
  canPayDeposit: boolean
  canPayBalance: boolean
  amountPaid: number
  totalAmount: number
  totalPayments: number
}

export function CustomerBookingDetailActions({
  bookingId,
  vendorName,
  canCancel,
  canDispute,
  canReview,
  canPayDeposit,
  canPayBalance,
  amountPaid,
  totalAmount,
  totalPayments,
}: CustomerBookingDetailActionsProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [disputeType, setDisputeType] = useState("")
  const [disputeDescription, setDisputeDescription] = useState("")
  const [disputeSubmitting, setDisputeSubmitting] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const isFullyPaid = amountPaid >= totalAmount

  async function handleCancel() {
    setLoading(true)
    await cancelBookingAction(bookingId)
    setLoading(false)
  }

  async function handleDisputeSubmit() {
    if (!disputeType) {
      toast.error("Please select a dispute type")
      return
    }
    if (disputeDescription.length < 20) {
      toast.error("Description must be at least 20 characters")
      return
    }

    setDisputeSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("bookingId", bookingId)
      formData.set("disputeType", disputeType)
      formData.set("description", disputeDescription)

      const result = await raiseDisputeAction(formData)
      if (result.success) {
        toast.success("Dispute raised successfully. An admin will review it shortly.")
        setDisputeOpen(false)
        setDisputeType("")
        setDisputeDescription("")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to raise dispute")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setDisputeSubmitting(false)
    }
  }

  async function handleReviewSubmit() {
    if (reviewRating === 0) {
      toast.error("Please select a rating")
      return
    }
    if (reviewText.length < 10) {
      toast.error("Review must be at least 10 characters")
      return
    }

    setReviewSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("bookingId", bookingId)
      formData.set("rating", String(reviewRating))
      formData.set("reviewText", reviewText)

      const result = await submitReviewAction(formData)
      if (result.success) {
        toast.success("Review submitted!")
        setReviewOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to submit review")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setReviewSubmitting(false)
    }
  }

  const cancelDescription = totalPayments > 0
    ? `This booking has GH₵${totalPayments.toFixed(2)} in successful payments. Cancelling the booking will not automatically refund these payments. Any refund must be handled separately.`
    : "Are you sure you want to cancel this booking? This action cannot be undone and you may forfeit any deposit paid."

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {isFullyPaid && (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Fully Paid
          </Badge>
        )}
        {canPayDeposit && (
          <Button asChild>
            <Link href={`/dashboard/customer/payments/${bookingId}`}>
              Pay Deposit
            </Link>
          </Button>
        )}
        {canPayBalance && (
          <Button asChild>
            <Link href={`/dashboard/customer/payments/${bookingId}`}>
              Pay Balance
            </Link>
          </Button>
        )}
        {canReview && (
          <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Write a Review</Button>
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
                        onClick={() => setReviewRating(star)}
                      >
                        <span className={`text-2xl ${star <= reviewRating ? "text-yellow-400" : "text-muted-foreground/30"}`}>
                          ★
                        </span>
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
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {reviewText.length}/1000 (minimum 10)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit} disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {canDispute && (
          <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                Raise Dispute
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise a Dispute</DialogTitle>
                <DialogDescription>
                  Describe the issue you experienced. An admin will review your dispute.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Dispute Type</Label>
                  <Select value={disputeType} onValueChange={setDisputeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dispute type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISPUTE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Please describe the issue in detail (minimum 20 characters)..."
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {disputeDescription.length}/2000 characters (minimum 20)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDisputeOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisputeSubmit}
                  disabled={disputeSubmitting}
                >
                  {disputeSubmitting ? "Submitting..." : "Raise Dispute"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            disabled={loading}
            onClick={() => setConfirmOpen(true)}
          >
            Cancel Booking
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel Booking"
        description={cancelDescription}
        confirmText="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </>
  )
}
