import { ToastProvider } from "@/components/shared"
import { AdminDashboardShell } from "./dashboard-shell"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ToastProvider />
      <AdminDashboardShell>
        {children}
      </AdminDashboardShell>
    </>
  )
}
