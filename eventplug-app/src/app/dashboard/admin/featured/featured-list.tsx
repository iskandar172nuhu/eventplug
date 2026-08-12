"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toggleFeaturedAction } from "@/actions/admin"

const MAX_FEATURED = 6

interface VendorRow {
  id: string
  businessName: string
  ownerFullName: string
  isFeatured: boolean
  categoryName: string
  serviceLocations: string[]
}

interface AdminFeaturedListProps {
  vendors: VendorRow[]
  featuredCount: number
}

export function AdminFeaturedList({ vendors, featuredCount: initialCount }: AdminFeaturedListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [localFeaturedCount, setLocalFeaturedCount] = useState(initialCount)

  async function handleToggle(vendorId: string, newFeaturedState: boolean) {
    setLoading(vendorId)
    await toggleFeaturedAction(vendorId, newFeaturedState)
    setLocalFeaturedCount((prev) => (newFeaturedState ? prev + 1 : prev - 1))
    setLoading(null)
  }

  const limitReached = localFeaturedCount >= MAX_FEATURED

  return (
    <div className="space-y-4">
      {/* Featured count display */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-2xl font-bold">{localFeaturedCount}</span>
          <span className="text-sm text-muted-foreground"> / {MAX_FEATURED} featured</span>
        </div>
        {limitReached && (
          <Badge variant="destructive">
            Maximum reached — unfeature a vendor to feature another
          </Badge>
        )}
      </div>

      {/* Vendor list */}
      <div className="space-y-3">
        {vendors.map((vendor) => (
          <Card key={vendor.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vendor.businessName}</p>
                    {vendor.isFeatured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vendor.categoryName} · {vendor.serviceLocations.join(", ") || "N/A"}
                  </p>
                </div>
                <div>
                  {vendor.isFeatured ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading === vendor.id}
                      onClick={() => handleToggle(vendor.id, false)}
                    >
                      {loading === vendor.id ? "Removing..." : "Remove from Featured"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={loading === vendor.id || limitReached}
                      onClick={() => handleToggle(vendor.id, true)}
                    >
                      {loading === vendor.id ? "Adding..." : "Feature"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
