import { SiteHeader } from "@/components/layout/SiteHeader"

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}
