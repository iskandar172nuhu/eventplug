import { redirect, notFound } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"
import { CurrencyDisplay } from "@/components/shared"
import { CustomerBookingDetailActions } from "./booking-detail-actions"

interface BookingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
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

  const booking = await db.booking.findUnique({
    where: { id, customerId: customerProfile.id },
    include: {
      vendor: { select: { businessName: true, phoneNumber: true, email: true } },
      bookingItems: {
        include: {
          servicePackage: { select: { name: true } },
          rentalItem: { select: { name: true } },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      review: true,
      dispute: true,
    },
  })

  if (!booking) {
    notFound()
  }

  const canCancel = ["PENDING", "AWAITING_DEPOSIT"].includes(booking.status)
  const canDispute = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(booking.status) && !booking.dispute
  const canReview = booking.status === "COMPLETED" && !booking.review
  const canPayDeposit = booking.status === "AWAITING_DEPOSIT"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{booking.vendor.businessName}</h2>
          <p className="text-sm text-muted-foreground">Booking #{booking.id.slice(-8)}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Event Date</p>
              <p className="font-medium">
                {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{booking.eventLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <CurrencyDisplay amount={booking.totalAmount.toString()} className="font-medium" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deposit Required</p>
              <CurrencyDisplay amount={booking.depositAmount.toString()} className="font-medium" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <CurrencyDisplay amount={booking.amountPaid.toString()} className="font-medium" />
            </div>
          </div>
          {booking.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Items */}
      {booking.bookingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booking.bookingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">
                      {item.servicePackage?.name || item.rentalItem?.name || item.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × <CurrencyDisplay amount={item.unitPrice.toString()} />
                    </p>
                  </div>
                  <CurrencyDisplay amount={item.totalPrice.toString()} className="font-medium" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      {booking.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {booking.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium capitalize">
                      {payment.paymentType.toLowerCase().replace("_", " ")} Payment
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString("en-GH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay amount={payment.amount.toString()} className="font-medium" />
                    <p className="text-xs text-muted-foreground capitalize">
                      {payment.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <CustomerBookingDetailActions
        bookingId={booking.id}
        canCancel={canCancel}
        canDispute={canDispute}
        canReview={canReview}
        canPayDeposit={canPayDeposit}
      />
    </div>
  )
}
