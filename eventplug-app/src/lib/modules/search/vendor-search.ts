import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { getPaginationArgs, buildPaginationResult } from "@/lib/db/helpers"

export interface VendorSearchParams {
  location?: string
  date?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  verified?: boolean
  sortBy?: "relevance" | "rating" | "price" | "bookings"
  page?: number
  pageSize?: number
}

// Map city names to regions they belong to so that searching "Accra" matches
// vendors who registered with the region "Greater Accra", etc.
const CITY_TO_REGIONS: Record<string, string[]> = {
  Accra: ["Greater Accra", "Accra"],
  Tema: ["Greater Accra", "Tema"],
  Kumasi: ["Ashanti", "Kumasi"],
  "Cape Coast": ["Central", "Cape Coast"],
  Takoradi: ["Western", "Takoradi"],
  Tamale: ["Northern", "Tamale"],
  Koforidua: ["Eastern", "Koforidua"],
  Ho: ["Volta", "Ho"],
}

export async function searchVendors(params: VendorSearchParams) {
  const {
    location,
    date,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    verified,
    sortBy,
    page,
    pageSize,
  } = params
  const pagination = getPaginationArgs({ page, pageSize })

  // Get unavailable vendor IDs for the date
  let unavailableVendorIds: string[] = []
  if (date) {
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    const unavailable = await db.vendorAvailability.findMany({
      where: {
        isUnavailable: true,
        OR: [{ date: dateObj }, { dayOfWeek }],
      },
      select: { vendorId: true },
    })
    unavailableVendorIds = unavailable.map((v) => v.vendorId)
  }

  // Build location filter: match the city itself OR the region it belongs to
  let locationFilter: Prisma.VendorProfileWhereInput | undefined
  if (location) {
    const searchTerms = CITY_TO_REGIONS[location] ?? [location]
    locationFilter = {
      OR: searchTerms.map((term) => ({ serviceLocations: { has: term } })),
    }
  }

  // Build the WHERE clause using AND to avoid OR key conflicts
  const conditions: Prisma.VendorProfileWhereInput[] = [
    { status: "APPROVED" },
  ]

  if (unavailableVendorIds.length > 0) {
    conditions.push({ id: { notIn: unavailableVendorIds } })
  }

  if (locationFilter) {
    conditions.push(locationFilter)
  }

  if (categoryId) {
    conditions.push({
      OR: [
        { primaryCategoryId: categoryId },
        { categories: { some: { categoryId } } },
      ],
    })
  }

  if (minRating) {
    conditions.push({ averageRating: { gte: minRating } })
  }

  if (verified) {
    conditions.push({ isPhoneVerified: true, isBusinessVerified: true })
  }

  if (minPrice || maxPrice) {
    conditions.push({
      servicePackages: {
        some: {
          isActive: true,
          ...(minPrice && { startingPrice: { gte: minPrice } }),
          ...(maxPrice && { startingPrice: { lte: maxPrice } }),
        },
      },
    })
  }

  const where: Prisma.VendorProfileWhereInput = {
    AND: conditions,
  }

  // Build order by
  let orderBy: Prisma.VendorProfileOrderByWithRelationInput = {
    totalBookings: "desc",
  }
  switch (sortBy) {
    case "rating":
      orderBy = { averageRating: "desc" }
      break
    case "price":
      orderBy = { servicePackages: { _count: "asc" } }
      break
    case "bookings":
      orderBy = { totalBookings: "desc" }
      break
  }

  const [vendors, total] = await Promise.all([
    db.vendorProfile.findMany({
      where,
      orderBy,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        primaryCategory: true,
        servicePackages: {
          where: { isActive: true },
          take: 1,
          orderBy: { startingPrice: "asc" },
        },
      },
    }),
    db.vendorProfile.count({ where }),
  ])

  return buildPaginationResult(vendors, total, pagination.page, pagination.pageSize)
}
