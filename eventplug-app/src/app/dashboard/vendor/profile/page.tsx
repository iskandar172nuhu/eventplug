import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { ProfileForm } from "./profile-form"

export default async function VendorProfilePage() {
  const session = await getSession()
  if (!session || session.user.role !== "VENDOR") {
    redirect("/login")
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      businessName: true,
      description: true,
      logoUrl: true,
      coverImageUrl: true,
      serviceLocations: true,
      isPhoneVerified: true,
      isGhanaCardVerified: true,
      isBusinessVerified: true,
      isAddressVerified: true,
    },
  })

  if (!vendorProfile) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Business Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your business information, service locations, and images.
        </p>
      </div>
      <ProfileForm profile={vendorProfile} />
    </div>
  )
}
