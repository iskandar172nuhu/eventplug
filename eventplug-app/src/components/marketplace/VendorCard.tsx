import Link from "next/link"
import { Star, MapPin, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyDisplay } from "@/components/shared"

interface ServicePackage {
  id: string
  startingPrice: number | string
  isActive: boolean
}

interface PrimaryCategory {
  id: string
  name: string
}

export interface VendorCardProps {
  vendor: {
    id: string
    slug: string
    businessName: string
    logoUrl: string | null
    coverImageUrl: string | null
    primaryCategory: PrimaryCategory
    serviceLocations: string[]
    servicePackages: ServicePackage[]
    averageRating: number
    totalReviews: number
    isPhoneVerified: boolean
    isGhanaCardVerified: boolean
    isBusinessVerified: boolean
    isAddressVerified: boolean
  }
}

export function VendorCard({ vendor }: VendorCardProps) {
  const isFullyVerified =
    vendor.isPhoneVerified &&
    vendor.isGhanaCardVerified &&
    vendor.isBusinessVerified &&
    vendor.isAddressVerified

  const activePackages = vendor.servicePackages.filter((pkg) => pkg.isActive)
  const cheapestPrice =
    activePackages.length > 0
      ? Math.min(
          ...activePackages.map((pkg) =>
            typeof pkg.startingPrice === "string"
              ? parseFloat(pkg.startingPrice)
              : pkg.startingPrice
          )
        )
      : null

  const displayLocations = vendor.serviceLocations.slice(0, 2)

  return (
    <Link href={`/vendors/${vendor.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
        {/* Cover/Logo Image */}
        <div className="relative h-48 w-full overflow-hidden">
          {vendor.coverImageUrl ? (
            <img
              src={vendor.coverImageUrl}
              alt={`${vendor.businessName} cover`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20" />
          )}
          {vendor.logoUrl && (
            <div className="absolute bottom-3 left-3">
              <img
                src={vendor.logoUrl}
                alt={`${vendor.businessName} logo`}
                className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md"
              />
            </div>
          )}
          {isFullyVerified && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 gap-1"
              >
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-brand-primary transition-colors">
            {vendor.businessName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {vendor.primaryCategory.name}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Service Locations */}
          {displayLocations.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">
                {displayLocations.join(", ")}
                {vendor.serviceLocations.length > 2 && (
                  <span> +{vendor.serviceLocations.length - 2}</span>
                )}
              </span>
            </div>
          )}

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between">
            {cheapestPrice !== null ? (
              <div className="text-sm">
                <span className="text-muted-foreground">From </span>
                <CurrencyDisplay
                  amount={cheapestPrice}
                  className="font-semibold text-foreground"
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
      </Card>
    </Link>
  )
}
