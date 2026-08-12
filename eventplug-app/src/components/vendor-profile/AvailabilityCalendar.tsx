"use client"

import * as React from "react"
import { addMonths, isSameDay, parseISO, startOfToday } from "date-fns"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  unavailableDates: string[]
  limitedDates: string[]
}

export function AvailabilityCalendar({
  unavailableDates,
  limitedDates,
}: AvailabilityCalendarProps) {
  const today = startOfToday()
  const endDate = addMonths(today, 3)

  const unavailableParsed = React.useMemo(
    () => unavailableDates.map((d) => parseISO(d)),
    [unavailableDates]
  )
  const limitedParsed = React.useMemo(
    () => limitedDates.map((d) => parseISO(d)),
    [limitedDates]
  )

  const isUnavailable = (date: Date) =>
    unavailableParsed.some((d) => isSameDay(d, date))
  const isLimited = (date: Date) =>
    limitedParsed.some((d) => isSameDay(d, date))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Availability</h2>

      <DayPicker
        numberOfMonths={3}
        startMonth={today}
        endMonth={endDate}
        modifiers={{
          unavailable: unavailableParsed,
          limited: limitedParsed,
        }}
        className="bg-background p-3"
        components={{
          DayButton: ({ day, modifiers, className, ...props }) => {
            const date = day.date
            const unavail = isUnavailable(date)
            const limited = isLimited(date)

            return (
              <button
                type="button"
                className={cn(
                  "relative flex aspect-square h-8 w-8 flex-col items-center justify-center gap-0.5 rounded-md text-sm font-normal",
                  className
                )}
                disabled
                {...props}
              >
                <span>{date.getDate()}</span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    unavail
                      ? "bg-red-500"
                      : limited
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  )}
                  aria-hidden="true"
                />
              </button>
            )
          },
        }}
      />

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}
