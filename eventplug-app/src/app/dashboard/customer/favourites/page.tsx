import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { EmptyState } from "@/components/shared"
import { FavouriteVendorList } from "./favourite-list"

export default async function CustomerFavouritesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login")
  }

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    redirect("/login")
  }

  const favourites = await db.favourite.findMany({
    where: { customerId: customerProfile.id },
    include: {
      vendor: {
        include: {
          primaryCategory: { select: { name: true } },
          servicePackages: {
            where: { isActive: true },
            select: { startingPrice: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (favourites.length === 0) {
    return (
      <EmptyState
        title="No favourites yet"
        description="Save vendors you like to quickly find them later."
      />
    )
  }

  const serializedFavourites = favourites.map((fav) => ({
    vendorId: fav.vendorId,
    businessName: fav.vendor.businessName,
    slug: fav.vendor.slug,
    logoUrl: fav.vendor.logoUrl,
    coverImageUrl: fav.vendor.coverImageUrl,
    categoryName: fav.vendor.primaryCategory.name,
    serviceLocations: fav.vendor.serviceLocations,
    averageRating: fav.vendor.averageRating,
    totalReviews: fav.vendor.totalReviews,
    startingPrice: fav.vendor.servicePackages.length > 0
      ? Math.min(
          ...fav.vendor.servicePackages.map((sp) =>
            typeof sp.startingPrice === "object"
              ? parseFloat(sp.startingPrice.toString())
              : Number(sp.startingPrice)
          )
        ).toString()
      : null,
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Favourites</h2>
      <FavouriteVendorList vendors={serializedFavourites} />
    </div>
  )
}
