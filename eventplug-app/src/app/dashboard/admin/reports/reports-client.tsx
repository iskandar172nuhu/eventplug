"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { BookingStatus, PaymentType, PaymentMethod, PaymentStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurrencyDisplay } from "@/components/shared"
import { BookingStatusBadge } from "@/components/dashboard/BookingStatusBadge"

interface BookingRow {
  id: string
  customerName: string
  vendorName: string
  eventDate: string
  status: BookingStatus
  totalAmount: string
}

interface PaymentRow {
  id: string
  bookingRef: string
  amount: string
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  status: PaymentStatus
  date: string
}

interface VendorActivityRow {
  id: string
  vendorName: string
  bookingsCount: number
  totalEarned: string
  avgRating: number
}

interface AdminReportsClientProps {
  bookings: BookingRow[]
  payments: PaymentRow[]
  vendorActivity: VendorActivityRow[]
  filters: { from: string; to: string }
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminReportsClient({
  bookings,
  payments,
  vendorActivity,
  filters,
}: AdminReportsClientProps) {
  const router = useRouter()
  const [from, setFrom] = useState(filters.from)
  const [to, setTo] = useState(filters.to)

  function applyFilters() {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    router.push(`/dashboard/admin/reports?${params.toString()}`)
  }

  function exportBookingsCSV() {
    const headers = ["Customer", "Vendor", "Event Date", "Status", "Total Amount (GH₵)"]
    const rows = bookings.map((b) => [
      b.customerName,
      b.vendorName,
      new Date(b.eventDate).toLocaleDateString("en-GH"),
      b.status,
      b.totalAmount,
    ])
    downloadCSV("bookings-report.csv", headers, rows)
  }

  function exportPaymentsCSV() {
    const headers = ["Booking Ref", "Amount (GH₵)", "Type", "Method", "Status", "Date"]
    const rows = payments.map((p) => [
      p.bookingRef,
      p.amount,
      p.paymentType,
      p.paymentMethod,
      p.status,
      new Date(p.date).toLocaleDateString("en-GH"),
    ])
    downloadCSV("payments-report.csv", headers, rows)
  }

  function exportVendorActivityCSV() {
    const headers = ["Vendor", "Bookings", "Total Earned (GH₵)", "Avg Rating"]
    const rows = vendorActivity.map((v) => [
      v.vendorName,
      String(v.bookingsCount),
      v.totalEarned,
      v.avgRating.toFixed(1),
    ])
    downloadCSV("vendor-activity-report.csv", headers, rows)
  }

  const hasData = filters.from || filters.to

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <Button onClick={applyFilters}>Generate Report</Button>
      </div>

      {!hasData ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Select a date range and click &quot;Generate Report&quot; to view data.
        </p>
      ) : (
        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
            <TabsTrigger value="vendor-activity">
              Vendor Activity ({vendorActivity.length})
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportBookingsCSV} disabled={bookings.length === 0}>
                Export CSV
              </Button>
            </div>
            {bookings.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No bookings in this period.</p>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.customerName}</TableCell>
                        <TableCell>{b.vendorName}</TableCell>
                        <TableCell>
                          {new Date(b.eventDate).toLocaleDateString("en-GH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <BookingStatusBadge status={b.status} />
                        </TableCell>
                        <TableCell>
                          <CurrencyDisplay amount={b.totalAmount} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportPaymentsCSV} disabled={payments.length === 0}>
                Export CSV
              </Button>
            </div>
            {payments.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No payments in this period.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking Ref</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.bookingRef}</TableCell>
                        <TableCell>
                          <CurrencyDisplay amount={p.amount} />
                        </TableCell>
                        <TableCell>{p.paymentType}</TableCell>
                        <TableCell>{p.paymentMethod.replace(/_/g, " ")}</TableCell>
                        <TableCell>{p.status}</TableCell>
                        <TableCell>
                          {new Date(p.date).toLocaleDateString("en-GH", {
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
          </TabsContent>

          {/* Vendor Activity Tab */}
          <TabsContent value="vendor-activity" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportVendorActivityCSV} disabled={vendorActivity.length === 0}>
                Export CSV
              </Button>
            </div>
            {vendorActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No vendor activity in this period.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Earned</TableHead>
                      <TableHead>Avg Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorActivity.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.vendorName}</TableCell>
                        <TableCell>{v.bookingsCount}</TableCell>
                        <TableCell>
                          <CurrencyDisplay amount={v.totalEarned} />
                        </TableCell>
                        <TableCell>{v.avgRating.toFixed(1)} ★</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
