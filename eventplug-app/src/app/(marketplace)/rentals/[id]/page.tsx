import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Truck, Wrench, Store } from "lucide-react"

import { db } from "@/lib/db"
import { CurrencyDisplay } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RentalItemActions } from "./rental-item-actions"

interface RentalItemPageProps {
  params: Promise<{ id: string }>
}

export default async function RentalItemPage({ params }: RentalItemPageProps) {
  const { id } = await params

  const item = await db.rentalItem.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
          slug: true,
          status: true,
          serviceLocations: true,
          logoUrl: true,
        },
      },
      category: { select: { id: true, name: true } },
      inventory: true,
    },
  })

  if (!item || item.vendor.status !== "APPROVED") {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Images */}
        <div className="space-y-4">
          {/* Hero Image */}
          <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted">
            {item.imageUrls.length > 0 ? (
              <img
                src={item.imageUrls[0]}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/20 to-brand-accent/20 flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {item.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.imageUrls.slice(1).map((url, index) => (
                <div
                  key={index}
                  className="aspect-square overflow-hidden rounded-md border bg-muted"
                >
                  <img
                    src={url}
                    alt={`${item.name} - image ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div>
            <Badge variant="secondary" className="mb-2">
              {item.category.name}
            </Badge>
            <h1 className="text-2xl font-bold md:text-3xl">{item.name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <CurrencyDisplay
              amount={Number(item.pricePerUnit)}
              className="text-2xl font-bold text-brand-primary"
            />
            <span className="text-muted-foreground">
              / unit {item.pricingPeriod === "PER_DAY" ? "per day" : "per event"}
            </span>
          </div>

          {/* Vendor Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            {item.vendor.logoUrl ? (
              <img
                src={item.vendor.logoUrl}
                alt={item.vendor.businessName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-brand-primary" />
              </div>
            )}
            <div className="flex-1">
              <Link
                href={`/vendors/${item.vendor.slug}`}
                className="font-medium hover:text-brand-primary transition-colors"
              >
                {item.vendor.businessName}
              </Link>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{item.serviceLocation}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <Separator />

          {/* Delivery & Setup Options */}
          <div className="space-y-3">
            <h2 className="font-semibold">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.deliveryAvailable && (
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Delivery Available</p>
                    {item.deliveryCharge && (
                      <p className="text-xs text-muted-foreground">
                        <CurrencyDisplay amount={Number(item.deliveryCharge)} /> charge
                      </p>
                    )}
                  </div>
                </div>
              )}
              {item.setupAvailable && (
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <Wrench className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Setup Available</p>
                    {item.setupCharge && (
                      <p className="text-xs text-muted-foreground">
                        <CurrencyDisplay amount={Number(item.setupCharge)} /> charge
                      </p>
                    )}
                  </div>
                </div>
              )}
              {!item.deliveryAvailable && !item.setupAvailable && (
                <p className="text-sm text-muted-foreground">
                  Pickup only — no delivery or setup service
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Add to Cart Section (Client Component) */}
          <RentalItemActions
            item={{
              id: item.id,
              name: item.name,
              vendorId: item.vendor.id,
              vendorName: item.vendor.businessName,
              unitPrice: Number(item.pricePerUnit),
              totalQuantity: item.totalQuantity,
              minOrderQuantity: item.minOrderQuantity,
              deliveryAvailable: item.deliveryAvailable,
              deliveryCharge: item.deliveryCharge ? Number(item.deliveryCharge) : 0,
              serviceLocation: item.serviceLocation,
              inventory: item.inventory.map((inv) => ({
                eventDate: inv.eventDate.toISOString(),
                reservedQty: inv.reservedQty,
              })),
            }}
          />
        </div>
      </div>
    </div>
  )
}
