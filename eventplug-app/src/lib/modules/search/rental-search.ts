import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { getPaginationArgs, buildPaginationResult } from "@/lib/db/helpers"

export interface RentalSearchParams {
  categoryId?: string
  location?: string
  date?: string
  minQuantity?: number
  page?: number
  pageSize?: number
}

export async function searchRentalItems(params: RentalSearchParams) {
  const { categoryId, location, date, minQuantity, page, pageSize } = params
  const pagination = getPaginationArgs({ page, pageSize })

  const where: Prisma.RentalItemWhereInput = {
    isActive: true,
    vendor: { status: "APPROVED" },
    ...(categoryId && { categoryId }),
    ...(location && { serviceLocation: location }),
    ...(minQuantity && { totalQuantity: { gte: minQuantity } }),
  }

  const [items, total] = await Promise.all([
    db.rentalItem.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        vendor: {
          select: {
            businessName: true,
            slug: true,
            serviceLocations: true,
          },
        },
        category: { select: { name: true } },
        inventory: date
          ? { where: { eventDate: new Date(date) } }
          : false,
      },
    }),
    db.rentalItem.count({ where }),
  ])

  // Filter by available quantity if date + minQuantity provided
  let filteredItems = items
  if (date && minQuantity) {
    filteredItems = items.filter((item) => {
      const inventoryRecords = (item as Record<string, unknown>).inventory as
        | { reservedQty: number }[]
        | undefined
      const reserved = inventoryRecords?.[0]?.reservedQty ?? 0
      return item.totalQuantity - reserved >= minQuantity
    })
  }

  return buildPaginationResult(
    filteredItems,
    total,
    pagination.page,
    pagination.pageSize
  )
}
