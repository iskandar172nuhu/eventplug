"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { deleteAccountAction } from "@/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function DeleteAccountSection() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [confirmation, setConfirmation] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  const canDelete = confirmation === "DELETE"

  async function handleDelete() {
    if (!canDelete) return
    setIsDeleting(true)

    try {
      const result = await deleteAccountAction()
      if (result.success) {
        toast.success("Account deactivated")
        router.push("/")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-sm">Delete Account</p>
          <p className="text-sm text-muted-foreground">
            Permanently deactivate your account. Your bookings, payments, and reviews
            will be preserved for record-keeping but your personal information will be
            anonymised. This action cannot be undone.
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirmation("") }}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete My Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently deactivate your account. Your personal data will be
              anonymised but existing bookings, payments, and reviews will remain in our
              records for business integrity. You will be logged out immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
