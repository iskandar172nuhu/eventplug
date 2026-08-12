"use client"

import { useState } from "react"
import type { BookingStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared"
import { markBookingCompleteAction, cancelBookingAction } from "@/actions/booking"

interface VendorBookingDetailActionsProps {
  bookingId: string
  status: BookingStatus
}

export function VendorBookingDetailActions({
  bookingId,
  status,
}: VendorBookingDetailActionsProps) {
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"complete" | "cancel" | null>(null)

  const canMarkComplete = status === "IN_PROGRESS"
  const canCancel = status === "CONFIRMED"

  async function handleConfirm() {
    setLoading(true)
    if (confirmAction === "complete") {
      await markBookingCompleteAction(bookingId)
    } else if (confirmAction === "cancel") {
      await cancelBookingAction(bookingId)
    }
    setLoading(false)
    setConfirmAction(null)
  }

  if (!canMarkComplete && !canCancel) {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {canMarkComplete && (
          <Button
            onClick={() => {
              setConfirmAction("complete")
              setConfirmOpen(true)
            }}
            disabled={loading}
          >
            Mark Complete
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              setConfirmAction("cancel")
              setConfirmOpen(true)
            }}
            disabled={loading}
          >
            Cancel Booking
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === "complete" ? "Mark as Complete" : "Cancel Booking"}
        description={
          confirmAction === "complete"
            ? "Are you sure this booking is complete? The customer will be notified and can leave a review."
            : "Are you sure you want to cancel this booking? This action will be flagged for admin review."
        }
        confirmText={confirmAction === "complete" ? "Mark Complete" : "Cancel"}
        variant={confirmAction === "cancel" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />
    </>
  )
}
