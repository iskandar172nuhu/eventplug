"use client"

import * as React from "react"
import { toast } from "sonner"

import { changePasswordAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    try {
      const result = await changePasswordAction(formData)
      if (result.success) {
        toast.success("Password updated")
        formRef.current?.reset()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Failed to change password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        <p className="text-xs text-muted-foreground">
          Min 8 characters with uppercase, lowercase, and a number
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
        <Input id="confirmNewPassword" name="confirmNewPassword" type="password" required />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Change Password"}
      </Button>
    </form>
  )
}
