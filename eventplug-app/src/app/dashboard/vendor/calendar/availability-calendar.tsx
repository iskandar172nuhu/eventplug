"use client"

import { useState, useTransition } from "react"
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay, startOfWeek, endOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { setAvailabilityAction } from "@/actions/vendor"

interface AvailabilityRecord {
  id: string
  date: string | null
  dayOfWeek: number | null
  isUnavailable: boolean
}

interface AvailabilityCalendarProps {
  initialRecords: AvailabilityRecord[]
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function AvailabilityCalendar({ initialRecords }: AvailabilityCalendarProps) {
  const [records, setRecords] = useState(initialRecords)
  const [isPending, startTransition] = useTransition()
  const today = new Date()
  const [baseMonth, setBaseMonth] = useState(startOfMonth(today))

  // Get unavailable specific dates
  const unavailableDates = records
    .filter((r) => r.date && !r.dayOfWeek && r.isUnavailable)
    .map((r) => new Date(r.date!))

  // Get recurring unavailable days
  const unavailableDays = records
    .filter((r) => r.dayOfWeek !== null && r.date === null && r.isUnavailable)
    .map((r) => r.dayOfWeek!)

  const isDateUnavailable = (date: Date) => {
    // Check specific date
    if (unavailableDates.some((d) => isSameDay(d, date))) return true
    // Check recurring day of week
    if (unavailableDays.includes(getDay(date))) return true
    return false
  }

  const handleToggleDate = (date: Date) => {
    const formData = new FormData()
    formData.set("action", "toggle_date")
    formData.set("date", format(date, "yyyy-MM-dd"))

    startTransition(async () => {
      const result = await setAvailabilityAction(formData)
      if (result.success) {
        // Optimistic update
        const dateStr = format(date, "yyyy-MM-dd")
        const existingIdx = records.findIndex(
          (r) => r.date === dateStr && r.dayOfWeek === null
        )
        if (existingIdx >= 0) {
          setRecords(records.filter((_, i) => i !== existingIdx))
        } else {
          setRecords([
            ...records,
            { id: "new-" + Date.now(), date: dateStr, dayOfWeek: null, isUnavailable: true },
          ])
        }
        toast.success("Availability updated")
      }
    })
  }

  const handleToggleDay = (dayOfWeek: number) => {
    const formData = new FormData()
    formData.set("action", "toggle_day")
    formData.set("dayOfWeek", dayOfWeek.toString())

    startTransition(async () => {
      const result = await setAvailabilityAction(formData)
      if (result.success) {
        const existingIdx = records.findIndex(
          (r) => r.dayOfWeek === dayOfWeek && r.date === null
        )
        if (existingIdx >= 0) {
          setRecords(records.filter((_, i) => i !== existingIdx))
        } else {
          setRecords([
            ...records,
            { id: "new-" + Date.now(), date: null, dayOfWeek, isUnavailable: true },
          ])
        }
        toast.success("Recurring availability updated")
      }
    })
  }

  // Generate 3 months of calendar
  const months = [baseMonth, addMonths(baseMonth, 1), addMonths(baseMonth, 2)]

  return (
    <div className="space-y-6">
      {/* Recurring weekly unavailability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recurring Weekly Unavailability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Mark days of the week when you are always unavailable.
          </p>
          <div className="flex flex-wrap gap-4">
            {DAY_NAMES.map((day, index) => (
              <label
                key={day}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={unavailableDays.includes(index)}
                  onCheckedChange={() => handleToggleDay(index)}
                  disabled={isPending}
                />
                <span className="text-sm">{day}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3-month calendar view */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Availability Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBaseMonth(addMonths(baseMonth, -1))}
              disabled={isPending}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setBaseMonth(addMonths(baseMonth, 1))}
              disabled={isPending}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Click on a date to toggle it as unavailable. Red dates indicate you are unavailable.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {months.map((month) => (
              <MonthGrid
                key={month.toISOString()}
                month={month}
                isDateUnavailable={isDateUnavailable}
                onToggleDate={handleToggleDate}
                isPending={isPending}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-100 border border-green-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-100 border border-red-300" />
              <span>Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MonthGrid({
  month,
  isDateUnavailable,
  onToggleDate,
  isPending,
}: {
  month: Date
  isDateUnavailable: (date: Date) => boolean
  onToggleDate: (date: Date) => void
  isPending: boolean
}) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return (
    <div>
      <h3 className="text-sm font-medium text-center mb-2">
        {format(month, "MMMM yyyy")}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {DAY_SHORT.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d.charAt(0)}
          </div>
        ))}
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === month.getMonth()
          const unavailable = isDateUnavailable(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!isCurrentMonth || isPending}
              onClick={() => isCurrentMonth && onToggleDate(day)}
              className={cn(
                "h-8 w-8 text-xs rounded flex items-center justify-center transition-colors",
                !isCurrentMonth && "text-muted-foreground/30 cursor-default",
                isCurrentMonth && unavailable && "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200",
                isCurrentMonth && !unavailable && "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
                isPending && "opacity-50"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
