import { BookingStatus } from "@prisma/client"
import { BookingConflictError } from "@/lib/errors"

export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["QUOTE_REQUESTED", "AWAITING_DEPOSIT", "CANCELLED"],
  QUOTE_REQUESTED: ["QUOTE_SENT", "CANCELLED"],
  QUOTE_SENT: ["AWAITING_DEPOSIT", "CANCELLED"],
  AWAITING_DEPOSIT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "DISPUTED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  DISPUTED: ["COMPLETED", "CANCELLED"],
}

export function assertValidTransition(from: BookingStatus, to: BookingStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from]
  if (!allowed || !allowed.includes(to)) {
    throw new BookingConflictError(
      `Cannot transition booking from ${from} to ${to}`
    )
  }
}

export function getValidTransitions(status: BookingStatus): BookingStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? []
}

export function isTerminalStatus(status: BookingStatus): boolean {
  return (
    status === "CANCELLED" ||
    (status === "COMPLETED" && ALLOWED_TRANSITIONS[status].length <= 1)
  )
}
