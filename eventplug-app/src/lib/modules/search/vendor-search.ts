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

  const where: Prisma.VendorProfileWhereInput = {
    status: "APPROVED",
    ...(unavailableVendorIds.length > 0 && {
      id: { notIn: unavailableVendorIds },
    }),
    ...(location && { serviceLocations: { has: location } }),
    ...(categoryId && {
      OR: [
        { primaryCategoryId: categoryId },
        { categories: { some: { categoryId } } },
      ],
    }),
    ...(minRating && { averageRating: { gte: minRating } }),
    ...(verified && { isPhoneVerified: true, isBusinessVerified: true }),
    ...(minPrice || maxPrice
      ? {
          servicePackages: {
            some: {
              isActive: true,
              ...(minPrice && { startingPrice: { gte: minPrice } }),
              ...(maxPrice && { startingPrice: { lte: maxPrice } }),
            },
          },
        }
      : {
          OR: [
            { servicePackages: { some: { isActive: true } } },
            { rentalItems: { some: { isActive: true } } },
          ],
        }),
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
