import { redirect } from "next/navigation"
import Link from "next/link"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyDisplay, EmptyState } from "@/components/shared"
import { QuotationActions } from "./quotation-actions"

const quoteStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SENT: "bg-blue-100 text-blue-800 border-blue-200",
  ACCEPTED: "bg-green-100 text-green-800 border-green-200",
  DECLINED: "bg-red-100 text-red-800 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
}

export default async function CustomerQuotesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login")
  }

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    redirect("/login")
  }

  const quoteRequests = await db.quoteRequest.findMany({
    where: { customerId: customerProfile.id },
    include: {
      vendor: { select: { businessName: true } },
      quotations: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (quoteRequests.length === 0) {
    return (
      <EmptyState
        title="No quote requests"
        description="Request a quote from a vendor to get started."
      />
    )
  }

  const serializedQuoteRequests = quoteRequests.map((qr) => ({
    id: qr.id,
    vendorName: qr.vendor.businessName,
    eventType: qr.eventType,
    eventDate: qr.eventDate.toISOString(),
    eventLocation: qr.eventLocation,
    status: qr.status,
    quotations: qr.quotations.map((q) => ({
      id: q.id,
      totalPrice: q.totalPrice.toString(),
      depositRequired: q.depositRequired.toString(),
      expiresAt: q.expiresAt.toISOString(),
      status: q.status,
    })),
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Quote Requests</h2>
      <QuotationActions quoteRequests={serializedQuoteRequests} />
    </div>
  )
}
