import { Search, MessageSquare, CalendarCheck } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Search Vendors",
    description:
      "Browse our curated marketplace of verified event vendors across Ghana. Filter by location, date, and category.",
  },
  {
    icon: MessageSquare,
    title: "Get Quotes & Compare",
    description:
      "Request quotes from multiple vendors, compare pricing side by side, and ask questions directly on the platform.",
  },
  {
    icon: CalendarCheck,
    title: "Book & Pay",
    description:
      "Confirm your booking with a secure deposit. Track your event preparations and pay balances on your schedule.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Plan your perfect event in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="relative mx-auto mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
