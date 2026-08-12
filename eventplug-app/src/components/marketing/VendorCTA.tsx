import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function VendorCTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Are You an Event Vendor?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join EventPlug and showcase your services to thousands of event
          planners across Ghana. Manage bookings, receive payments, and grow
          your business.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-base">
            <Link href="/register/vendor">
              Register as a Vendor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base">
            <Link href="/how-it-works">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
