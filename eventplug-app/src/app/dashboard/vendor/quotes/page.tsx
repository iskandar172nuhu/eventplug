import Link from "next/link"
import { FileText } from "lucide-react"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { EmptyState, CurrencyDisplay } from "@/components/shared"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function quoteStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>
    case "SENT":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>
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

export default async function VendorQuotesPage() {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const quoteRequests = await db.quoteRequest.findMany({
    where: { vendorId: vendorProfile.id },
    include: {
      customer: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (quoteRequests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quote Requests</h2>
          <p className="text-muted-foreground">
            View and respond to customer quote requests
          </p>
        </div>
        <EmptyState
          title="No quote requests"
          description="Quote requests from customers will appear here. Make sure your services and packages are listed to attract enquiries."
          icon={<FileText />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quote Requests</h2>
        <p className="text-muted-foreground">
          View and respond to customer quote requests
        </p>
      </div>

      <div className="grid gap-4">
        {quoteRequests.map((request) => (
          <Link key={request.id} href={`/dashboard/vendor/quotes/${request.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{request.customer.fullName}</p>
                      {quoteStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{request.eventType}</span>
                      <span>·</span>
                      <span>
                        {new Date(request.eventDate).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span>{request.eventLocation}</span>
                      <span>·</span>
                      <span>{request.guestCount} guests</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {request.budget && (
                      <CurrencyDisplay
                        amount={Number(request.budget)}
                        className="text-sm font-medium shrink-0"
                      />
                    )}
                    <Button variant="outline" size="sm">
                      {request.status === "PENDING" ? "Respond" : "View"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
