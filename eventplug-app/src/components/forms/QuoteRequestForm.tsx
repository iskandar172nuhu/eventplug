"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { QuoteRequestSchema, type QuoteRequestInput } from "@/lib/validations/quote"
import { submitQuoteRequestAction } from "@/actions/quote"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Funeral",
  "Graduation",
  "Conference",
  "Other",
] as const

const GHANA_CITIES = [
  "Accra",
  "Kumasi",
  "Cape Coast",
  "Takoradi",
  "Tamale",
  "Sunyani",
  "Ho",
  "Koforidua",
  "Tema",
  "Obuasi",
  "Techiman",
  "Wa",
  "Bolgatanga",
] as const

interface QuoteRequestFormProps {
  vendorId: string
  onSuccess?: () => void
}

export function QuoteRequestForm({ vendorId, onSuccess }: QuoteRequestFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [inspirationUrls, setInspirationUrls] = React.useState<string[]>([])

  const form = useForm<QuoteRequestInput>({
    resolver: zodResolver(QuoteRequestSchema),
    defaultValues: {
      vendorId,
      eventType: "",
      eventLocation: "",
      guestCount: 1,
      description: "",
      budget: undefined,
      notes: "",
      inspirationUrls: [],
    },
  })

  async function onSubmit(data: QuoteRequestInput) {
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.set("vendorId", data.vendorId)
      formData.set("eventType", data.eventType)
      formData.set("eventDate", data.eventDate.toISOString())
      formData.set("eventLocation", data.eventLocation)
      formData.set("guestCount", String(data.guestCount))
      formData.set("description", data.description)
      if (data.budget) formData.set("budget", String(data.budget))
      if (data.notes) formData.set("notes", data.notes)
      if (data.inspirationUrls) {
        for (const url of data.inspirationUrls) {
          formData.append("inspirationUrls", url)
        }
      }

      const result = await submitQuoteRequestAction(formData)
      if (result.success) {
        toast.success("Quote request submitted successfully!")
        form.reset()
        setInspirationUrls([])
        onSuccess?.()
      } else {
        toast.error(result.error || "Failed to submit quote request")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  function addInspirationUrl() {
    if (inspirationUrls.length >= 5) return
    setInspirationUrls((prev) => [...prev, ""])
  }

  function removeInspirationUrl(index: number) {
    setInspirationUrls((prev) => prev.filter((_, i) => i !== index))
    const currentUrls = form.getValues("inspirationUrls") || []
    form.setValue(
      "inspirationUrls",
      currentUrls.filter((_, i) => i !== index)
    )
  }

  function updateInspirationUrl(index: number, value: string) {
    setInspirationUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
    const currentUrls = [...(form.getValues("inspirationUrls") || [])]
    currentUrls[index] = value
    form.setValue("inspirationUrls", currentUrls)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="eventDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Event Date</FormLabel>
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
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
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

        <FormField
          control={form.control}
          name="eventLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Location</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GHANA_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
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
          name="guestCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your event requirements..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (GH₵) — Optional</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 5000"
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes — Optional</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Inspiration Images — Optional (up to 5)
            </label>
            {inspirationUrls.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInspirationUrl}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add URL
              </Button>
            )}
          </div>
          {inspirationUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => updateInspirationUrl(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInspirationUrl(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Quote Request"}
        </Button>
      </form>
    </Form>
  )
}
