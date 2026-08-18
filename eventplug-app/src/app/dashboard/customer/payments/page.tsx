import { CreditCard } from "lucide-react"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { EmptyState, CurrencyDisplay } from "@/components/shared"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function statusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
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

function paymentTypeLabel(type: string) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit"
    case "FULL":
      return "Full Payment"
    case "BALANCE":
      return "Balance"
    default:
      return type
  }
}

export default async function CustomerPaymentsPage() {
  const session = await requireAuth("CUSTOMER")
  const customerProfile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const payments = await db.payment.findMany({
    where: {
      booking: { customerId: customerProfile.id },
    },
    include: {
      booking: {
        select: {
          id: true,
          eventDate: true,
          vendor: { select: { businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (payments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground">
            Track all payments made for your event bookings
          </p>
        </div>
        <EmptyState
          title="No payments yet"
          description="Payments will appear here once you make a deposit or payment for a booking."
          icon={<CreditCard />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
        <p className="text-muted-foreground">
          Track all payments made for your event bookings
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
                      {payment.booking.vendor.businessName}
                    </p>
                    {statusBadge(payment.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{paymentTypeLabel(payment.paymentType)}</span>
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
