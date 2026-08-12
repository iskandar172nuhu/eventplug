import { Suspense } from "react"
import { HeroSearch } from "@/components/marketing/HeroSearch"

export const dynamic = "force-dynamic"
import { PopularCategories } from "@/components/marketing/PopularCategories"
import { FeaturedVendors } from "@/components/marketing/FeaturedVendors"
import { PopularRentalCategories } from "@/components/marketing/PopularRentalCategories"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { ValuePropositions } from "@/components/marketing/ValuePropositions"
import { TestimonialsPlaceholder } from "@/components/marketing/TestimonialsPlaceholder"
import { VendorCTA } from "@/components/marketing/VendorCTA"
import { Footer } from "@/components/marketing/Footer"
import { SkeletonCard } from "@/components/shared"

function CategoriesSkeleton() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center px-4 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop')",
          }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        {/* Subtle brand-coloured bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative max-w-7xl mx-auto text-center py-20 md:py-32">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-white/90">
            🎉 Ghana&apos;s #1 Event Services Marketplace
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Plan Your Perfect Event<br className="hidden md:block" /> with <span className="text-brand-secondary">EventPlug</span>
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover trusted vendors, compare prices, and book decorators, photographers, caterers, DJs, and rental equipment — all in one place.
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* Popular Categories */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <PopularCategories />
      </Suspense>

      {/* Featured Vendors */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <FeaturedVendors />
      </Suspense>

      {/* Popular Rental Categories */}
      <Suspense fallback={<CategoriesSkeleton />}>
        <PopularRentalCategories />
      </Suspense>

      {/* How It Works */}
      <HowItWorks />

      {/* Value Propositions */}
      <ValuePropositions />

      {/* Testimonials */}
      <TestimonialsPlaceholder />

      {/* Vendor CTA */}
      <VendorCTA />

      {/* Footer */}
      <Footer />
    </main>
  )
}
