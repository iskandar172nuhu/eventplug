import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { InventoryManager } from "./inventory-manager"

export default async function VendorInventoryPage() {
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

  const [rentalItems, categories] = await Promise.all([
    db.rentalItem.findMany({
      where: { vendorId: vendorProfile.id },
      include: {
        category: { select: { name: true } },
        inventory: {
          where: { reservedQty: { gt: 0 } },
          orderBy: { eventDate: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.vendorCategory.findMany({
      where: { isActive: true, type: { in: ["RENTAL", "BOTH"] } },
      orderBy: { displayOrder: "asc" },
    }),
  ])

  // Calculate total reserved across all dates for the summary column
  const serializedItems = rentalItems.map((item) => {
    const totalReserved = item.inventory.reduce((sum, inv) => sum + inv.reservedQty, 0)
    return {
      id: item.id,
      name: item.name,
      categoryName: item.category.name,
      pricePerUnit: item.pricePerUnit.toString(),
      pricingPeriod: item.pricingPeriod,
      totalQuantity: item.totalQuantity,
      reservedQty: totalReserved,
      isActive: item.isActive,
      serviceLocation: item.serviceLocation,
    }
  })

  // Flatten inventory records for calendar display
  const inventoryRecords = rentalItems.flatMap((item) =>
    item.inventory.map((inv) => ({
      rentalItemId: item.id,
      eventDate: inv.eventDate.toISOString().split("T")[0],
      reservedQty: inv.reservedQty,
    }))
  )

  const serializedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }))

  return (
    <InventoryManager
      initialItems={serializedItems}
      inventoryRecords={inventoryRecords}
      categories={serializedCategories}
    />
  )
}
