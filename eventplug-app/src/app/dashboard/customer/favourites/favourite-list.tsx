"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, MapPin, Heart } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CurrencyDisplay } from "@/components/shared"
import { removeFavouriteAction } from "@/actions/customer"

interface FavouriteVendor {
  vendorId: string
  businessName: string
  slug: string
  logoUrl: string | null
  coverImageUrl: string | null
  categoryName: string
  serviceLocations: string[]
  averageRating: number
  totalReviews: number
  startingPrice: string | null
}

interface FavouriteVendorListProps {
  vendors: FavouriteVendor[]
}

export function FavouriteVendorList({ vendors }: FavouriteVendorListProps) {
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(vendorId: string) {
    setRemoving(vendorId)
    await removeFavouriteAction(vendorId)
    setRemoving(null)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <Card key={vendor.vendorId} className="overflow-hidden h-full">
          <div className="relative h-32 w-full overflow-hidden">
            {vendor.coverImageUrl ? (
              <img
                src={vendor.coverImageUrl}
                alt={`${vendor.businessName} cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20" />
            )}
            {vendor.logoUrl && (
              <div className="absolute bottom-2 left-3">
                <img
                  src={vendor.logoUrl}
                  alt={`${vendor.businessName} logo`}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-md"
                />
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={() => handleRemove(vendor.vendorId)}
              disabled={removing === vendor.vendorId}
              aria-label="Remove from favourites"
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </Button>
          </div>

          <Link href={`/vendors/${vendor.slug}`} className="block">
            <CardHeader className="pb-2">
              <h3 className="font-semibold line-clamp-1 hover:text-brand-primary transition-colors">
                {vendor.businessName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {vendor.categoryName}
              </p>
            </CardHeader>

            <CardContent className="space-y-2">
              {vendor.serviceLocations.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {vendor.serviceLocations.slice(0, 2).join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                {vendor.startingPrice ? (
                  <div className="text-sm">
                    <span className="text-muted-foreground">From </span>
                    <CurrencyDisplay
                      amount={vendor.startingPrice}
                      className="font-semibold"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Contact for pricing
                  </span>
                )}

                {vendor.totalReviews > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {vendor.averageRating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({vendor.totalReviews})
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
