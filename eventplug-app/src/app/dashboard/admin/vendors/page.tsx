import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { AdminVendorList } from "./vendor-list"

export default async function AdminVendorsPage() {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const vendors = await db.vendorProfile.findMany({
    include: {
      user: { select: { email: true } },
      primaryCategory: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serializedVendors = vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    ownerFullName: v.ownerFullName,
    email: v.user.email,
    categoryName: v.primaryCategory.name,
    serviceLocations: v.serviceLocations,
    status: v.status,
    createdAt: v.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Vendor Management</h2>
      <AdminVendorList vendors={serializedVendors} />
    </div>
  )
}
