"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const GHANA_CITIES = [
  "Accra",
  "Tema",
  "Kumasi",
  "Cape Coast",
  "Takoradi",
  "Tamale",
  "Koforidua",
  "Ho",
] as const

interface Category {
  id: string
  name: string
}

export function HeroSearch() {
  const router = useRouter()
  const [location, setLocation] = React.useState("")
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [categoryId, setCategoryId] = React.useState("")
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const [categoriesLoading, setCategoriesLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true)
      try {
        const res = await fetch("/api/vendors/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch {
        // Silently fail — categories will just be empty
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  function handleSubmit() {
    const params = new URLSearchParams()
    if (location) params.set("location", location)
    if (date) params.set("date", format(date, "yyyy-MM-dd"))
    if (categoryId && categoryId !== "all") params.set("categoryId", categoryId)
    router.push(`/vendors?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          {/* Location Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Location
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {GHANA_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Event Date
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start text-left text-base font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => {
                    setDate(day)
                    setIsCalendarOpen(false)
                  }}
                  disabled={(day) => day < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder={categoriesLoading ? "Loading..." : "All categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="h-12 w-full text-base font-semibold"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
