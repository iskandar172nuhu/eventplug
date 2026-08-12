import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"

interface AddOn {
  name: string
  price: number | string
}

interface ServicePackageCardProps {
  name: string
  description: string
  includedServices: string[]
  startingPrice: number | string
  addOns?: AddOn[]
}

export function ServicePackageCard({
  name,
  description,
  includedServices,
  startingPrice,
  addOns,
}: ServicePackageCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Included Services */}
        <div>
          <h4 className="text-sm font-medium mb-2">Included Services</h4>
          <ul className="space-y-1">
            {includedServices.map((service, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-brand-primary mt-0.5">✓</span>
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Add-ons */}
        {addOns && addOns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Optional Add-ons</h4>
            <div className="flex flex-wrap gap-2">
              {addOns.map((addOn, idx) => (
                <Badge key={idx} variant="outline" className="font-normal">
                  {addOn.name} — <CurrencyDisplay amount={addOn.price} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Starting Price */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <CurrencyDisplay
            amount={startingPrice}
            className="text-xl font-bold text-brand-primary"
          />
        </div>
      </CardContent>
    </Card>
  )
}
