import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const customerBenefits = [
  "Discover verified vendors in one place",
  "Compare quotes side by side",
  "Secure online payments with GH₵",
  "Read genuine reviews from real customers",
  "Track bookings and communicate directly",
  "No more scattered WhatsApp inquiries",
]

const vendorBenefits = [
  "Reach thousands of event planners across Ghana",
  "Manage bookings and calendar in one dashboard",
  "Get paid securely through the platform",
  "Showcase your portfolio and build reputation",
  "Automated quote management and reminders",
  "Grow your business with featured placement",
]

export function ValuePropositions() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Why Choose EventPlug?
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Built for both customers and vendors
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">For Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {customerBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">For Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {vendorBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
