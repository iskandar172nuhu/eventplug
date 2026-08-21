import { notFound } from "next/navigation"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyDisplay } from "@/components/shared"
import { Separator } from "@/components/ui/separator"
import { QuotationForm } from "./quotation-form"

function quoteStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending Response</Badge>
    case "SENT":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Quote Sent</Badge>
    case "ACCEPTED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
    case "DECLINED":
      return <Badge variant="destructive">Declined</Badge>
    case "EXPIRED":
      return <Badge variant="outline">Expired</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VendorQuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const quoteRequest = await db.quoteRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { fullName: true, phoneNumber: true } },
      quotations: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!quoteRequest || quoteRequest.vendorId !== vendorProfile.id) {
    notFound()
  }

  const canRespond = quoteRequest.status === "PENDING"
  const hasQuotation = quoteRequest.quotations.length > 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quote Request</h2>
          <p className="text-muted-foreground">From {quoteRequest.customer.fullName}</p>
        </div>
        {quoteStatusBadge(quoteRequest.status)}
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Event Type</p>
              <p className="font-medium">{quoteRequest.eventType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Event Date</p>
              <p className="font-medium">
                {new Date(quoteRequest.eventDate).toLocaleDateString("en-GH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{quoteRequest.eventLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guest Count</p>
              <p className="font-medium">{quoteRequest.guestCount} guests</p>
            </div>
            {quoteRequest.budget && (
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <CurrencyDisplay amount={Number(quoteRequest.budget)} className="font-medium" />
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{quoteRequest.customer.fullName}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="text-sm whitespace-pre-wrap">{quoteRequest.description}</p>
          </div>

          {quoteRequest.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Additional Notes</p>
              <p className="text-sm whitespace-pre-wrap">{quoteRequest.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Quotation */}
      {hasQuotation && (
        <Card>
          <CardHeader>
            <CardTitle>Your Quotation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quoteRequest.quotations.map((q) => (
              <div key={q.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    Total: <CurrencyDisplay amount={Number(q.totalPrice)} />
                  </p>
                  <Badge variant="outline">{q.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deposit required: <CurrencyDisplay amount={Number(q.depositRequired)} />
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(q.expiresAt).toLocaleDateString("en-GH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Respond Form */}
      {canRespond && (
        <Card>
          <CardHeader>
            <CardTitle>Send Quotation</CardTitle>
          </CardHeader>
          <CardContent>
            <QuotationForm quoteRequestId={quoteRequest.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
