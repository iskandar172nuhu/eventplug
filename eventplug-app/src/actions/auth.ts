"use server"

import { db } from "@/lib/db"
import { hash } from "bcryptjs"
import { signIn, signOut } from "@/lib/auth/config"
import { CustomerRegisterSchema, VendorRegisterSchema, LoginSchema } from "@/lib/validations/auth"
import { redirect } from "next/navigation"

type ActionResult = { success: true } | { success: false; error: string; fieldErrors?: Record<string, string[]> }

export async function registerCustomerAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = CustomerRegisterSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors }

  const { fullName, email, phoneNumber, password } = parsed.data

  // Check existing email
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { success: false, error: "An account with this email already exists" }

  const passwordHash = await hash(password, 12)

  await db.user.create({
    data: {
      email,
      passwordHash,
      role: "CUSTOMER",
      customerProfile: {
        create: { fullName, phoneNumber },
      },
    },
  })

  return { success: true }
}

export async function registerVendorAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  // Handle serviceLocations as array
  const serviceLocations = formData.getAll("serviceLocations") as string[]
  const parsed = VendorRegisterSchema.safeParse({ ...raw, serviceLocations })
  if (!parsed.success) return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors }

  const { businessName, ownerFullName, email, phoneNumber, password, primaryCategoryId, serviceLocations: locations } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return { success: false, error: "An account with this email already exists" }

  const passwordHash = await hash(password, 12)
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

  await db.user.create({
    data: {
      email,
      passwordHash,
      role: "VENDOR",
      vendorProfile: {
        create: {
          businessName,
          slug,
          ownerFullName,
          phoneNumber,
          email,
          primaryCategoryId,
          serviceLocations: locations,
          status: "PENDING",
        },
      },
    },
  })

  return { success: true }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: "Invalid credentials" }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { success: true }
  } catch {
    return { success: false, error: "Invalid email or password" }
  }
}

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect("/")
}
