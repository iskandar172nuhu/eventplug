import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export function TestimonialsPlaceholder() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            What Our Users Say
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Real stories from customers and vendors
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground text-sm">
                  Testimonials coming soon
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Be one of the first to share your experience
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
