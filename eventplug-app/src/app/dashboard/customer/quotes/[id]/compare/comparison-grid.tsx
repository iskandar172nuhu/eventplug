"use client"

import { useState } from "react"
import type { QuoteStatus } from "@prisma/client"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CurrencyDisplay, ConfirmDialog } from "@/components/shared"
import { acceptQuotationAction, declineQuotationAction } from "@/actions/quote"
import { cn } from "@/lib/utils"

interface QuotationItem {
  description: string
  amount: string | number
}

interface SerializedQuotation {
  id: string
  vendorName: string
  totalPrice: string
  itemisedDetails: QuotationItem[]
  extras: QuotationItem[]
  travelFee: string | null
  depositRequired: string
  expiresAt: string
  paymentNotes: string | null
  status: QuoteStatus
}

interface ComparisonGridProps {
  quotations: SerializedQuotation[]
}

export function ComparisonGrid({ quotations }: ComparisonGridProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    quotationId: string
    action: "accept" | "decline"
  } | null>(null)

  // Determine the cheapest price and earliest expiry for highlighting
  const prices = quotations.map((q) => parseFloat(q.totalPrice))
  const cheapestPrice = Math.min(...prices)
  const expiryDates = quotations.map((q) => new Date(q.expiresAt).getTime())
  const earliestExpiry = Math.min(...expiryDates)

  async function handleConfirm() {
    if (!pendingAction) return
    setLoading(pendingAction.quotationId)
    try {
      if (pendingAction.action === "accept") {
        await acceptQuotationAction(pendingAction.quotationId)
        toast.success("Quotation accepted! A booking has been created.")
      } else {
        await declineQuotationAction(pendingAction.quotationId)
        toast.success("Quotation declined.")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(null)
      setPendingAction(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {quotations.map((quotation) => {
          const isCheapest = parseFloat(quotation.totalPrice) === cheapestPrice
          const isEarliestExpiry =
            new Date(quotation.expiresAt).getTime() === earliestExpiry

          return (
            <Card
              key={quotation.id}
              className={cn(
                "flex flex-col",
                isCheapest && "ring-2 ring-green-500"
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{quotation.vendorName}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    quotation.status === "SENT" && "bg-blue-100 text-blue-800 border-blue-200",
                    quotation.status === "ACCEPTED" && "bg-green-100 text-green-800 border-green-200",
                    quotation.status === "DECLINED" && "bg-red-100 text-red-800 border-red-200",
                    quotation.status === "EXPIRED" && "bg-gray-100 text-gray-800 border-gray-200"
                  )}
                >
                  {quotation.status}
                </Badge>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Total Price */}
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <div className="flex items-center gap-2">
                    <CurrencyDisplay
                      amount={quotation.totalPrice}
                      className="text-lg font-bold"
                    />
                    {isCheapest && quotations.length > 1 && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Cheapest
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Itemised Details */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Included Items</p>
                  {quotation.itemisedDetails.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.description}</span>
                      <CurrencyDisplay amount={item.amount} className="font-medium" />
                    </div>
                  ))}
                </div>

                {/* Extras */}
                {quotation.extras.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Extras</p>
                    {quotation.extras.map((extra, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {extra.description}
                        </span>
                        <CurrencyDisplay amount={extra.amount} className="font-medium" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Travel Fee */}
                {quotation.travelFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Travel Fee</span>
                    <CurrencyDisplay amount={quotation.travelFee} className="font-medium" />
                  </div>
                )}

                <Separator />

                {/* Deposit Required */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deposit Required</span>
                  <CurrencyDisplay
                    amount={quotation.depositRequired}
                    className="font-medium"
                  />
                </div>

                {/* Expiry Date */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expires</span>
                  <span
                    className={cn(
                      "font-medium",
                      isEarliestExpiry && quotations.length > 1 && "text-orange-600"
                    )}
                  >
                    {new Date(quotation.expiresAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {isEarliestExpiry && quotations.length > 1 && (
                      <span className="ml-1 text-xs">(earliest)</span>
                    )}
                  </span>
                </div>

                {/* Payment Notes */}
                {quotation.paymentNotes && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Payment Notes</p>
                    <p className="text-xs text-muted-foreground">
                      {quotation.paymentNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {quotation.status === "SENT" && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={loading === quotation.id}
                      onClick={() => {
                        setPendingAction({
                          quotationId: quotation.id,
                          action: "accept",
                        })
                        setConfirmOpen(true)
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      disabled={loading === quotation.id}
                      onClick={() => {
                        setPendingAction({
                          quotationId: quotation.id,
                          action: "decline",
                        })
                        setConfirmOpen(true)
                      }}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          pendingAction?.action === "accept"
            ? "Accept Quotation"
            : "Decline Quotation"
        }
        description={
          pendingAction?.action === "accept"
            ? "Accepting this quotation will create a booking. You will need to pay the deposit to confirm."
            : "Are you sure you want to decline this quotation? The vendor will be notified."
        }
        confirmText={pendingAction?.action === "accept" ? "Accept" : "Decline"}
        variant={pendingAction?.action === "decline" ? "destructive" : "default"}
        onConfirm={handleConfirm}
      />
    </>
  )
}
