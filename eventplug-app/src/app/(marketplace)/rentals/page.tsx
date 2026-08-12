import { Search } from "lucide-react"

import { searchRentalItems } from "@/lib/modules/search/rental-search"
import { db } from "@/lib/db"
import { RentalGrid } from "@/components/marketplace/RentalGrid"
import { RentalFilters } from "@/components/marketplace/RentalFilters"
import { EmptyState } from "@/components/shared"
import { Button } from "@/components/ui/button"

interface RentalsPageProps {
  searchParams: Promise<{
    categoryId?: string
    location?: string
    date?: string
    minQuantity?: string
    page?: string
  }>
}

export default async function RentalsPage({ searchParams }: RentalsPageProps) {
  const params = await searchParams

  const categories = await db.vendorCategory.findMany({
    where: { isActive: true, type: { in: ["RENTAL", "BOTH"] } },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  })

  const result = await searchRentalItems({
    categoryId: params.categoryId,
    location: params.location,
    date: params.date,
    minQuantity: params.minQuantity ? Number(params.minQuantity) : undefined,
    page: params.page ? Number(params.page) : 1,
  })

  // Map Prisma Decimal types to numbers for component compatibility
  const items = result.data.map((item) => ({
    ...item,
    pricePerUnit: Number(item.pricePerUnit),
    vendor: {
      id: (item.vendor as { businessName: string; slug: string }).slug,
      businessName: (item.vendor as { businessName: string; slug: string }).businessName,
    },
    category: {
      id: item.categoryId,
      name: (item.category as { name: string }).name,
    },
  }))

  const hasResults = items.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Rental Items</h1>
        <p className="text-muted-foreground mt-1">
          Browse chairs, tables, canopies, sound systems, and more for your event
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-8">
        <RentalFilters categories={categories} />
      </div>

      {/* Results */}
      {hasResults ? (
        <RentalGrid items={items} pagination={result} />
      ) : (
        <EmptyState
          title="No rental items found"
          description="Try adjusting your filters or broadening your search to find rental items that match your needs."
          icon={<Search />}
          action={
            <Button variant="outline" asChild>
              <a href="/rentals">Clear all filters</a>
            </Button>
          }
        />
      )}
    </div>
  )
}
