"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { initiatePaymentAction } from "@/actions/payment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { Separator } from "@/components/ui/separator"

interface BookingSummary {
  id: string
  vendorName: string
  eventDate: string
  totalAmount: number
  depositAmount: number
  amountPaid: number
  status: string
}

type PaymentTypeOption = "DEPOSIT" | "FULL" | "BALANCE"

export default function CustomerPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = React.useState<BookingSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [processing, setProcessing] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<PaymentTypeOption>("DEPOSIT")

  React.useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetch(`/api/customer/bookings/${bookingId}/payment-summary`)
        if (res.ok) {
          const data = await res.json()
          setBooking(data)
          // Default to deposit if nothing paid, otherwise balance
          if (data.amountPaid === 0) {
            setSelectedType("DEPOSIT")
          } else if (data.amountPaid >= data.depositAmount) {
            setSelectedType("BALANCE")
          }
        } else {
          toast.error("Failed to load booking details")
        }
      } finally {
        setLoading(false)
      }
    }
    loadBooking()
  }, [bookingId])

  function getPaymentAmount(): number {
    if (!booking) return 0
    const outstanding = booking.totalAmount - booking.amountPaid
    switch (selectedType) {
      case "DEPOSIT":
        return booking.depositAmount
      case "FULL":
        return outstanding
      case "BALANCE":
        return outstanding
      default:
        return 0
    }
  }

  async function handlePayNow() {
    setProcessing(true)
    try {
      const result = await initiatePaymentAction(bookingId, selectedType)
      if (result.success) {
        toast.success("Payment successful!")
        router.push(`/dashboard/customer/bookings/${bookingId}`)
      } else {
        toast.error(result.error || "Payment failed. Please try again.")
      }
    } catch {
      toast.error("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Make Payment</h2>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Make Payment</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Booking not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const outstanding = booking.totalAmount - booking.amountPaid
  const paymentAmount = getPaymentAmount()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Make Payment</h2>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vendor</span>
            <span className="font-medium">{booking.vendorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event Date</span>
            <span>
              {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount</span>
            <CurrencyDisplay amount={booking.totalAmount} className="font-medium" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deposit Required</span>
            <CurrencyDisplay amount={booking.depositAmount} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid</span>
            <CurrencyDisplay amount={booking.amountPaid} className="text-green-600" />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Outstanding</span>
            <CurrencyDisplay amount={outstanding} className="font-semibold text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {booking.amountPaid < booking.depositAmount && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="paymentType"
                  value="DEPOSIT"
                  checked={selectedType === "DEPOSIT"}
                  onChange={() => setSelectedType("DEPOSIT")}
                  className="h-4 w-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">Deposit Payment</p>
                  <p className="text-sm text-muted-foreground">
                    Pay the deposit to confirm your booking
                  </p>
                </div>
                <CurrencyDisplay amount={booking.depositAmount} className="font-semibold" />
              </label>
            )}

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="paymentType"
                value="FULL"
                checked={selectedType === "FULL"}
                onChange={() => setSelectedType("FULL")}
                className="h-4 w-4 accent-primary"
              />
              <div className="flex-1">
                <p className="font-medium">Full Payment</p>
                <p className="text-sm text-muted-foreground">
                  Pay the full outstanding amount
                </p>
              </div>
              <CurrencyDisplay amount={outstanding} className="font-semibold" />
            </label>

            {booking.amountPaid > 0 && booking.amountPaid < booking.totalAmount && (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="paymentType"
                  value="BALANCE"
                  checked={selectedType === "BALANCE"}
                  onChange={() => setSelectedType("BALANCE")}
                  className="h-4 w-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">Balance Payment</p>
                  <p className="text-sm text-muted-foreground">
                    Pay the remaining balance
                  </p>
                </div>
                <CurrencyDisplay amount={outstanding} className="font-semibold" />
              </label>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Amount to Pay</Label>
              <p className="text-sm text-muted-foreground">
                {selectedType === "DEPOSIT" ? "Deposit" : selectedType === "FULL" ? "Full payment" : "Balance"}
              </p>
            </div>
            <CurrencyDisplay amount={paymentAmount} className="text-2xl font-bold" />
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handlePayNow}
            disabled={processing || paymentAmount <= 0}
          >
            {processing ? "Processing..." : "Pay Now (Mock)"}
          </Button>

          {outstanding <= 0 && (
            <p className="text-center text-sm text-green-600 font-medium">
              This booking is fully paid.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
