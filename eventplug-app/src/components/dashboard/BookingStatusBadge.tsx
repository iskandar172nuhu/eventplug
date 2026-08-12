import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BookingStatus } from "@prisma/client"

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  QUOTE_REQUESTED: {
    label: "Quote Requested",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  QUOTE_SENT: {
    label: "Quote Sent",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  AWAITING_DEPOSIT: {
    label: "Awaiting Deposit",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
