"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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

interface RentalFiltersProps {
  categories?: Category[]
}

export function RentalFilters({ categories = [] }: RentalFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categoryId, setCategoryId] = React.useState(
    searchParams.get("categoryId") ?? ""
  )
  const [location, setLocation] = React.useState(
    searchParams.get("location") ?? ""
  )
  const [minQuantity, setMinQuantity] = React.useState(
    searchParams.get("minQuantity") ?? ""
  )
  const [date, setDate] = React.useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined
  )
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  function updateFilters(overrides?: Record<string, string | undefined>) {
    const params = new URLSearchParams()

    const values: Record<string, string | undefined> = {
      categoryId: categoryId || undefined,
      location: location || undefined,
      minQuantity: minQuantity || undefined,
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      ...overrides,
    }

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value)
      }
    }

    router.push(`/rentals?${params.toString()}`)
  }

  function clearFilters() {
    setCategoryId("")
    setLocation("")
    setMinQuantity("")
    setDate(undefined)
    router.push("/rentals")
  }

  const hasActiveFilters = categoryId || location || minQuantity || date

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Category */}
      <div className="space-y-1.5 w-full sm:w-auto">
        <Label className="text-xs">Category</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => {
            setCategoryId(value)
            updateFilters({ categoryId: value || undefined })
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

      {/* Location */}
      <div className="space-y-1.5 w-full sm:w-auto">
        <Label className="text-xs">Location</Label>
        <Select
          value={location}
          onValueChange={(value) => {
            setLocation(value)
            updateFilters({ location: value || undefined })
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
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

      {/* Date */}
      <div className="space-y-1.5 w-full sm:w-auto">
        <Label className="text-xs">Event Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[180px] justify-start text-left font-normal",
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

      {/* Min Quantity */}
      <div className="space-y-1.5 w-full sm:w-auto">
        <Label className="text-xs">Min Quantity</Label>
        <Input
          type="number"
          placeholder="e.g. 50"
          value={minQuantity}
          onChange={(e) => setMinQuantity(e.target.value)}
          onBlur={() => updateFilters({ minQuantity: minQuantity || undefined })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilters({ minQuantity: minQuantity || undefined })
            }
          }}
          min={1}
          className="w-full sm:w-[120px]"
        />
      </div>

      {/* Clear Button */}
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
  )
}
