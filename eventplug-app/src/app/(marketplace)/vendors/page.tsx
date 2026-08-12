import { Search, SlidersHorizontal } from "lucide-react"

import { searchVendors } from "@/lib/modules/search/vendor-search"
import { db } from "@/lib/db"
import { FilterSidebar } from "@/components/marketplace/FilterSidebar"
import { VendorGrid } from "@/components/marketplace/VendorGrid"
import { EmptyState } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface VendorsPageProps {
  searchParams: Promise<{
    location?: string
    date?: string
    categoryId?: string
    minPrice?: string
    maxPrice?: string
    minRating?: string
    verified?: string
    sortBy?: string
    page?: string
  }>
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const params = await searchParams

  const categories = await db.vendorCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true },
  })

  const result = await searchVendors({
    location: params.location,
    date: params.date,
    categoryId: params.categoryId,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    verified: params.verified === "true",
    sortBy: (params.sortBy as "relevance" | "rating" | "price" | "bookings") || undefined,
    page: params.page ? Number(params.page) : 1,
  })

  // Map Prisma Decimal types to numbers for component compatibility
  const vendors = result.data.map((vendor) => ({
    ...vendor,
    servicePackages: vendor.servicePackages.map((pkg) => ({
      ...pkg,
      startingPrice: Number(pkg.startingPrice),
    })),
  }))

  const hasResults = vendors.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Find Event Vendors</h1>
        <p className="text-muted-foreground mt-1">
          Browse and compare the best event service providers across Ghana
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar categories={categories} />
        </div>

        {/* Mobile Filter Sheet */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <div className="pt-6">
                <FilterSidebar categories={categories} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {hasResults ? (
            <VendorGrid vendors={vendors} pagination={result} />
          ) : (
            <EmptyState
              title="No vendors found"
              description="Try adjusting your filters or broadening your search criteria to find vendors that match your needs."
              icon={<Search />}
              action={
                <Button
                  variant="outline"
                  onClick={() => {}}
                  asChild
                >
                  <a href="/vendors">Clear all filters</a>
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
