"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { updateCustomerProfileAction } from "@/actions/customer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/shared/PhoneInput"

export default function CustomerProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [fullName, setFullName] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [profilePhoto, setProfilePhoto] = React.useState("")
  const [phoneError, setPhoneError] = React.useState("")

  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/customer/profile")
        if (res.ok) {
          const data = await res.json()
          setFullName(data.fullName || "")
          setPhoneNumber(data.phoneNumber || "")
          setProfilePhoto(data.profilePhoto || "")
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  function validatePhone(value: string): boolean {
    const cleaned = value.replace(/\s/g, "")
    // Accept +233XXXXXXXXX or 0XXXXXXXXX
    const phoneRegex = /^(\+233|0)\d{9}$/
    return phoneRegex.test(cleaned)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPhoneError("")

    // Construct full phone number from input
    const fullPhone = phoneNumber.startsWith("+233") || phoneNumber.startsWith("0")
      ? phoneNumber
      : `+233${phoneNumber.replace(/\s/g, "")}`

    if (!validatePhone(fullPhone)) {
      setPhoneError("Invalid Ghana phone number format. Use +233XXXXXXXXX or 0XXXXXXXXX")
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.set("fullName", fullName)
      formData.set("phoneNumber", fullPhone)
      if (profilePhoto) {
        formData.set("profilePhoto", profilePhoto)
      }

      const result = await updateCustomerProfileAction(formData)
      if (result.success) {
        toast.success("Profile updated successfully")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            {profilePhoto && (
              <div className="flex items-center gap-4">
                <img
                  src={profilePhoto}
                  alt="Profile photo"
                  className="h-16 w-16 rounded-full object-cover"
                />
                <p className="text-sm text-muted-foreground">Current profile photo</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="profilePhoto">Profile Photo URL</Label>
              <Input
                id="profilePhoto"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={profilePhoto}
                onChange={(e) => setProfilePhoto(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for your profile photo
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                required
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <PhoneInput
                value={phoneNumber}
                onChange={(val) => {
                  setPhoneNumber(val)
                  setPhoneError("")
                }}
              />
              {phoneError && (
                <p className="text-sm text-destructive">{phoneError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ghana format: +233 XX XXX XXXX
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
