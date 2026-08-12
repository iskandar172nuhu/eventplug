import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Heart,
  CreditCard,
  Star,
  User,
  FileText,
} from "lucide-react"

import { getSession } from "@/lib/auth/guards"
import { ToastProvider } from "@/components/shared"
import { CustomerDashboardShell } from "./dashboard-shell"

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const userName = session?.user?.email?.split("@")[0] ?? "Customer"

  return (
    <>
      <ToastProvider />
      <CustomerDashboardShell userName={userName}>
        {children}
      </CustomerDashboardShell>
    </>
  )
}
