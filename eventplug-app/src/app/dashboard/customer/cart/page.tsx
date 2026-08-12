"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCart } from "@/lib/cart/cart-context"
import { createRentalBookingAction } from "@/actions/booking"
import { RentalCartForm } from "@/components/forms/RentalCartForm"

export default function CustomerCartPage() {
  const router = useRouter()
  const { cartItems, clearCart } = useCart()
  const [processing, setProcessing] = React.useState(false)

  async function handleProceedToCheckout() {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    setProcessing(true)
    try {
      const result = await createRentalBookingAction(cartItems)
      if (result.success) {
        clearCart()
        toast.success("Booking created successfully!")
        router.push("/dashboard/customer/bookings")
      } else {
        toast.error(result.error || "Failed to create booking")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create booking"
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Cart</h2>
      {processing && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          Processing your booking... Please wait.
        </div>
      )}
      <RentalCartForm onProceedToCheckout={handleProceedToCheckout} />
    </div>
  )
}
