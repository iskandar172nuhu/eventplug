import { CreditCard } from "lucide-react"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { EmptyState, CurrencyDisplay } from "@/components/shared"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function statusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Received</Badge>
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>
    case "REFUNDED":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refunded</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function VendorPaymentsPage() {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const payments = await db.payment.findMany({
    where: {
      booking: { vendorId: vendorProfile.id },
    },
    include: {
      booking: {
        select: {
          id: true,
          eventDate: true,
          customer: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">
            Track payments received for your bookings
          </p>
        </div>
        <EmptyState
          title="No payments yet"
          description="Payments from customers will appear here once they pay for bookings."
          icon={<CreditCard />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">
          Track payments received for your bookings
        </p>
      </div>

      <div className="grid gap-4">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {payment.booking.customer.fullName}
                    </p>
                    {statusBadge(payment.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{payment.paymentType === "DEPOSIT" ? "Deposit" : payment.paymentType === "BALANCE" ? "Balance" : "Full"}</span>
                    <span>·</span>
                    <span>
                      {new Date(payment.booking.eventDate).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(payment.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {payment.providerRef && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-xs">{payment.providerRef}</span>
                      </>
                    )}
                  </div>
                </div>
                <CurrencyDisplay
                  amount={Number(payment.amount)}
                  className="text-lg font-semibold shrink-0"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
