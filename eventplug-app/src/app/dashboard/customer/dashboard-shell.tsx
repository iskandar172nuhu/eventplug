"use client"

import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Heart,
  CreditCard,
  Star,
  User,
  FileText,
  Settings,
} from "lucide-react"

import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout"

const customerNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard/customer",
    icon: <LayoutDashboard />,
  },
  {
    label: "My Bookings",
    href: "/dashboard/customer/bookings",
    icon: <CalendarCheck />,
  },
  {
    label: "Quote Requests",
    href: "/dashboard/customer/quotes",
    icon: <FileText />,
  },
  {
    label: "Messages",
    href: "/dashboard/customer/messages",
    icon: <MessageSquare />,
  },
  {
    label: "Favourites",
    href: "/dashboard/customer/favourites",
    icon: <Heart />,
  },
  {
    label: "Payments",
    href: "/dashboard/customer/payments",
    icon: <CreditCard />,
  },
  {
    label: "Reviews",
    href: "/dashboard/customer/reviews",
    icon: <Star />,
  },
  {
    label: "Profile",
    href: "/dashboard/customer/profile",
    icon: <User />,
  },
  {
    label: "Settings",
    href: "/dashboard/customer/settings",
    icon: <Settings />,
  },
]

interface CustomerDashboardShellProps {
  children: React.ReactNode
  userName: string
}

export function CustomerDashboardShell({ children, userName }: CustomerDashboardShellProps) {
  return (
    <DashboardLayout
      navItems={customerNavItems}
      title={`Welcome, ${userName}`}
      subtitle="Manage your bookings, quotes, and more"
    >
      {children}
    </DashboardLayout>
  )
}
