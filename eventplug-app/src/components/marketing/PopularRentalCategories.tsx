import Link from "next/link"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import {
  Armchair,
  Tent,
  Speaker,
  Layers,
  Shirt,
  Wine,
  Zap,
  Star,
  CameraIcon,
} from "lucide-react"

const rentalIcons: Record<string, React.ReactNode> = {
  "Chairs & Tables": <Armchair className="h-7 w-7" />,
  "Canopies & Tents": <Tent className="h-7 w-7" />,
  "Sound & Lighting Equipment": <Speaker className="h-7 w-7" />,
  "Stage & Risers": <Layers className="h-7 w-7" />,
  "Linen & Tablecloth": <Shirt className="h-7 w-7" />,
  "Crockery & Cutlery": <Wine className="h-7 w-7" />,
  "Generator Hire": <Zap className="h-7 w-7" />,
  "Decoration Props": <Star className="h-7 w-7" />,
  "Photo Booth": <CameraIcon className="h-7 w-7" />,
}

function RentalIcon({ name }: { name: string }) {
  const icon = rentalIcons[name]
  if (icon) return <>{icon}</>
  return <Armchair className="h-7 w-7" />
}

export async function PopularRentalCategories() {
  const categories = await db.vendorCategory.findMany({
    where: {
      isActive: true,
      type: { in: ["RENTAL", "BOTH"] },
    },
    take: 8,
    orderBy: { displayOrder: "asc" },
  })

  if (categories.length === 0) return null

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Popular Rental Items
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Everything you need for a perfect event setup
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/rentals?categoryId=${category.id}`}
            >
              <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-secondary/10 flex items-center justify-center mb-4 group-hover:bg-brand-secondary/20 transition-colors text-brand-secondary">
                    <RentalIcon name={category.name} />
                  </div>
                  <span className="font-semibold text-sm">{category.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
