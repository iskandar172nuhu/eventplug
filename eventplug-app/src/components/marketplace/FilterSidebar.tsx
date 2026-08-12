"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Separator } from "@/components/ui/separator"
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

interface FilterSidebarProps {
  categories?: Category[]
}

export function FilterSidebar({ categories = [] }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categoryId, setCategoryId] = React.useState(
    searchParams.get("categoryId") ?? ""
  )
  const [location, setLocation] = React.useState(
    searchParams.get("location") ?? ""
  )
  const [minPrice, setMinPrice] = React.useState(
    searchParams.get("minPrice") ?? ""
  )
  const [maxPrice, setMaxPrice] = React.useState(
    searchParams.get("maxPrice") ?? ""
  )
  const [minRating, setMinRating] = React.useState(
    searchParams.get("minRating") ?? ""
  )
  const [verifiedOnly, setVerifiedOnly] = React.useState(
    searchParams.get("verified") === "true"
  )
  const [date, setDate] = React.useState<Date | undefined>(
    searchParams.get("date")
      ? new Date(searchParams.get("date")!)
      : undefined
  )
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  function updateFilters(overrides?: Record<string, string | undefined>) {
    const params = new URLSearchParams()

    const values: Record<string, string | undefined> = {
      categoryId: categoryId || undefined,
      location: location || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      verified: verifiedOnly ? "true" : undefined,
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      ...overrides,
    }

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value)
      }
    }

    router.push(`/vendors?${params.toString()}`)
  }

  function clearFilters() {
    setCategoryId("")
    setLocation("")
    setMinPrice("")
    setMaxPrice("")
    setMinRating("")
    setVerifiedOnly(false)
    setDate(undefined)
    router.push("/vendors")
  }

  const hasActiveFilters =
    categoryId || location || minPrice || maxPrice || minRating || verifiedOnly || date

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value)
            updateFilters({ categoryId: value || undefined })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <Select
          value={location}
          onValueChange={(value) => {
            setLocation(value)
            updateFilters({ location: value || undefined })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All locations" />
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

      <Separator />

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range (GH₵)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => updateFilters({ minPrice: minPrice || undefined })}
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => updateFilters({ maxPrice: maxPrice || undefined })}
            min={0}
          />
        </div>
      </div>

      <Separator />

      {/* Min Rating */}
      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <Select
          value={minRating}
          onValueChange={(value) => {
            setMinRating(value)
            updateFilters({ minRating: value || undefined })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((rating) => (
              <SelectItem key={rating} value={String(rating)}>
                {rating}+ Stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Verified Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified-only"
          checked={verifiedOnly}
          onCheckedChange={(checked) => {
            const value = checked === true
            setVerifiedOnly(value)
            updateFilters({ verified: value ? "true" : undefined })
          }}
        />
        <Label htmlFor="verified-only" className="cursor-pointer">
          Verified vendors only
        </Label>
      </div>

      <Separator />

      {/* Date Availability */}
      <div className="space-y-2">
        <Label>Available on Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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
                updateFilters({
                  date: day ? format(day, "yyyy-MM-dd") : undefined,
                })
              }}
              disabled={(day) => day < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
