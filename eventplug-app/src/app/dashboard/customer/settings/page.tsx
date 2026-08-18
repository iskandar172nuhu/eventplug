import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SettingsProfileForm } from "./settings-profile-form"
import { ChangePasswordForm } from "./change-password-form"
import { DeleteAccountSection } from "./delete-account-section"

export default async function CustomerSettingsPage() {
  const session = await requireAuth("CUSTOMER")
  const profile = await db.customerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
    select: { fullName: true, phoneNumber: true },
  })
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { email: true },
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
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsProfileForm
            defaultValues={{ fullName: profile.fullName, phoneNumber: profile.phoneNumber, email: user.email }}
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
