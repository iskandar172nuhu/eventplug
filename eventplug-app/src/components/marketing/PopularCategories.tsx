import Link from "next/link"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import {
  Palette,
  ClipboardList,
  CalendarCheck,
  Camera,
  UtensilsCrossed,
  Music,
  Mic2,
  Sparkles,
  Video,
  ShieldCheck,
  Flower2,
  Users,
  AudioLines,
  Lightbulb,
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

// Map category names to Lucide icons
const categoryIcons: Record<string, React.ReactNode> = {
  "Event Decor": <Palette className="h-6 w-6" />,
  "Event Planning": <ClipboardList className="h-6 w-6" />,
  "Event Coordinator": <CalendarCheck className="h-6 w-6" />,
  "Photography": <Camera className="h-6 w-6" />,
  "Catering": <UtensilsCrossed className="h-6 w-6" />,
  "DJ & Music": <Music className="h-6 w-6" />,
  "MC Services": <Mic2 className="h-6 w-6" />,
  "Hair & Makeup": <Sparkles className="h-6 w-6" />,
  "Videography": <Video className="h-6 w-6" />,
  "Security": <ShieldCheck className="h-6 w-6" />,
  "Florist": <Flower2 className="h-6 w-6" />,
  "Ushering": <Users className="h-6 w-6" />,
  "Sound Engineering": <AudioLines className="h-6 w-6" />,
  "Lighting": <Lightbulb className="h-6 w-6" />,
  "Chairs & Tables": <Armchair className="h-6 w-6" />,
  "Canopies & Tents": <Tent className="h-6 w-6" />,
  "Sound & Lighting Equipment": <Speaker className="h-6 w-6" />,
  "Stage & Risers": <Layers className="h-6 w-6" />,
  "Linen & Tablecloth": <Shirt className="h-6 w-6" />,
  "Crockery & Cutlery": <Wine className="h-6 w-6" />,
  "Generator Hire": <Zap className="h-6 w-6" />,
  "Decoration Props": <Star className="h-6 w-6" />,
  "Photo Booth": <CameraIcon className="h-6 w-6" />,
}

function CategoryIcon({ name }: { name: string }) {
  const icon = categoryIcons[name]
  if (icon) return <>{icon}</>
  return <ClipboardList className="h-6 w-6" />
}

export async function PopularCategories() {
  const categories = await db.vendorCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })

  if (categories.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Popular Categories
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Find the perfect vendor for your event
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/vendors?categoryId=${category.id}`}
            >
              <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-3 group-hover:bg-brand-primary/20 transition-colors text-brand-primary">
                    <CategoryIcon name={category.name} />
                  </div>
                  <span className="font-medium text-sm">{category.name}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
