"use client"

import { useState } from "react"
import Link from "next/link"
import type { BookingStatus } from "@prisma/client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"
import { CurrencyDisplay } from "@/components/shared"
import { updateBookingStatusAction } from "@/actions/booking"

interface BookingRow {
  id: string
  customerName: string
  eventDate: string
  eventLocation: string
  totalAmount: string
  status: BookingStatus
}

interface VendorBookingActionsProps {
  bookings: BookingRow[]
}

export function VendorBookingActions({ bookings }: VendorBookingActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAccept(bookingId: string) {
    setLoading(bookingId)
    await updateBookingStatusAction(bookingId, "AWAITING_DEPOSIT")
    setLoading(null)
  }

  async function handleReject(bookingId: string) {
    setLoading(bookingId)
    await updateBookingStatusAction(bookingId, "CANCELLED")
    setLoading(null)
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/dashboard/vendor/bookings/${booking.id}`}
          className="block"
        >
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.eventLocation}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <CurrencyDisplay
                    amount={booking.totalAmount}
                    className="text-sm font-medium"
                  />
                  {booking.status === "PENDING" && (
                    <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(booking.id)}
                        disabled={loading === booking.id}
                      >
                        {loading === booking.id ? "..." : "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleReject(booking.id)}
                        disabled={loading === booking.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
