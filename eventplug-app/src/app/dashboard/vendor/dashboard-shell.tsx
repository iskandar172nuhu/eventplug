"use client"

import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  CalendarDays,
  Briefcase,
  Package,
  MessageSquare,
  CreditCard,
  Star,
  BarChart3,
  Building2,
  Settings,
} from "lucide-react"

import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout"

const vendorNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard/vendor",
    icon: <LayoutDashboard />,
  },
  {
    label: "Bookings",
    href: "/dashboard/vendor/bookings",
    icon: <CalendarCheck />,
  },
  {
    label: "Quote Requests",
    href: "/dashboard/vendor/quotes",
    icon: <FileText />,
  },
  {
    label: "Calendar",
    href: "/dashboard/vendor/calendar",
    icon: <CalendarDays />,
  },
  {
    label: "Services",
    href: "/dashboard/vendor/services",
    icon: <Briefcase />,
  },
  {
    label: "Rental Inventory",
    href: "/dashboard/vendor/inventory",
    icon: <Package />,
  },
  {
    label: "Messages",
    href: "/dashboard/vendor/messages",
    icon: <MessageSquare />,
  },
  {
    label: "Payments",
    href: "/dashboard/vendor/payments",
    icon: <CreditCard />,
  },
  {
    label: "Reviews",
    href: "/dashboard/vendor/reviews",
    icon: <Star />,
  },
  {
    label: "Analytics",
    href: "/dashboard/vendor/analytics",
    icon: <BarChart3 />,
  },
  {
    label: "Business Profile",
    href: "/dashboard/vendor/profile",
    icon: <Building2 />,
  },
  {
    label: "Settings",
    href: "/dashboard/vendor/settings",
    icon: <Settings />,
  },
]

interface VendorDashboardShellProps {
  children: React.ReactNode
  businessName: string
}

export function VendorDashboardShell({ children, businessName }: VendorDashboardShellProps) {
  return (
    <DashboardLayout
      navItems={vendorNavItems}
      title={businessName}
      subtitle="Manage your services, bookings, and business"
    >
      {children}
    </DashboardLayout>
  )
}
