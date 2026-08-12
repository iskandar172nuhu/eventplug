"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

type ActionResult = { success: true } | { success: false; error: string }

// ─── Availability Actions ────────────────────────────────────────────────────

export async function setAvailabilityAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const action = formData.get("action") as string // "toggle_date" | "toggle_day"

  // Sentinel date used for recurring (day-of-week) rules so the required `date` field is populated
  const RECURRING_SENTINEL_DATE = new Date("1970-01-01")

  if (action === "toggle_date") {
    const dateStr = formData.get("date") as string
    const date = new Date(dateStr)

    const existing = await db.vendorAvailability.findFirst({
      where: { vendorId: vendorProfile.id, date, dayOfWeek: null },
    })

    if (existing) {
      await db.vendorAvailability.delete({ where: { id: existing.id } })
    } else {
      await db.vendorAvailability.create({
        data: { vendorId: vendorProfile.id, date, isUnavailable: true },
      })
    }
  } else if (action === "toggle_day") {
    const dayOfWeek = parseInt(formData.get("dayOfWeek") as string)

    const existing = await db.vendorAvailability.findFirst({
      where: { vendorId: vendorProfile.id, dayOfWeek, date: RECURRING_SENTINEL_DATE },
    })

    if (existing) {
      await db.vendorAvailability.delete({ where: { id: existing.id } })
    } else {
      await db.vendorAvailability.create({
        data: {
          vendorId: vendorProfile.id,
          date: RECURRING_SENTINEL_DATE,
          dayOfWeek,
          isUnavailable: true,
        },
      })
    }
  }

  revalidatePath("/dashboard/vendor/calendar")
  return { success: true }
}

// ─── Service Package Actions ─────────────────────────────────────────────────

export async function createServicePackageAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const categoryId = formData.get("categoryId") as string
  const includedServicesRaw = formData.get("includedServices") as string
  const startingPrice = parseFloat(formData.get("startingPrice") as string)
  const addOnsRaw = formData.get("addOns") as string | null

  if (!name || !description || !categoryId || !includedServicesRaw || isNaN(startingPrice)) {
    return { success: false, error: "All required fields must be filled" }
  }

  const includedServices = includedServicesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  let addOns: Array<{ name: string; price: number }> | null = null
  if (addOnsRaw) {
    try {
      addOns = JSON.parse(addOnsRaw)
    } catch {
      return { success: false, error: "Invalid add-ons format" }
    }
  }

  await db.servicePackage.create({
    data: {
      vendorId: vendorProfile.id,
      categoryId,
      name,
      description,
      includedServices,
      startingPrice,
      addOns: addOns ?? Prisma.JsonNull,
    },
  })

  revalidatePath("/dashboard/vendor/services")
  return { success: true }
}

export async function updateServicePackageAction(
  packageId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuth("VENDOR")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const categoryId = formData.get("categoryId") as string
  const includedServicesRaw = formData.get("includedServices") as string
  const startingPrice = parseFloat(formData.get("startingPrice") as string)
  const isActive = formData.get("isActive") === "true"
  const addOnsRaw = formData.get("addOns") as string | null

  if (!name || !description || !categoryId || !includedServicesRaw || isNaN(startingPrice)) {
    return { success: false, error: "All required fields must be filled" }
  }

  const includedServices = includedServicesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  let addOns: Array<{ name: string; price: number }> | null = null
  if (addOnsRaw) {
    try {
      addOns = JSON.parse(addOnsRaw)
    } catch {
      return { success: false, error: "Invalid add-ons format" }
    }
  }

  await db.servicePackage.update({
    where: { id: packageId },
    data: {
      categoryId,
      name,
      description,
      includedServices,
      startingPrice,
      isActive,
      addOns: addOns ?? Prisma.JsonNull,
    },
  })

  revalidatePath("/dashboard/vendor/services")
  return { success: true }
}

export async function deleteServicePackageAction(packageId: string): Promise<ActionResult> {
  await requireAuth("VENDOR")

  await db.servicePackage.delete({ where: { id: packageId } })

  revalidatePath("/dashboard/vendor/services")
  return { success: true }
}

export async function toggleServicePackageActiveAction(
  packageId: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAuth("VENDOR")

  await db.servicePackage.update({
    where: { id: packageId },
    data: { isActive },
  })

  revalidatePath("/dashboard/vendor/services")
  return { success: true }
}

// ─── Rental Item / Inventory Actions ─────────────────────────────────────────

export async function createRentalItemAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const data = {
    vendorId: vendorProfile.id,
    categoryId: formData.get("categoryId") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    imageUrls: formData.getAll("imageUrls") as string[],
    pricePerUnit: parseFloat(formData.get("pricePerUnit") as string),
    pricingPeriod: formData.get("pricingPeriod") as "PER_DAY" | "PER_EVENT",
    totalQuantity: parseInt(formData.get("totalQuantity") as string),
    minOrderQuantity: parseInt(formData.get("minOrderQuantity") as string) || 1,
    serviceLocation: formData.get("serviceLocation") as string,
    deliveryAvailable: formData.get("deliveryAvailable") === "true",
    deliveryCharge: formData.get("deliveryCharge")
      ? parseFloat(formData.get("deliveryCharge") as string)
      : null,
    setupAvailable: formData.get("setupAvailable") === "true",
    setupCharge: formData.get("setupCharge")
      ? parseFloat(formData.get("setupCharge") as string)
      : null,
    isActive: true,
  }

  if (!data.name || !data.categoryId || !data.description || isNaN(data.pricePerUnit) || isNaN(data.totalQuantity)) {
    return { success: false, error: "All required fields must be filled" }
  }

  await db.rentalItem.create({ data })

  revalidatePath("/dashboard/vendor/inventory")
  return { success: true }
}

export async function updateRentalInventoryAction(
  rentalItemId: string,
  totalQuantity: number
): Promise<ActionResult> {
  await requireAuth("VENDOR")

  await db.rentalItem.update({
    where: { id: rentalItemId },
    data: { totalQuantity },
  })

  revalidatePath("/dashboard/vendor/inventory")
  return { success: true }
}

export async function deleteRentalItemAction(rentalItemId: string): Promise<ActionResult> {
  await requireAuth("VENDOR")

  await db.rentalItem.delete({ where: { id: rentalItemId } })

  revalidatePath("/dashboard/vendor/inventory")
  return { success: true }
}

// ─── Vendor Profile Actions ──────────────────────────────────────────────────

export async function updateVendorProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth("VENDOR")
  const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
  })

  const businessName = formData.get("businessName") as string
  const description = formData.get("description") as string | null
  const serviceLocations = formData.getAll("serviceLocations") as string[]
  const logoUrl = formData.get("logoUrl") as string | null
  const coverImageUrl = formData.get("coverImageUrl") as string | null

  if (!businessName) {
    return { success: false, error: "Business name is required" }
  }

  if (description && description.length > 1000) {
    return { success: false, error: "Description must be 1000 characters or fewer" }
  }

  if (serviceLocations.length === 0) {
    return { success: false, error: "At least one service location is required" }
  }

  await db.vendorProfile.update({
    where: { id: vendorProfile.id },
    data: {
      businessName,
      description: description || undefined,
      serviceLocations,
      ...(logoUrl && { logoUrl }),
      ...(coverImageUrl && { coverImageUrl }),
    },
  })

  revalidatePath("/dashboard/vendor/profile")
  return { success: true }
}
