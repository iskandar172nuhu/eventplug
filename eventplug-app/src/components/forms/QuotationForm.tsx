"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { QuotationSchema, type QuotationInput } from "@/lib/validations/quote"
import { submitQuotationAction } from "@/actions/quote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface QuotationFormProps {
  quoteRequestId: string
  onSuccess?: () => void
}

export function QuotationForm({ quoteRequestId, onSuccess }: QuotationFormProps) {
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<QuotationInput>({
    resolver: zodResolver(QuotationSchema),
    defaultValues: {
      quoteRequestId,
      totalPrice: 0,
      itemisedDetails: [{ description: "", amount: 0 }],
      extras: [],
      travelFee: undefined,
      depositRequired: 0,
      paymentNotes: "",
      expiresAt: undefined,
    },
  })

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "itemisedDetails",
  })

  const {
    fields: extraFields,
    append: appendExtra,
    remove: removeExtra,
  } = useFieldArray({
    control: form.control,
    name: "extras",
  })

  async function onSubmit(data: QuotationInput) {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.set("quoteRequestId", data.quoteRequestId)
      formData.set("totalPrice", String(data.totalPrice))
      formData.set("itemisedDetails", JSON.stringify(data.itemisedDetails))
      if (data.extras && data.extras.length > 0) {
        formData.set("extras", JSON.stringify(data.extras))
      }
      if (data.travelFee !== undefined) {
        formData.set("travelFee", String(data.travelFee))
      }
      formData.set("depositRequired", String(data.depositRequired))
      if (data.paymentNotes) {
        formData.set("paymentNotes", data.paymentNotes)
      }
      formData.set("expiresAt", data.expiresAt.toISOString())

      const result = await submitQuotationAction(formData)
      if (result.success) {
        toast.success("Quotation submitted successfully!")
        form.reset()
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to submit quotation")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="totalPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Price (GH₵)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Itemised Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Itemised Details</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendItem({ description: "", amount: 0 })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </div>
          {itemFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name={`itemisedDetails.${index}.description`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`itemisedDetails.${index}.amount`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {itemFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Optional Extras */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Optional Extras</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendExtra({ description: "", amount: 0 })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Extra
            </Button>
          </div>
          {extraFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name={`extras.${index}.description`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`extras.${index}.amount`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExtra(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="travelFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Travel Fee (GH₵) — Optional</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 200"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="depositRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deposit Required (GH₵)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Notes — Optional</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. 50% deposit required to confirm booking..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Quotation Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : "Pick expiry date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Quotation"}
        </Button>
      </form>
    </Form>
  )
}
