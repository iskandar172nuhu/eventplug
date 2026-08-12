import { notFound } from "next/navigation"
import { addMonths, format, startOfToday, eachDayOfInterval } from "date-fns"

import { db } from "@/lib/db"
import { getSession } from "@/lib/auth/guards"
import { ProfileHeader } from "@/components/vendor-profile/ProfileHeader"
import { ServicePackageCard } from "@/components/vendor-profile/ServicePackageCard"
import { PortfolioGallery } from "@/components/vendor-profile/PortfolioGallery"
import { ReviewsList } from "@/components/vendor-profile/ReviewsList"
import { AvailabilityCalendar } from "@/components/vendor-profile/AvailabilityCalendar"

interface VendorProfilePageProps {
  params: { slug: string }
}

export default async function VendorProfilePage({ params }: VendorProfilePageProps) {
  const { slug } = params

  const vendor = await db.vendorProfile.findUnique({
    where: { slug },
    include: {
      primaryCategory: true,
      portfolioImages: { orderBy: { order: "asc" } },
      servicePackages: { where: { isActive: true } },
      rentalItems: { where: { isActive: true } },
      reviews: {
        where: { isVisible: true },
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      availability: true,
    },
  })

  if (!vendor || vendor.status !== "APPROVED") {
    notFound()
  }

  const session = await getSession()
  const isAuthenticated = !!session

  // Compute unavailable and limited dates for the availability calendar
  const today = startOfToday()
  const endDate = addMonths(today, 3)

  // Get all days in the 3-month window
  const allDays = eachDayOfInterval({ start: today, end: endDate })

  // Build sets of unavailable dates from vendor availability records
  const unavailableDates: string[] = []
  const limitedDates: string[] = []

  // Specific dates marked unavailable
  const specificUnavailable = new Set(
    vendor.availability
      .filter((a) => a.isUnavailable && a.date)
      .map((a) => format(a.date!, "yyyy-MM-dd"))
  )

  // Recurring weekday unavailability
  const recurringUnavailableDays = new Set(
    vendor.availability
      .filter((a) => a.isUnavailable && a.dayOfWeek !== null)
      .map((a) => a.dayOfWeek!)
  )

  // Get bookings for this vendor in the date range to determine limited dates
  const bookings = await db.booking.findMany({
    where: {
      vendorId: vendor.id,
      eventDate: { gte: today, lte: endDate },
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
    },
    select: { eventDate: true },
  })

  const bookedDateCounts = new Map<string, number>()
  for (const booking of bookings) {
    const dateStr = format(booking.eventDate, "yyyy-MM-dd")
    bookedDateCounts.set(dateStr, (bookedDateCounts.get(dateStr) || 0) + 1)
  }

  for (const day of allDays) {
    const dateStr = format(day, "yyyy-MM-dd")
    const dayOfWeek = day.getDay()

    if (specificUnavailable.has(dateStr) || recurringUnavailableDays.has(dayOfWeek)) {
      unavailableDates.push(dateStr)
    } else if (bookedDateCounts.has(dateStr)) {
      limitedDates.push(dateStr)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      <ProfileHeader vendor={vendor} isAuthenticated={isAuthenticated} />

      {/* Service Packages */}
      {vendor.servicePackages.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Service Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendor.servicePackages.map((pkg) => (
              <ServicePackageCard
                key={pkg.id}
                name={pkg.name}
                description={pkg.description}
                includedServices={pkg.includedServices}
                startingPrice={Number(pkg.startingPrice)}
                addOns={(pkg.addOns as { name: string; price: number }[] | null) ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Portfolio Gallery */}
      <PortfolioGallery images={vendor.portfolioImages} />

      {/* Reviews */}
      <ReviewsList reviews={vendor.reviews} />

      {/* Availability Calendar */}
      <AvailabilityCalendar
        unavailableDates={unavailableDates}
        limitedDates={limitedDates}
      />
    </div>
  )
}
