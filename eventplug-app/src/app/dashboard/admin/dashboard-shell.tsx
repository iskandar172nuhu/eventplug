"use client"

import {
  LayoutDashboard,
  Store,
  FolderTree,
  CalendarCheck,
  Star,
  AlertTriangle,
  Award,
  FileBarChart,
} from "lucide-react"

import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout"

const adminNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: <LayoutDashboard />,
  },
  {
    label: "Vendors",
    href: "/dashboard/admin/vendors",
    icon: <Store />,
  },
  {
    label: "Categories",
    href: "/dashboard/admin/categories",
    icon: <FolderTree />,
  },
  {
    label: "Bookings",
    href: "/dashboard/admin/bookings",
    icon: <CalendarCheck />,
  },
  {
    label: "Reviews",
    href: "/dashboard/admin/reviews",
    icon: <Star />,
  },
  {
    label: "Disputes",
    href: "/dashboard/admin/disputes",
    icon: <AlertTriangle />,
  },
  {
    label: "Featured Vendors",
    href: "/dashboard/admin/featured",
    icon: <Award />,
  },
  {
    label: "Reports",
    href: "/dashboard/admin/reports",
    icon: <FileBarChart />,
  },
]

interface AdminDashboardShellProps {
  children: React.ReactNode
}

export function AdminDashboardShell({ children }: AdminDashboardShellProps) {
  return (
    <DashboardLayout
      navItems={adminNavItems}
      title="Admin Dashboard"
      subtitle="Manage vendors, categories, and platform operations"
    >
      {children}
    </DashboardLayout>
  )
}
