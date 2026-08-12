import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { AdminReviewsList } from "./reviews-list"

export default async function AdminReviewsPage() {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const reviews = await db.review.findMany({
    include: {
      customer: { select: { fullName: true } },
      vendor: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serializedReviews = reviews.map((r) => ({
    id: r.id,
    customerName: r.customer.fullName,
    vendorName: r.vendor.businessName,
    rating: r.rating,
    reviewText: r.reviewText,
    isVisible: r.isVisible,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Management</h2>
      <AdminReviewsList reviews={serializedReviews} />
    </div>
  )
}
