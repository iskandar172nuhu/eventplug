"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { updateVendorProfileAction } from "@/actions/vendor"

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Western North",
  "Oti",
]

interface VendorProfileData {
  businessName: string
  description: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  serviceLocations: string[]
  isPhoneVerified: boolean
  isGhanaCardVerified: boolean
  isBusinessVerified: boolean
  isAddressVerified: boolean
}

interface ProfileFormProps {
  profile: VendorProfileData
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [businessName, setBusinessName] = useState(profile.businessName)
  const [description, setDescription] = useState(profile.description || "")
  const [serviceLocations, setServiceLocations] = useState<string[]>(profile.serviceLocations)
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "")
  const [coverImageUrl, setCoverImageUrl] = useState(profile.coverImageUrl || "")

  const charCount = description.length
  const maxChars = 1000

  const toggleLocation = (location: string) => {
    if (serviceLocations.includes(location)) {
      setServiceLocations(serviceLocations.filter((l) => l !== location))
    } else {
      setServiceLocations([...serviceLocations, location])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.set("businessName", businessName)
    formData.set("description", description)
    if (logoUrl) formData.set("logoUrl", logoUrl)
    if (coverImageUrl) formData.set("coverImageUrl", coverImageUrl)
    serviceLocations.forEach((loc) => formData.append("serviceLocations", loc))

    startTransition(async () => {
      const result = await updateVendorProfileAction(formData)
      if (result.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
              <span className="ml-2 text-xs text-muted-foreground">
                {charCount}/{maxChars}
              </span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) {
                  setDescription(e.target.value)
                }
              }}
              placeholder="Tell customers about your business, experience, and what makes you unique..."
              rows={5}
              maxLength={maxChars}
            />
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(charCount / maxChars) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Select the Ghanaian regions where you provide services.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GHANA_REGIONS.map((region) => (
              <label
                key={region}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={serviceLocations.includes(region)}
                  onCheckedChange={() => toggleLocation(region)}
                />
                <span className="text-sm">{region}</span>
              </label>
            ))}
          </div>
          {serviceLocations.length === 0 && (
            <p className="text-sm text-destructive mt-2">
              At least one service location is required.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Logo</Label>
              {profile.logoUrl ? (
                <div className="relative">
                  <img
                    src={profile.logoUrl}
                    alt="Business logo"
                    className="h-24 w-24 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setLogoUrl("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground text-xs">
                    No logo
                  </div>
                  <Input
                    type="url"
                    placeholder="Logo URL"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              {profile.coverImageUrl ? (
                <div className="relative">
                  <img
                    src={profile.coverImageUrl}
                    alt="Cover image"
                    className="h-24 w-full rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setCoverImageUrl("")}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="h-24 w-full rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground text-xs">
                    No cover image
                  </div>
                  <Input
                    type="url"
                    placeholder="Cover image URL"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Verification badges increase customer trust. Contact support to verify your business.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <VerificationBadge
              label="Phone Number"
              verified={profile.isPhoneVerified}
            />
            <VerificationBadge
              label="Ghana Card"
              verified={profile.isGhanaCardVerified}
            />
            <VerificationBadge
              label="Business Registration"
              verified={profile.isBusinessVerified}
            />
            <VerificationBadge
              label="Address"
              verified={profile.isAddressVerified}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || serviceLocations.length === 0}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  )
}

function VerificationBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-3">
      {verified ? (
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <Badge variant={verified ? "default" : "secondary"} className="text-xs">
          {verified ? "Verified" : "Not Verified"}
        </Badge>
      </div>
    </div>
  )
}
