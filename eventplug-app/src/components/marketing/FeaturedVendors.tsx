import Link from "next/link"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export async function FeaturedVendors() {
  const vendors = await db.vendorProfile.findMany({
    where: {
      isFeatured: true,
      status: "APPROVED",
    },
    take: 6,
    include: {
      primaryCategory: { select: { name: true } },
    },
    orderBy: { averageRating: "desc" },
  })

  if (vendors.length === 0) return null

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Featured Vendors
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Trusted professionals handpicked for quality
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Link key={vendor.id} href={`/vendors/${vendor.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  {vendor.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vendor.coverImageUrl}
                      alt={`${vendor.businessName} cover`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <Badge className="absolute top-3 right-3" variant="secondary">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {vendor.businessName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {vendor.primaryCategory.name}
                      </p>
                    </div>
                    {vendor.isPhoneVerified && vendor.isBusinessVerified && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {vendor.averageRating.toFixed(1)}
                    </span>
                    <span>{vendor.totalReviews} reviews</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {vendor.serviceLocations.slice(0, 2).join(", ")}
                    {vendor.serviceLocations.length > 2 && " +more"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
