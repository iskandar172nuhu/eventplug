"use client"

import { useRouter } from "next/navigation"
import type { BookingStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"
import { CurrencyDisplay } from "@/components/shared"

const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "QUOTE_REQUESTED",
  "QUOTE_SENT",
  "AWAITING_DEPOSIT",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
]

interface BookingRow {
  id: string
  customerName: string
  vendorName: string
  eventDate: string
  status: BookingStatus
  totalAmount: string
  createdAt: string
}

interface AdminBookingsListProps {
  bookings: BookingRow[]
  categories: { id: string; name: string }[]
  currentPage: number
  totalPages: number
  total: number
  filters: {
    status: string
    from: string
    to: string
    category: string
  }
}

export function AdminBookingsList({
  bookings,
  categories,
  currentPage,
  totalPages,
  total,
  filters,
}: AdminBookingsListProps) {
  const router = useRouter()

  function updateFilters(updates: Partial<typeof filters & { page: string }>) {
    const params = new URLSearchParams()
    const merged = { ...filters, ...updates }

    if (merged.status) params.set("status", merged.status)
    if (merged.from) params.set("from", merged.from)
    if (merged.to) params.set("to", merged.to)
    if (merged.category) params.set("category", merged.category)
    if (updates.page) params.set("page", updates.page)

    router.push(`/dashboard/admin/bookings?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              updateFilters({ status: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {BOOKING_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => updateFilters({ from: e.target.value })}
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => updateFilters({ to: e.target.value })}
            className="w-[160px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              updateFilters({ category: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
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
      </div>

      <p className="text-sm text-muted-foreground">{total} booking{total !== 1 ? "s" : ""} found</p>

      {/* Table */}
      {bookings.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No bookings match the selected filters.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.customerName}</TableCell>
                  <TableCell>{booking.vendorName}</TableCell>
                  <TableCell>
                    {new Date(booking.eventDate).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={booking.totalAmount} />
                  </TableCell>
                  <TableCell>
                    {new Date(booking.createdAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateFilters({ page: String(currentPage - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilters({ page: String(currentPage + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
