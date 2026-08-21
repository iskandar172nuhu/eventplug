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
          <Button variant="outline">
            Write a Review
          </Button>
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
