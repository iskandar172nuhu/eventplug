"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog, CurrencyDisplay } from "@/components/shared"
import {
  createRentalItemAction,
  updateRentalInventoryAction,
  deleteRentalItemAction,
} from "@/actions/vendor"

interface RentalItemData {
  id: string
  name: string
  categoryName: string
  pricePerUnit: string
  pricingPeriod: string
  totalQuantity: number
  reservedQty: number
  isActive: boolean
  serviceLocation: string
}

interface InventoryRecord {
  rentalItemId: string
  eventDate: string
  reservedQty: number
}

interface Category {
  id: string
  name: string
}

interface InventoryManagerProps {
  initialItems: RentalItemData[]
  inventoryRecords: InventoryRecord[]
  categories: Category[]
}

export function InventoryManager({
  initialItems,
  inventoryRecords,
  categories,
}: InventoryManagerProps) {
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [calendarItemId, setCalendarItemId] = useState<string | null>(null)
  const [editingQty, setEditingQty] = useState<{ id: string; value: string } | null>(null)

  // Form state for creating items
  const [formState, setFormState] = useState({
    name: "",
    categoryId: "",
    description: "",
    pricePerUnit: "",
    pricingPeriod: "PER_DAY" as string,
    totalQuantity: "",
    minOrderQuantity: "1",
    serviceLocation: "",
    deliveryAvailable: false,
    deliveryCharge: "",
    setupAvailable: false,
    setupCharge: "",
  })

  const resetForm = () => {
    setFormState({
      name: "",
      categoryId: "",
      description: "",
      pricePerUnit: "",
      pricingPeriod: "PER_DAY",
      totalQuantity: "",
      minOrderQuantity: "1",
      serviceLocation: "",
      deliveryAvailable: false,
      deliveryCharge: "",
      setupAvailable: false,
      setupCharge: "",
    })
  }

  const handleCreateItem = () => {
    const formData = new FormData()
    formData.set("name", formState.name)
    formData.set("categoryId", formState.categoryId)
    formData.set("description", formState.description)
    formData.set("pricePerUnit", formState.pricePerUnit)
    formData.set("pricingPeriod", formState.pricingPeriod)
    formData.set("totalQuantity", formState.totalQuantity)
    formData.set("minOrderQuantity", formState.minOrderQuantity)
    formData.set("serviceLocation", formState.serviceLocation)
    formData.set("deliveryAvailable", formState.deliveryAvailable.toString())
    if (formState.deliveryCharge) formData.set("deliveryCharge", formState.deliveryCharge)
    formData.set("setupAvailable", formState.setupAvailable.toString())
    if (formState.setupCharge) formData.set("setupCharge", formState.setupCharge)

    startTransition(async () => {
      const result = await createRentalItemAction(formData)
      if (result.success) {
        toast.success("Rental item created")
        setFormOpen(false)
        resetForm()
        window.location.reload()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleUpdateQuantity = (itemId: string) => {
    if (!editingQty || editingQty.id !== itemId) return
    const qty = parseInt(editingQty.value)
    if (isNaN(qty) || qty < 0) {
      toast.error("Invalid quantity")
      return
    }

    startTransition(async () => {
      const result = await updateRentalInventoryAction(itemId, qty)
      if (result.success) {
        setItems(items.map((item) =>
          item.id === itemId ? { ...item, totalQuantity: qty } : item
        ))
        toast.success("Quantity updated")
      }
      setEditingQty(null)
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteRentalItemAction(deleteId)
      if (result.success) {
        setItems(items.filter((item) => item.id !== deleteId))
        toast.success("Rental item deleted")
      }
      setDeleteId(null)
    })
  }

  // Inventory calendar for a specific item
  const calendarRecords = calendarItemId
    ? inventoryRecords.filter((r) => r.rentalItemId === calendarItemId)
    : []
  const calendarItem = calendarItemId
    ? items.find((i) => i.id === calendarItemId)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rental Inventory</h2>
        <Button onClick={() => setFormOpen(true)} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No rental items yet. Add items to start receiving rental bookings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={item.pricePerUnit} />
                      <span className="text-xs text-muted-foreground ml-1">
                        /{item.pricingPeriod === "PER_DAY" ? "day" : "event"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingQty?.id === item.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            className="w-20 h-8"
                            value={editingQty.value}
                            onChange={(e) =>
                              setEditingQty({ id: item.id, value: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateQuantity(item.id)
                              if (e.key === "Escape") setEditingQty(null)
                            }}
                            onBlur={() => handleUpdateQuantity(item.id)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          className="text-left hover:underline"
                          onClick={() =>
                            setEditingQty({ id: item.id, value: item.totalQuantity.toString() })
                          }
                        >
                          {item.totalQuantity}
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.totalQuantity - item.reservedQty}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCalendarItemId(item.id)}
                          title="View inventory calendar"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Item Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Rental Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. White Chiavari Chair"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select
                value={formState.categoryId}
                onValueChange={(v) => setFormState({ ...formState, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            <div className="space-y-2">
              <Label htmlFor="item-desc">Description</Label>
              <Textarea
                id="item-desc"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Describe the item..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-price">Price per Unit (GH₵)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formState.pricePerUnit}
                  onChange={(e) => setFormState({ ...formState, pricePerUnit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-period">Pricing Period</Label>
                <Select
                  value={formState.pricingPeriod}
                  onValueChange={(v) => setFormState({ ...formState, pricingPeriod: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PER_DAY">Per Day</SelectItem>
                    <SelectItem value="PER_EVENT">Per Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-qty">Total Quantity</Label>
                <Input
                  id="item-qty"
                  type="number"
                  min="1"
                  value={formState.totalQuantity}
                  onChange={(e) => setFormState({ ...formState, totalQuantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-min">Min Order Quantity</Label>
                <Input
                  id="item-min"
                  type="number"
                  min="1"
                  value={formState.minOrderQuantity}
                  onChange={(e) => setFormState({ ...formState, minOrderQuantity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-location">Service Location</Label>
              <Input
                id="item-location"
                value={formState.serviceLocation}
                onChange={(e) => setFormState({ ...formState, serviceLocation: e.target.value })}
                placeholder="e.g. Greater Accra"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formState.deliveryAvailable}
                  onCheckedChange={(v) => setFormState({ ...formState, deliveryAvailable: v })}
                />
                <Label>Delivery Available</Label>
              </div>
              {formState.deliveryAvailable && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Delivery charge (GH₵)"
                  className="w-40"
                  value={formState.deliveryCharge}
                  onChange={(e) => setFormState({ ...formState, deliveryCharge: e.target.value })}
                />
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formState.setupAvailable}
                  onCheckedChange={(v) => setFormState({ ...formState, setupAvailable: v })}
                />
                <Label>Setup Available</Label>
              </div>
              {formState.setupAvailable && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Setup charge (GH₵)"
                  className="w-40"
                  value={formState.setupCharge}
                  onChange={(e) => setFormState({ ...formState, setupCharge: e.target.value })}
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateItem} disabled={isPending}>
                Create Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inventory Calendar Popup */}
      <Dialog open={!!calendarItemId} onOpenChange={(open) => !open && setCalendarItemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Inventory Calendar — {calendarItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {calendarRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reservations for this item yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendarRecords
                    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
                    .map((record) => (
                      <TableRow key={`${record.rentalItemId}-${record.eventDate}`}>
                        <TableCell>
                          {new Date(record.eventDate).toLocaleDateString("en-GH", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{record.reservedQty}</TableCell>
                        <TableCell>
                          {(calendarItem?.totalQuantity ?? 0) - record.reservedQty}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Rental Item"
        description="Are you sure you want to delete this rental item? All reservation data will be lost. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
