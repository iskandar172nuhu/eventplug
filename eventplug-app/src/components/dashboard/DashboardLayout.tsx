"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/shared/NotificationBell"

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

export interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  title: string
  subtitle?: string
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <span className="flex-shrink-0 [&_svg]:h-4 [&_svg]:w-4">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-[10px] font-semibold text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  )
}

export function DashboardLayout({
  children,
  navItems,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  function isActive(href: string) {
    if (href === pathname) return true
    // Match sub-paths for sections like /dashboard/customer/bookings/123
    const segments = href.split("/").filter(Boolean)
    const pathSegments = pathname.split("/").filter(Boolean)
    if (segments.length >= 3 && pathSegments.length > segments.length) {
      return pathSegments.slice(0, segments.length).join("/") === segments.join("/")
    }
    return false
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Link href="/" className="font-bold text-lg text-brand-primary">
            EventPlug
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
          {/* Mobile Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2 border-b px-4">
                <Link href="/" className="font-bold text-lg text-brand-primary">
                  EventPlug
                </Link>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.href} onClick={() => setOpen(false)}>
                    <NavLink item={item} isActive={isActive(item.href)} />
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Title */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Notifications */}
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
