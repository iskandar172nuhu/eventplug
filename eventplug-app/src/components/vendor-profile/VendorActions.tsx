"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MessageSquare } from "lucide-react"
import { toast } from "sonner"

import { submitQuoteRequestAction } from "@/actions/quote"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VendorActionsProps {
  vendorId: string
  vendorSlug: string
  vendorName: string
  isAuthenticated: boolean
  hasBookableServices: boolean
}

const EVENT_TYPES = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Funeral",
  "Outdooring",
  "Engagement",
  "Anniversary",
  "Graduation",
  "Conference",
  "Other",
]

export function VendorActions({
  vendorId,
  vendorSlug,
  vendorName,
  isAuthenticated,
  hasBookableServices,
}: VendorActionsProps) {
  const router = useRouter()
  const loginRedirect = `/login?callbackUrl=${encodeURIComponent(`/vendors/${vendorSlug}`)}`

  // Quote Request State
  const [quoteOpen, setQuoteOpen] = React.useState(false)
  const [quoteSubmitting, setQuoteSubmitting] = React.useState(false)

  // Message State
  const [messageOpen, setMessageOpen] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [messageSending, setMessageSending] = React.useState(false)

  async function handleQuoteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setQuoteSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.set("vendorId", vendorId)

    try {
      const result = await submitQuoteRequestAction(formData)
      if (result.success) {
        toast.success("Quote request sent! The vendor will respond soon.")
        setQuoteOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to submit quote request")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setQuoteSubmitting(false)
    }
  }

  async function handleMessage() {
    if (!messageText.trim()) {
      toast.error("Please enter a message")
      return
    }
    setMessageSending(true)

    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, message: messageText.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Message sent!")
        setMessageOpen(false)
        setMessageText("")
        router.push(`/dashboard/customer/messages/${data.conversationId}`)
      } else {
        toast.error(data.error || "Failed to send message")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setMessageSending(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {/* Request Quote */}
      {isAuthenticated ? (
        <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
          <DialogTrigger asChild>
            <Button>Request Quote</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request a Quote from {vendorName}</DialogTitle>
              <DialogDescription>
                Tell us about your event and the vendor will send you a custom quote.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select name="eventType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input type="date" name="eventDate" required min={format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventLocation">Event Location</Label>
                <Input name="eventLocation" placeholder="e.g. La Palm Royal Beach Hotel, Accra" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestCount">Number of Guests</Label>
                <Input type="number" name="guestCount" placeholder="200" min={1} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Describe Your Requirements</Label>
                <Textarea
                  name="description"
                  placeholder="Tell us what you need — style preferences, specific requirements, etc."
                  rows={4}
                  required
                  minLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (GH₵, optional)</Label>
                <Input type="number" name="budget" placeholder="5000" min={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea name="notes" placeholder="Any other details..." rows={2} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setQuoteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={quoteSubmitting}>
                  {quoteSubmitting ? "Sending..." : "Send Quote Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <Button asChild>
          <a href={loginRedirect}>Request Quote</a>
        </Button>
      )}

      {/* Book Now — EventPlug uses quote-based booking */}
      {hasBookableServices ? (
        isAuthenticated ? (
          <Button variant="outline" onClick={() => setQuoteOpen(true)}>
            Book Now
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <a href={loginRedirect}>Book Now</a>
          </Button>
        )
      ) : null}

      {/* Message */}
      {isAuthenticated ? (
        <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message {vendorName}</DialogTitle>
              <DialogDescription>
                Start a conversation with this vendor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="messageText">Your Message</Label>
              <Textarea
                id="messageText"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Hi, I'm interested in your services..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMessage} disabled={messageSending}>
                {messageSending ? "Sending..." : "Send Message"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Button variant="ghost" asChild>
          <a href={loginRedirect}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </a>
        </Button>
      )}
    </div>
  )
}
