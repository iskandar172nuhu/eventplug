import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { ServicesManager } from "./services-manager"

export default async function VendorServicesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "VENDOR") {
    redirect("/login")
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!vendorProfile) {
    redirect("/login")
  }

  const [servicePackages, categories] = await Promise.all([
    db.servicePackage.findMany({
      where: { vendorId: vendorProfile.id },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.vendorCategory.findMany({
      where: { isActive: true, type: { in: ["SERVICE", "BOTH"] } },
      orderBy: { displayOrder: "asc" },
    }),
  ])

  const serializedPackages = servicePackages.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    categoryId: pkg.categoryId,
    categoryName: pkg.category.name,
    includedServices: pkg.includedServices,
    startingPrice: pkg.startingPrice.toString(),
    isActive: pkg.isActive,
    addOns: pkg.addOns as Array<{ name: string; price: number }> | null,
  }))

  const serializedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }))

  return (
    <ServicesManager
      initialPackages={serializedPackages}
      categories={serializedCategories}
    />
  )
}
