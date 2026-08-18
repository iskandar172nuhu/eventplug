"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { signOut } from "@/lib/auth/config"
import { hash, compare } from "bcryptjs"
import { passwordSchema } from "@/lib/validations/auth"
import { redirect } from "next/navigation"

type ActionResult = { success: true } | { success: false; error: string }

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmNewPassword = formData.get("confirmNewPassword") as string

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return { success: false, error: "All fields are required" }
  }

  if (newPassword !== confirmNewPassword) {
    return { success: false, error: "New passwords do not match" }
  }

  const parsed = passwordSchema.safeParse(newPassword)
  if (!parsed.success) {
    return { success: false, error: "Password must be at least 8 characters with uppercase, lowercase, and a number" }
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { passwordHash: true },
  })

  const isValid = await compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return { success: false, error: "Current password is incorrect" }
  }

  const newHash = await hash(newPassword, 12)
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  return { success: true }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  const session = await requireAuth()
  const userId = session.user.id

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  })

  // Anonymise the user record rather than deleting to preserve referential integrity
  // for bookings, payments, reviews, and dispute history
  const anonymisedEmail = `deleted-${userId}@deactivated.eventplug.local`

  await db.user.update({
    where: { id: userId },
    data: {
      email: anonymisedEmail,
      passwordHash: "DEACTIVATED",
    },
  })

  // Anonymise profile data based on role
  if (user.role === "CUSTOMER") {
    await db.customerProfile.updateMany({
      where: { userId },
      data: {
        fullName: "Deleted User",
        phoneNumber: "0000000000",
        profilePhoto: null,
      },
    })
  } else if (user.role === "VENDOR") {
    await db.vendorProfile.updateMany({
      where: { userId },
      data: {
        ownerFullName: "Deleted User",
        phoneNumber: "0000000000",
        email: anonymisedEmail,
        status: "SUSPENDED",
        description: null,
        logoUrl: null,
        coverImageUrl: null,
      },
    })
  }

  // Delete sessions
  await db.session.deleteMany({ where: { userId } })

  // Sign out and redirect
  await signOut({ redirect: false })
  redirect("/")
}
