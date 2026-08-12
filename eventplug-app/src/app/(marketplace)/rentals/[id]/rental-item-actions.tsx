"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Minus, Plus, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart/cart-context"

interface InventoryRecord {
  eventDate: string
  reservedQty: number
}

interface RentalItemActionsProps {
  item: {
    id: string
    name: string
    vendorId: string
    vendorName: string
    unitPrice: number
    totalQuantity: number
    minOrderQuantity: number
    deliveryAvailable: boolean
    deliveryCharge: number
    serviceLocation: string
    inventory: InventoryRecord[]
  }
}

export function RentalItemActions({ item }: RentalItemActionsProps) {
  const { addItem } = useCart()
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [quantity, setQuantity] = React.useState(item.minOrderQuantity)
  const [deliveryPreference, setDeliveryPreference] = React.useState<
    "delivery" | "pickup"
  >(item.deliveryAvailable ? "delivery" : "pickup")
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  // Calculate available quantity for selected date
  const availableQuantity = React.useMemo(() => {
    if (!date) return item.totalQuantity
    const dateStr = format(date, "yyyy-MM-dd")
    const record = item.inventory.find(
      (inv) => inv.eventDate.startsWith(dateStr)
    )
    const reserved = record?.reservedQty ?? 0
    return item.totalQuantity - reserved
  }, [date, item.inventory, item.totalQuantity])

  function handleAddToCart() {
    if (!date) {
      toast.error("Please select an event date")
      return
    }
    if (quantity < item.minOrderQuantity) {
      toast.error(`Minimum order quantity is ${item.minOrderQuantity}`)
      return
    }
    if (quantity > availableQuantity) {
      toast.error(`Only ${availableQuantity} available on this date`)
      return
    }

    addItem({
      rentalItemId: item.id,
      name: item.name,
      vendorId: item.vendorId,
      vendorName: item.vendorName,
      quantity,
      unitPrice: item.unitPrice,
      eventDate: format(date, "yyyy-MM-dd"),
      deliveryPreference,
      deliveryCharge: item.deliveryCharge,
      serviceLocation: item.serviceLocation,
    })

    toast.success(`${item.name} added to cart`)
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
      <h3 className="font-semibold">Book This Item</h3>

      {/* Date Picker */}
      <div className="space-y-1.5">
        <Label>Event Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select event date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(day) => {
                setDate(day)
                setIsCalendarOpen(false)
              }}
              disabled={(day) => day < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Available Quantity Display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Available quantity:</span>
        <span className={cn("font-medium", availableQuantity === 0 && "text-destructive")}>
          {availableQuantity} units
        </span>
      </div>

      {/* Quantity Input */}
      <div className="space-y-1.5">
        <Label>Quantity (min: {item.minOrderQuantity})</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(item.minOrderQuantity, quantity - 1))}
            disabled={quantity <= item.minOrderQuantity}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val) && val >= 1) setQuantity(val)
            }}
            min={item.minOrderQuantity}
            max={availableQuantity}
            className="text-center w-20"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
            disabled={quantity >= availableQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delivery / Pickup Toggle */}
      {item.deliveryAvailable && (
        <div className="space-y-1.5">
          <Label>Delivery Preference</Label>
          <Select
            value={deliveryPreference}
            onValueChange={(value) =>
              setDeliveryPreference(value as "delivery" | "pickup")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">
                Delivery (GH₵{item.deliveryCharge.toFixed(2)})
              </SelectItem>
              <SelectItem value="pickup">Pickup (free)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleAddToCart}
        disabled={availableQuantity === 0}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {availableQuantity === 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  )
}
