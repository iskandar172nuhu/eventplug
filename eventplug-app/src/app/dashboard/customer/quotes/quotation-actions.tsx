"use client"

import { useState } from "react"
import Link from "next/link"
import type { QuoteStatus } from "@prisma/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CurrencyDisplay, ConfirmDialog } from "@/components/shared"
import { acceptQuotationAction, declineQuotationAction } from "@/actions/quote"

const quoteStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SENT: "bg-blue-100 text-blue-800 border-blue-200",
  ACCEPTED: "bg-green-100 text-green-800 border-green-200",
  DECLINED: "bg-red-100 text-red-800 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
}

interface Quotation {
  id: string
  totalPrice: string
  depositRequired: string
  expiresAt: string
  status: QuoteStatus
}

interface QuoteRequest {
  id: string
  vendorName: string
  eventType: string
  eventDate: string
  eventLocation: string
  status: QuoteStatus
  quotations: Quotation[]
}

interface QuotationActionsProps {
  quoteRequests: QuoteRequest[]
}

export function QuotationActions({ quoteRequests }: QuotationActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    quotationId: string
    action: "accept" | "decline"
  } | null>(null)

  async function handleConfirm() {
    if (!pendingAction) return
    setLoading(pendingAction.quotationId)
    if (pendingAction.action === "accept") {
      await acceptQuotationAction(pendingAction.quotationId)
    } else {
      await declineQuotationAction(pendingAction.quotationId)
    }
    setLoading(null)
    setPendingAction(null)
  }

  return (
    <>
      <div className="space-y-6">
        {quoteRequests.map((qr) => (
          <Card key={qr.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{qr.vendorName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {qr.eventType} &middot;{" "}
                    {new Date(qr.eventDate).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    &middot; {qr.eventLocation}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={quoteStatusStyles[qr.status] || ""}
                >
                  {qr.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {qr.quotations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Waiting for vendor to respond with a quotation...
                </p>
              ) : (
                <>
                  {qr.quotations.map((quotation) => (
                    <div
                      key={quotation.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Total:</span>
                            <CurrencyDisplay
                              amount={quotation.totalPrice}
                              className="font-semibold"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Deposit:
                            </span>
                            <CurrencyDisplay
                              amount={quotation.depositRequired}
                              className="text-sm"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Expires:{" "}
                            {new Date(quotation.expiresAt).toLocaleDateString(
                              "en-GH",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={
                              quoteStatusStyles[quotation.status] || ""
                            }
                          >
                            {quotation.status}
                          </Badge>
                          {quotation.status === "SENT" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setPendingAction({
                                    quotationId: quotation.id,
                                    action: "accept",
                                  })
                                  setConfirmOpen(true)
                                }}
                                disabled={loading === quotation.id}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setPendingAction({
                                    quotationId: quotation.id,
                                    action: "decline",
                                  })
                                  setConfirmOpen(true)
                                }}
                                disabled={loading === quotation.id}
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {qr.quotations.length > 1 && (
                    <Link
                      href={`/dashboard/customer/quotes/${qr.id}/compare`}
                      className="text-sm text-brand-primary hover:underline"
                    >
                      Compare quotations →
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
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
