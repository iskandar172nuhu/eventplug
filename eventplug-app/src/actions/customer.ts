"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

export async function updateCustomerProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("CUSTOMER")
  const fullName = formData.get("fullName") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const profilePhoto = formData.get("profilePhoto") as string | null

  if (!fullName || !phoneNumber) {
    return { success: false, error: "Full name and phone number are required" }
  }

  // Validate Ghana phone format: +233XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(\+233|0)\d{9}$/
  const cleanedPhone = phoneNumber.replace(/\s/g, "")
  if (!phoneRegex.test(cleanedPhone)) {
    return { success: false, error: "Invalid Ghana phone number format. Use +233XXXXXXXXX or 0XXXXXXXXX" }
  }

  await db.customerProfile.update({
    where: { userId: session.user.id },
    data: {
      fullName,
      phoneNumber: cleanedPhone,
      ...(profilePhoto && { profilePhoto }),
    },
  })

  revalidatePath("/dashboard/customer/profile")
  return { success: true }
}

export async function saveFavouriteAction(vendorId: string): Promise<ActionResult> {
  const session = await requireAuth("CUSTOMER")

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    return { success: false, error: "Customer profile not found" }
  }

  // Toggle: add if not exists, remove if exists
  const existing = await db.favourite.findUnique({
    where: {
      customerId_vendorId: {
        customerId: customerProfile.id,
        vendorId,
      },
    },
  })

  if (existing) {
    await db.favourite.delete({
      where: {
        customerId_vendorId: {
          customerId: customerProfile.id,
          vendorId,
        },
      },
    })
  } else {
    await db.favourite.create({
      data: {
        customerId: customerProfile.id,
        vendorId,
      },
    })
  }

  revalidatePath("/dashboard/customer/favourites")
  return { success: true }
}

export async function removeFavouriteAction(vendorId: string): Promise<ActionResult> {
  const session = await requireAuth("CUSTOMER")

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    return { success: false, error: "Customer profile not found" }
  }

  await db.favourite.deleteMany({
    where: {
      customerId: customerProfile.id,
      vendorId,
    },
  })

  revalidatePath("/dashboard/customer/favourites")
  return { success: true }
}
