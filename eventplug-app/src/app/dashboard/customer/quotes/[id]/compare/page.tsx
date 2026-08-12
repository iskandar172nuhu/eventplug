import { redirect, notFound } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { ComparisonGrid } from "./comparison-grid"

interface ComparePageProps {
  params: Promise<{ id: string }>
}

export default async function QuoteComparePage({ params }: ComparePageProps) {
  const { id } = await params
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

  const quoteRequest = await db.quoteRequest.findUnique({
    where: { id, customerId: customerProfile.id },
    include: {
      vendor: { select: { businessName: true } },
      quotations: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          quoteRequest: {
            include: {
              vendor: { select: { businessName: true } },
            },
          },
        },
      },
    },
  })

  if (!quoteRequest) {
    notFound()
  }

  const serializedQuotations = quoteRequest.quotations.map((q) => ({
    id: q.id,
    vendorName: q.quoteRequest.vendor.businessName,
    totalPrice: q.totalPrice.toString(),
    itemisedDetails: q.itemisedDetails as Array<{ description: string; amount: string | number }>,
    extras: (q.extras as Array<{ description: string; amount: string | number }>) || [],
    travelFee: q.travelFee?.toString() || null,
    depositRequired: q.depositRequired.toString(),
    expiresAt: q.expiresAt.toISOString(),
    paymentNotes: q.paymentNotes,
    status: q.status,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Compare Quotations</h2>
        <p className="text-sm text-muted-foreground">
          {quoteRequest.vendor.businessName} &middot; {quoteRequest.eventType} &middot;{" "}
          {quoteRequest.eventDate.toLocaleDateString("en-GH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <ComparisonGrid quotations={serializedQuotations} />
    </div>
  )
}
