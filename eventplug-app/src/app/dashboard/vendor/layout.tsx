import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { ToastProvider } from "@/components/shared"
import { VendorDashboardShell } from "./dashboard-shell"

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  let businessName = "Vendor"
  if (session?.user?.vendorProfileId) {
    const profile = await db.vendorProfile.findUnique({
      where: { id: session.user.vendorProfileId },
      select: { businessName: true },
    })
    if (profile) {
      businessName = profile.businessName
    }
  }

  return (
    <>
      <ToastProvider />
      <VendorDashboardShell businessName={businessName}>
        {children}
      </VendorDashboardShell>
    </>
  )
}
