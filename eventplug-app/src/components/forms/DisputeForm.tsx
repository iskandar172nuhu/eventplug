"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

import { DisputeSchema, type DisputeInput } from "@/lib/validations/dispute"
import { raiseDisputeAction } from "@/actions/dispute"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

interface DisputeFormProps {
  bookingId: string
  onSuccess?: () => void
}

export function DisputeForm({ bookingId, onSuccess }: DisputeFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [evidenceUrls, setEvidenceUrls] = React.useState<string[]>([])

  const form = useForm<DisputeInput>({
    resolver: zodResolver(DisputeSchema),
    defaultValues: {
      bookingId,
      disputeType: undefined,
      description: "",
      evidenceUrls: [],
    },
  })

  async function onSubmit(data: DisputeInput) {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.set("bookingId", data.bookingId)
      formData.set("disputeType", data.disputeType)
      formData.set("description", data.description)
      if (data.evidenceUrls) {
        for (const url of data.evidenceUrls) {
          formData.append("evidenceUrls", url)
        }
      }

      const result = await raiseDisputeAction(formData)
      if (result.success) {
        toast.success("Dispute raised successfully. An admin will review it shortly.")
        form.reset()
        setEvidenceUrls([])
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to raise dispute")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  function addEvidenceUrl() {
    if (evidenceUrls.length >= 5) return
    setEvidenceUrls((prev) => [...prev, ""])
  }

  function removeEvidenceUrl(index: number) {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index))
    const currentUrls = form.getValues("evidenceUrls") || []
    form.setValue(
      "evidenceUrls",
      currentUrls.filter((_, i) => i !== index)
    )
  }

  function updateEvidenceUrl(index: number, value: string) {
    setEvidenceUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
    const currentUrls = [...(form.getValues("evidenceUrls") || [])]
    currentUrls[index] = value
    form.setValue("evidenceUrls", currentUrls)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="disputeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dispute Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dispute type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DISPUTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe the issue in detail (minimum 20 characters)..."
                  className="min-h-[120px]"
                  maxLength={2000}
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/2000
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Evidence URLs — Optional (up to 5)
            </label>
            {evidenceUrls.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEvidenceUrl}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add URL
              </Button>
            )}
          </div>
          {evidenceUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="https://example.com/evidence.jpg"
                value={url}
                onChange={(e) => updateEvidenceUrl(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEvidenceUrl(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" variant="destructive" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Raise Dispute"}
        </Button>
      </form>
    </Form>
  )
}
