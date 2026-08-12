"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function approveVendorAction(vendorId: string) {
  await requireAuth("ADMIN")
  await db.vendorProfile.update({
    where: { id: vendorId },
    data: { status: "APPROVED" },
  })
  revalidatePath("/dashboard/admin/vendors")
  return { success: true }
}

export async function suspendVendorAction(vendorId: string) {
  await requireAuth("ADMIN")
  await db.vendorProfile.update({
    where: { id: vendorId },
    data: { status: "SUSPENDED" },
  })
  revalidatePath("/dashboard/admin/vendors")
  return { success: true }
}

export async function manageCategoryAction(formData: FormData) {
  await requireAuth("ADMIN")
  const action = formData.get("action") as string
  const name = formData.get("name") as string
  const type = formData.get("type") as "SERVICE" | "RENTAL" | "BOTH"
  const categoryId = formData.get("categoryId") as string | null
  const displayOrder = formData.get("displayOrder") as string | null

  if (action === "create") {
    await db.vendorCategory.create({
      data: {
        name,
        type,
        isActive: true,
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      },
    })
  } else if (action === "update" && categoryId) {
    await db.vendorCategory.update({ where: { id: categoryId }, data: { name } })
  } else if (action === "deactivate" && categoryId) {
    await db.vendorCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    })
  }

  revalidatePath("/dashboard/admin/categories")
  return { success: true }
}

export async function toggleFeaturedAction(vendorId: string, featured: boolean) {
  await requireAuth("ADMIN")
  await db.vendorProfile.update({
    where: { id: vendorId },
    data: { isFeatured: featured },
  })
  revalidatePath("/dashboard/admin/featured")
  revalidatePath("/")
  return { success: true }
}

export async function toggleReviewVisibilityAction(reviewId: string, isVisible: boolean) {
  await requireAuth("ADMIN")
  await db.review.update({
    where: { id: reviewId },
    data: { isVisible },
  })
  revalidatePath("/dashboard/admin/reviews")
  return { success: true }
}
