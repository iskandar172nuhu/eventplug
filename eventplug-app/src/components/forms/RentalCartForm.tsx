"use client"

import * as React from "react"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { useCart } from "@/lib/cart/cart-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { EmptyState } from "@/components/shared/EmptyState"

interface RentalCartFormProps {
  onProceedToCheckout?: () => void
}

export function RentalCartForm({ onProceedToCheckout }: RentalCartFormProps) {
  const { cartItems, removeItem, updateQuantity, cartTotal } = useCart()

  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse rental items and add them to your cart to get started."
        icon={<ShoppingCart />}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-center">Delivery</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems.map((item) => {
              const lineTotal =
                item.unitPrice * item.quantity +
                (item.deliveryPreference === "delivery" ? item.deliveryCharge : 0)

              return (
                <TableRow key={item.rentalItemId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.vendorName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.rentalItemId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          updateQuantity(item.rentalItemId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={item.unitPrice} />
                  </TableCell>
                  <TableCell>
                    <DeliveryToggle item={item} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <CurrencyDisplay amount={lineTotal} />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.rentalItemId)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-right font-semibold">
                Grand Total
              </TableCell>
              <TableCell className="text-right font-bold">
                <CurrencyDisplay amount={cartTotal} />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={cartItems.length === 0}
          onClick={onProceedToCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}

function DeliveryToggle({
  item,
}: {
  item: { rentalItemId: string; deliveryPreference: "delivery" | "pickup"; deliveryCharge: number }
}) {
  const { cartItems, removeItem, addItem } = useCart()

  // We need a way to toggle delivery preference. We'll update the item in place
  // by removing and re-adding with the new preference.
  const currentItem = cartItems.find((i) => i.rentalItemId === item.rentalItemId)
  if (!currentItem) return null

  const isDelivery = currentItem.deliveryPreference === "delivery"

  function handleToggle(checked: boolean) {
    if (!currentItem) return
    // Update preference by removing and re-adding
    const updatedItem = {
      ...currentItem,
      deliveryPreference: checked ? "delivery" as const : "pickup" as const,
    }
    removeItem(currentItem.rentalItemId)
    // Use setTimeout to avoid state conflict
    setTimeout(() => {
      addItem(updatedItem)
    }, 0)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Switch
        checked={isDelivery}
        onCheckedChange={handleToggle}
        aria-label="Delivery toggle"
      />
      <span className="text-xs text-muted-foreground">
        {isDelivery ? "Delivery" : "Pickup"}
      </span>
      {isDelivery && item.deliveryCharge > 0 && (
        <span className="text-xs text-muted-foreground">
          +<CurrencyDisplay amount={item.deliveryCharge} />
        </span>
      )}
    </div>
  )
}
