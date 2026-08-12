"use client"

import { useState } from "react"
import type { DisputeType, DisputeStatus } from "@prisma/client"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/shared"
import { resolveDisputeAction } from "@/actions/dispute"

interface DisputeRow {
  id: string
  bookingId: string
  customerName: string
  vendorName: string
  disputeType: DisputeType
  description: string
  evidenceUrls: string[]
  status: DisputeStatus
  createdAt: string
}

interface DisputesListProps {
  disputes: DisputeRow[]
}

const disputeTypeLabels: Record<DisputeType, string> = {
  VENDOR_NO_SHOW: "Vendor No-Show",
  ITEM_NOT_DELIVERED: "Item Not Delivered",
  QUALITY_ISSUE: "Quality Issue",
  PAYMENT_ISSUE: "Payment Issue",
  OTHER: "Other",
}

type DisputeOutcome = "CUSTOMER_FAVOUR" | "VENDOR_FAVOUR" | "MUTUAL_RESOLUTION"
type BookingOutcome = "COMPLETED" | "CANCELLED"

export function DisputesList({ disputes }: DisputesListProps) {
  const [resolveOpen, setResolveOpen] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<DisputeRow | null>(null)
  const [outcome, setOutcome] = useState<DisputeOutcome | "">("")
  const [bookingOutcome, setBookingOutcome] = useState<BookingOutcome | "">("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [loading, setLoading] = useState(false)

  function handleResolveClick(dispute: DisputeRow) {
    setSelectedDispute(dispute)
    setOutcome("")
    setBookingOutcome("")
    setResolutionNote("")
    setResolveOpen(true)
  }

  async function handleSubmitResolution() {
    if (!selectedDispute || !outcome || !bookingOutcome || !resolutionNote.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const result = await resolveDisputeAction(
        selectedDispute.id,
        outcome as DisputeOutcome,
        resolutionNote,
        bookingOutcome as BookingOutcome
      )
      if (result.success) {
        toast.success("Dispute resolved successfully")
        setResolveOpen(false)
      } else {
        toast.error("Failed to resolve dispute")
      }
    } catch {
      toast.error("An error occurred while resolving the dispute")
    } finally {
      setLoading(false)
    }
  }

  if (disputes.length === 0) {
    return (
      <EmptyState
        title="No open disputes"
        description="There are currently no disputes requiring your attention."
      />
    )
  }

  return (
    <>
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <Card key={dispute.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Booking: {dispute.bookingId.slice(0, 8)}...
                </CardTitle>
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  {dispute.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Customer: </span>
                  <span className="text-sm font-medium">{dispute.customerName}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Vendor: </span>
                  <span className="text-sm font-medium">{dispute.vendorName}</span>
                </div>
              </div>

              <div>
                <Badge variant="secondary">{disputeTypeLabels[dispute.disputeType]}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {dispute.description.length > 200
                  ? `${dispute.description.slice(0, 200)}...`
                  : dispute.description}
              </p>

              {dispute.evidenceUrls.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Evidence:</span>
                  <div className="flex flex-wrap gap-2">
                    {dispute.evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-primary hover:underline"
                      >
                        Evidence {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Raised:{" "}
                  {new Date(dispute.createdAt).toLocaleDateString("en-GH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Button size="sm" onClick={() => handleResolveClick(dispute)}>
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Decide the outcome of this dispute and how the booking should be handled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select
                value={outcome}
                onValueChange={(val) => setOutcome(val as DisputeOutcome)}
              >
                <SelectTrigger id="outcome">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER_FAVOUR">Customer&apos;s Favour</SelectItem>
                  <SelectItem value="VENDOR_FAVOUR">Vendor&apos;s Favour</SelectItem>
                  <SelectItem value="MUTUAL_RESOLUTION">Mutual Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingOutcome">Booking Outcome</Label>
              <Select
                value={bookingOutcome}
                onValueChange={(val) => setBookingOutcome(val as BookingOutcome)}
              >
                <SelectTrigger id="bookingOutcome">
                  <SelectValue placeholder="Select booking outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">Complete Booking</SelectItem>
                  <SelectItem value="CANCELLED">Cancel Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolutionNote">Resolution Note</Label>
              <Textarea
                id="resolutionNote"
                placeholder="Describe the resolution and reasoning..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitResolution} disabled={loading}>
              {loading ? "Resolving..." : "Submit Resolution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
