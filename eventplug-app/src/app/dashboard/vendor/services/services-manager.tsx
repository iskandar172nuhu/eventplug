"use client"

import { useState, useTransition } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
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
import { ConfirmDialog } from "@/components/shared"
import { CurrencyDisplay } from "@/components/shared"
import {
  createServicePackageAction,
  updateServicePackageAction,
  deleteServicePackageAction,
  toggleServicePackageActiveAction,
} from "@/actions/vendor"

interface ServicePackage {
  id: string
  name: string
  description: string
  categoryId: string
  categoryName: string
  includedServices: string[]
  startingPrice: string
  isActive: boolean
  addOns: Array<{ name: string; price: number }> | null
}

interface Category {
  id: string
  name: string
}

interface ServicesManagerProps {
  initialPackages: ServicePackage[]
  categories: Category[]
}

export function ServicesManager({ initialPackages, categories }: ServicesManagerProps) {
  const [packages, setPackages] = useState(initialPackages)
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [includedServices, setIncludedServices] = useState("")
  const [startingPrice, setStartingPrice] = useState("")
  const [addOns, setAddOns] = useState("")

  const resetForm = () => {
    setName("")
    setDescription("")
    setCategoryId("")
    setIncludedServices("")
    setStartingPrice("")
    setAddOns("")
    setEditingPackage(null)
  }

  const openCreateForm = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEditForm = (pkg: ServicePackage) => {
    setEditingPackage(pkg)
    setName(pkg.name)
    setDescription(pkg.description)
    setCategoryId(pkg.categoryId)
    setIncludedServices(pkg.includedServices.join(", "))
    setStartingPrice(pkg.startingPrice)
    setAddOns(pkg.addOns ? JSON.stringify(pkg.addOns) : "")
    setFormOpen(true)
  }

  const handleSubmit = () => {
    const formData = new FormData()
    formData.set("name", name)
    formData.set("description", description)
    formData.set("categoryId", categoryId)
    formData.set("includedServices", includedServices)
    formData.set("startingPrice", startingPrice)
    if (addOns) formData.set("addOns", addOns)

    startTransition(async () => {
      if (editingPackage) {
        formData.set("isActive", editingPackage.isActive.toString())
        const result = await updateServicePackageAction(editingPackage.id, formData)
        if (result.success) {
          const catName = categories.find((c) => c.id === categoryId)?.name || ""
          setPackages(
            packages.map((p) =>
              p.id === editingPackage.id
                ? {
                    ...p,
                    name,
                    description,
                    categoryId,
                    categoryName: catName,
                    includedServices: includedServices.split(",").map((s) => s.trim()).filter(Boolean),
                    startingPrice,
                    addOns: addOns ? JSON.parse(addOns) : null,
                  }
                : p
            )
          )
          toast.success("Service package updated")
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createServicePackageAction(formData)
        if (result.success) {
          toast.success("Service package created")
          // Reload will be triggered by revalidatePath
          window.location.reload()
        } else {
          toast.error(result.error)
        }
      }
      setFormOpen(false)
      resetForm()
    })
  }

  const handleToggleActive = (pkg: ServicePackage) => {
    startTransition(async () => {
      const result = await toggleServicePackageActiveAction(pkg.id, !pkg.isActive)
      if (result.success) {
        setPackages(
          packages.map((p) =>
            p.id === pkg.id ? { ...p, isActive: !p.isActive } : p
          )
        )
        toast.success(pkg.isActive ? "Package deactivated" : "Package activated")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteServicePackageAction(deleteId)
      if (result.success) {
        setPackages(packages.filter((p) => p.id !== deleteId))
        toast.success("Service package deleted")
      }
      setDeleteId(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Service Packages</h2>
        <Button onClick={openCreateForm} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No service packages yet. Create your first package to start receiving bookings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pkg.categoryName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={pkg.isActive ? "default" : "secondary"}>
                      {pkg.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pkg.description}
                </p>
                <div>
                  <p className="text-sm font-medium">Included Services:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {pkg.includedServices.slice(0, 4).map((service, i) => (
                      <li key={i}>{service}</li>
                    ))}
                    {pkg.includedServices.length > 4 && (
                      <li>+{pkg.includedServices.length - 4} more</li>
                    )}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="font-semibold">
                    Starting from <CurrencyDisplay amount={pkg.startingPrice} />
                  </p>
                </div>
                {pkg.addOns && pkg.addOns.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {pkg.addOns.length} add-on{pkg.addOns.length > 1 ? "s" : ""} available
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.isActive}
                      onCheckedChange={() => handleToggleActive(pkg)}
                      disabled={isPending}
                    />
                    <span className="text-xs text-muted-foreground">
                      {pkg.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditForm(pkg)}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(pkg.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Service Package" : "Create Service Package"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pkg-name">Package Name</Label>
              <Input
                id="pkg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Wedding Package"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
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
              <Label htmlFor="pkg-description">Description</Label>
              <Textarea
                id="pkg-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this package includes..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-services">Included Services (comma-separated)</Label>
              <Textarea
                id="pkg-services"
                value={includedServices}
                onChange={(e) => setIncludedServices(e.target.value)}
                placeholder="e.g. Venue decoration, Flower arrangements, Table setup"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-price">Starting Price (GH₵)</Label>
              <Input
                id="pkg-price"
                type="number"
                step="0.01"
                min="0"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pkg-addons">
                Add-ons (JSON, optional)
              </Label>
              <Textarea
                id="pkg-addons"
                value={addOns}
                onChange={(e) => setAddOns(e.target.value)}
                placeholder='[{"name": "Extra hour", "price": 200}]'
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Format: [{`{"name": "...", "price": 0}`}]
              </p>
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
              <Button onClick={handleSubmit} disabled={isPending}>
                {editingPackage ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Service Package"
        description="Are you sure you want to delete this service package? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}
