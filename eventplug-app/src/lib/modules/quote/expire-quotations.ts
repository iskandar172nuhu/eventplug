import { db } from "@/lib/db"
import { createNotification } from "@/lib/modules/notifications/create"

export async function expireQuotations() {
  const now = new Date()

  const expiredQuotations = await db.quotation.findMany({
    where: { status: "SENT", expiresAt: { lt: now } },
    include: { quoteRequest: { include: { customer: { include: { user: true } } } } },
  })

  for (const quotation of expiredQuotations) {
    await db.quotation.update({ where: { id: quotation.id }, data: { status: "EXPIRED" } })

    // Notify customer
    await createNotification({
      userId: quotation.quoteRequest.customer.user.id,
      title: "Quotation Expired",
      body: "A quotation you received has expired.",
      link: "/dashboard/customer/quotes",
    })
  }

  return { expired: expiredQuotations.length }
}
