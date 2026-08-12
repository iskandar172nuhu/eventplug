import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { DisputesList } from "./disputes-list"

export default async function AdminDisputesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const disputes = await db.dispute.findMany({
    where: { status: "OPEN" },
    include: {
      booking: {
        include: {
          customer: { select: { fullName: true } },
          vendor: { select: { businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const serializedDisputes = disputes.map((d) => ({
    id: d.id,
    bookingId: d.bookingId,
    customerName: d.booking.customer.fullName,
    vendorName: d.booking.vendor.businessName,
    disputeType: d.disputeType,
    description: d.description,
    evidenceUrls: d.evidenceUrls,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dispute Management</h2>
      <DisputesList disputes={serializedDisputes} />
    </div>
  )
}
