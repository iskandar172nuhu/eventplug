import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { AdminFeaturedList } from "./featured-list"

export default async function AdminFeaturedPage() {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const vendors = await db.vendorProfile.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      businessName: true,
      ownerFullName: true,
      isFeatured: true,
      serviceLocations: true,
      primaryCategory: { select: { name: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { businessName: "asc" }],
  })

  const serializedVendors = vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    ownerFullName: v.ownerFullName,
    isFeatured: v.isFeatured,
    categoryName: v.primaryCategory.name,
    serviceLocations: v.serviceLocations,
  }))

  const featuredCount = vendors.filter((v) => v.isFeatured).length

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Featured Vendors</h2>
      <AdminFeaturedList
        vendors={serializedVendors}
        featuredCount={featuredCount}
      />
    </div>
  )
}
