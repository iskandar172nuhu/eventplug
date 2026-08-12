"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared"
import { cancelBookingAction } from "@/actions/booking"

interface CustomerBookingDetailActionsProps {
  bookingId: string
  canCancel: boolean
  canDispute: boolean
  canReview: boolean
  canPayDeposit: boolean
}

export function CustomerBookingDetailActions({
  bookingId,
  canCancel,
  canDispute,
  canReview,
  canPayDeposit,
}: CustomerBookingDetailActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    await cancelBookingAction(bookingId)
    setLoading(false)
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {canPayDeposit && (
          <Button asChild>
            <Link href={`/dashboard/customer/bookings/${bookingId}/pay`}>
              Pay Deposit
            </Link>
          </Button>
        )}
        {canReview && (
          <Button variant="outline">
            Write a Review
          </Button>
        )}
        {canDispute && (
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            Raise Dispute
          </Button>
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
        description="Are you sure you want to cancel this booking? This action cannot be undone and you may forfeit any deposit paid."
        confirmText="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </>
  )
}
