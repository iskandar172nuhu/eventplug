"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface PhoneInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string
  onChange?: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value

      // Only allow digits, spaces, and the leading +
      const cleaned = input.replace(/[^\d+\s]/g, "")

      onChange?.(cleaned)
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          +233
        </span>
        <Input
          ref={ref}
          type="tel"
          placeholder="24 123 4567"
          value={value.replace(/^\+233/, "").replace(/^0/, "")}
          onChange={handleChange}
          maxLength={12}
          {...props}
        />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
