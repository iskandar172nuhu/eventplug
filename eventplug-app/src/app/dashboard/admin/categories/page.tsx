import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { AdminCategoryList } from "./category-list"

export default async function AdminCategoriesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const categories = await db.vendorCategory.findMany({
    orderBy: { displayOrder: "asc" },
  })

  const serializedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    displayOrder: cat.displayOrder,
    isActive: cat.isActive,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Category Management</h2>
      <AdminCategoryList categories={serializedCategories} />
    </div>
  )
}
