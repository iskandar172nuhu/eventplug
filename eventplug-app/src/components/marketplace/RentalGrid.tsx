"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RentalItemCard } from "./RentalItemCard"

interface RentalItem {
  id: string
  name: string
  imageUrls: string[]
  pricePerUnit: number | string
  pricingPeriod: "PER_DAY" | "PER_EVENT"
  serviceLocation: string
  deliveryAvailable: boolean
  vendor: {
    id: string
    businessName: string
  }
  category: {
    id: string
    name: string
  }
}

interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface RentalGridProps {
  items: RentalItem[]
  pagination: PaginationInfo
}

export function RentalGrid({ items, pagination }: RentalGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    router.push(`/rentals?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Rental Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <RentalItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
