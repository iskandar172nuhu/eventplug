import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { VendorSettingsProfileForm } from "./settings-profile-form"
import { ChangePasswordForm } from "../../customer/settings/change-password-form"
import { DeleteAccountSection } from "../../customer/settings/delete-account-section"

export default async function VendorSettingsPage() {
  const session = await requireAuth("VENDOR")
  const profile = await db.vendorProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
    select: { businessName: true, ownerFullName: true, phoneNumber: true, email: true },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your login and personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <VendorSettingsProfileForm
            defaultValues={{
              ownerFullName: profile.ownerFullName,
              phoneNumber: profile.phoneNumber,
              email: profile.email,
            }}
          />
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Separator />
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountSection />
        </CardContent>
      </Card>
    </div>
  )
}
