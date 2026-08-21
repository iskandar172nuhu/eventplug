"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { submitQuotationAction } from "@/actions/quote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface LineItem {
  description: string
  amount: string
}

interface QuotationFormProps {
  quoteRequestId: string
}

export function QuotationForm({ quoteRequestId }: QuotationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { description: "", amount: "" },
  ])

  function addLineItem() {
    setLineItems([...lineItems, { description: "", amount: "" }])
  }

  function removeLineItem(index: number) {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const total = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    // Validate line items
    const validItems = lineItems.filter((item) => item.description.trim() && parseFloat(item.amount) > 0)
    if (validItems.length === 0) {
      toast.error("Add at least one line item with description and amount")
      setIsSubmitting(false)
      return
    }

    const itemisedDetails = validItems.map((item) => ({
      description: item.description.trim(),
      amount: parseFloat(item.amount),
    }))

    formData.set("quoteRequestId", quoteRequestId)
    formData.set("totalPrice", String(total))
    formData.set("itemisedDetails", JSON.stringify(itemisedDetails))

    const travelFee = formData.get("travelFee") as string
    if (travelFee) {
      formData.set("travelFee", travelFee)
    }

    try {
      const result = await submitQuotationAction(formData)
      if (result.success) {
        toast.success("Quotation sent to customer!")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to send quotation")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Line Items */}
      <div className="space-y-3">
        <Label>Line Items</Label>
        {lineItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                placeholder="Service description"
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
                required
              />
            </div>
            <div className="w-32">
              <Input
                type="number"
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => updateLineItem(index, "amount", e.target.value)}
                min={1}
                step="0.01"
                required
              />
            </div>
            {lineItems.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(index)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
        {total > 0 && (
          <p className="text-sm font-medium">Total: GH₵ {total.toFixed(2)}</p>
        )}
      </div>

      {/* Deposit */}
      <div className="space-y-2">
        <Label htmlFor="depositRequired">Deposit Required (GH₵)</Label>
        <Input
          type="number"
          name="depositRequired"
          placeholder="e.g. 2000"
          min={1}
          step="0.01"
          required
        />
      </div>

      {/* Travel Fee */}
      <div className="space-y-2">
        <Label htmlFor="travelFee">Travel Fee (GH₵, optional)</Label>
        <Input type="number" name="travelFee" placeholder="0" min={0} step="0.01" />
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Quote Valid Until</Label>
        <Input
          type="date"
          name="expiresAt"
          defaultValue={format(addDays(new Date(), 7), "yyyy-MM-dd")}
          min={format(new Date(), "yyyy-MM-dd")}
          required
        />
      </div>

      {/* Payment Notes */}
      <div className="space-y-2">
        <Label htmlFor="paymentNotes">Payment Notes (optional)</Label>
        <Textarea name="paymentNotes" placeholder="Payment terms, accepted methods, etc." rows={2} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Send Quotation"}
      </Button>
    </form>
  )
}
