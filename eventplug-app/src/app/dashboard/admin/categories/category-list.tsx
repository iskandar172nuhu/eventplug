"use client"

import { useState } from "react"
import type { VendorType } from "@prisma/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared"
import { manageCategoryAction } from "@/actions/admin"

interface Category {
  id: string
  name: string
  type: VendorType
  displayOrder: number
  isActive: boolean
}

interface AdminCategoryListProps {
  categories: Category[]
}

const typeStyles: Record<VendorType, string> = {
  SERVICE: "bg-blue-100 text-blue-800 border-blue-200",
  RENTAL: "bg-purple-100 text-purple-800 border-purple-200",
  BOTH: "bg-green-100 text-green-800 border-green-200",
}

export function AdminCategoryList({ categories }: AdminCategoryListProps) {
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<VendorType>("SERVICE")
  const [newDisplayOrder, setNewDisplayOrder] = useState("")
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const formData = new FormData()
    formData.set("action", "create")
    formData.set("name", newName.trim())
    formData.set("type", newType)
    if (newDisplayOrder) {
      formData.set("displayOrder", newDisplayOrder)
    }
    await manageCategoryAction(formData)
    setNewName("")
    setNewDisplayOrder("")
    setCreating(false)
  }

  async function handleSaveEdit(categoryId: string) {
    if (!editName.trim()) return
    setSaving(true)
    const formData = new FormData()
    formData.set("action", "update")
    formData.set("categoryId", categoryId)
    formData.set("name", editName.trim())
    await manageCategoryAction(formData)
    setEditingId(null)
    setEditName("")
    setSaving(false)
  }

  async function handleDeactivate() {
    if (!deactivateId) return
    const formData = new FormData()
    formData.set("action", "deactivate")
    formData.set("categoryId", deactivateId)
    await manageCategoryAction(formData)
    setDeactivateId(null)
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditName(category.name)
  }

  return (
    <>
      {/* Add Category Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">
                Name
              </label>
              <Input
                placeholder="Category name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-sm text-muted-foreground mb-1 block">
                Type
              </label>
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as VendorType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="RENTAL">Rental</SelectItem>
                  <SelectItem value="BOTH">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32">
              <label className="text-sm text-muted-foreground mb-1 block">
                Display Order
              </label>
              <Input
                type="number"
                placeholder="0"
                value={newDisplayOrder}
                onChange={(e) => setNewDisplayOrder(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? "Adding..." : "Add"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className={!category.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {editingId === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="max-w-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(category.id)
                          if (e.key === "Escape") setEditingId(null)
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(category.id)}
                        disabled={saving}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{category.name}</span>
                      <Badge
                        variant="outline"
                        className={typeStyles[category.type]}
                      >
                        {category.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Order: {category.displayOrder}
                      </span>
                      {!category.isActive && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                {editingId !== category.id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(category)}
                    >
                      Edit
                    </Button>
                    {category.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setDeactivateId(category.id)
                          setConfirmOpen(true)
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Deactivate Category"
        description="Are you sure you want to deactivate this category? It will no longer appear in vendor registration or search filters."
        confirmText="Deactivate"
        variant="destructive"
        onConfirm={handleDeactivate}
      />
    </>
  )
}
