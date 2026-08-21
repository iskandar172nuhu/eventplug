import Link from "next/link"
import { Star, MapPin, BadgeCheck, CalendarCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface ProfileHeaderProps {
  vendor: {
    id: string
    slug: string
    businessName: string
    logoUrl: string | null
    coverImageUrl: string | null
    serviceLocations: string[]
    averageRating: number
    totalReviews: number
    totalBookings: number
    isPhoneVerified: boolean
    isGhanaCardVerified: boolean
    isBusinessVerified: boolean
    isAddressVerified: boolean
  }
  isAuthenticated?: boolean
  actions?: React.ReactNode
}

export function ProfileHeader({ vendor, isAuthenticated = false, actions }: ProfileHeaderProps) {
  const isFullyVerified =
    vendor.isPhoneVerified &&
    vendor.isGhanaCardVerified &&
    vendor.isBusinessVerified &&
    vendor.isAddressVerified

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-[200px] md:h-[250px] w-full overflow-hidden rounded-t-lg">
        {vendor.coverImageUrl ? (
          <img
            src={vendor.coverImageUrl}
            alt={`${vendor.businessName} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-primary/30 via-brand-secondary/30 to-brand-accent/30" />
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 md:px-6 pb-6">
        {/* Logo - overlapping cover */}
        <div className="absolute -top-12 left-4 md:left-6">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt={`${vendor.businessName} logo`}
              className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 rounded-full border-4 border-background bg-gradient-to-br from-brand-primary to-brand-secondary shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {vendor.businessName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content - with spacing for logo */}
        <div className="pt-16 space-y-4">
          {/* Name and Verification */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold">{vendor.businessName}</h1>
            {isFullyVerified && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 gap-1 w-fit">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </Badge>
            )}
          </div>

          {/* Rating, Reviews, Bookings */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {vendor.totalReviews > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{vendor.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({vendor.totalReviews} {vendor.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <CalendarCheck className="h-4 w-4" />
              <span>{vendor.totalBookings} completed bookings</span>
            </div>
          </div>

          {/* Service Locations */}
          {vendor.serviceLocations.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{vendor.serviceLocations.join(", ")}</span>
            </div>
          )}

          {/* CTA Buttons */}
          {actions}
        </div>
      </div>
    </div>
  )
}
