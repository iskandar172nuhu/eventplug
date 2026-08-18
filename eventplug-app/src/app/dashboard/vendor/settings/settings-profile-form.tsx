"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface VendorSettingsProfileFormProps {
  defaultValues: {
    ownerFullName: string
    phoneNumber: string
    email: string
  }
}

export function VendorSettingsProfileForm({ defaultValues }: VendorSettingsProfileFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={defaultValues.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ownerFullName">Owner Name</Label>
        <Input id="ownerFullName" value={defaultValues.ownerFullName} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Edit your business details on the Business Profile page</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input id="phoneNumber" value={defaultValues.phoneNumber} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Edit on the Business Profile page</p>
      </div>
    </div>
  )
}
