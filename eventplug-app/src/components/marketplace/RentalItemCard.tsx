import Link from "next/link"
import { MapPin, Truck } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyDisplay } from "@/components/shared"

interface RentalItemCardProps {
  item: {
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
}

export function RentalItemCard({ item }: RentalItemCardProps) {
  const price =
    typeof item.pricePerUnit === "string"
      ? parseFloat(item.pricePerUnit)
      : item.pricePerUnit

  const pricingLabel = item.pricingPeriod === "PER_DAY" ? "per day" : "per event"

  return (
    <Link href={`/rentals/${item.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
        {/* Item Image */}
        <div className="relative h-48 w-full overflow-hidden">
          {item.imageUrls.length > 0 ? (
            <img
              src={item.imageUrls[0]}
              alt={item.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20" />
          )}

          {/* Pricing Period Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground">
              {pricingLabel}
            </Badge>
          </div>

          {/* Delivery Badge */}
          {item.deliveryAvailable && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 gap-1">
                <Truck className="h-3 w-3" />
                Delivery
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-brand-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.vendor.businessName}
          </p>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{item.serviceLocation}</span>
          </div>

          {/* Price */}
          <div className="text-sm">
            <CurrencyDisplay
              amount={price}
              className="font-semibold text-foreground"
            />
            <span className="text-muted-foreground"> / unit</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
