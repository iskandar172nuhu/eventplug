"use client"

import { useState } from "react"
import type { VendorStatus } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/shared"
import { cn } from "@/lib/utils"
import { approveVendorAction, suspendVendorAction } from "@/actions/admin"

interface VendorRow {
  id: string
  businessName: string
  ownerFullName: string
  email: string
  categoryName: string
  serviceLocations: string[]
  status: VendorStatus
  createdAt: string
}

const statusBadgeStyles: Record<VendorStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  SUSPENDED: "bg-red-100 text-red-800 border-red-200",
}

interface AdminVendorListProps {
  vendors: VendorRow[]
}

export function AdminVendorList({ vendors }: AdminVendorListProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    vendorId: string
    action: "suspend"
  } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleApprove(vendorId: string) {
    setLoading(vendorId)
    await approveVendorAction(vendorId)
    setLoading(null)
  }

  function handleSuspendClick(vendorId: string) {
    setPendingAction({ vendorId, action: "suspend" })
    setConfirmOpen(true)
  }

  async function handleConfirmSuspend() {
    if (!pendingAction) return
    setLoading(pendingAction.vendorId)
    await suspendVendorAction(pendingAction.vendorId)
    setLoading(null)
    setPendingAction(null)
  }

  function filterVendors(status?: VendorStatus) {
    if (!status) return vendors
    return vendors.filter((v) => v.status === status)
  }

  function renderVendorRow(vendor: VendorRow) {
    return (
      <Card key={vendor.id}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{vendor.businessName}</p>
                <Badge
                  variant="outline"
                  className={cn(statusBadgeStyles[vendor.status])}
                >
                  {vendor.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Owner: {vendor.ownerFullName} &middot; {vendor.email}
              </p>
              <p className="text-sm text-muted-foreground">
                Category: {vendor.categoryName} &middot; Location: {vendor.serviceLocations.join(", ") || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground">
                Registered: {new Date(vendor.createdAt).toLocaleDateString("en-GH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {vendor.status === "PENDING" && (
                <Button
                  size="sm"
                  onClick={() => handleApprove(vendor.id)}
                  disabled={loading === vendor.id}
                >
                  {loading === vendor.id ? "Approving..." : "Approve"}
                </Button>
              )}
              {vendor.status === "APPROVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleSuspendClick(vendor.id)}
                  disabled={loading === vendor.id}
                >
                  {loading === vendor.id ? "Suspending..." : "Suspend"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({vendors.length})</TabsTrigger>
          <TabsTrigger value="PENDING">
            Pending ({filterVendors("PENDING").length})
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            Approved ({filterVendors("APPROVED").length})
          </TabsTrigger>
          <TabsTrigger value="SUSPENDED">
            Suspended ({filterVendors("SUSPENDED").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {vendors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendors registered yet.</p>
          ) : (
            vendors.map(renderVendorRow)
          )}
        </TabsContent>

        {(["PENDING", "APPROVED", "SUSPENDED"] as VendorStatus[]).map((status) => (
          <TabsContent key={status} value={status} className="space-y-3 mt-4">
            {filterVendors(status).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No {status.toLowerCase()} vendors.
              </p>
            ) : (
              filterVendors(status).map(renderVendorRow)
            )}
          </TabsContent>
        ))}
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Suspend Vendor"
        description="Are you sure you want to suspend this vendor? They will no longer be visible on the marketplace."
        confirmText="Suspend"
        variant="destructive"
        onConfirm={handleConfirmSuspend}
      />
    </>
  )
}
