"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/actions/auth"

interface SiteHeaderClientProps {
  user: { role: string; email: string } | null
}

function getDashboardHref(role: string) {
  switch (role) {
    case "CUSTOMER":
      return "/dashboard/customer"
    case "VENDOR":
      return "/dashboard/vendor"
    case "ADMIN":
      return "/dashboard/admin"
    default:
      return "/dashboard"
  }
}

export function SiteHeaderClient({ user }: SiteHeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-brand-primary">EventPlug</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/vendors"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Vendors
          </Link>
          <Link
            href="/rentals"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Rentals
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.email.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={getDashboardHref(user.role)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => logoutAction()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">Register</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/register/customer">Register as Customer</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register/vendor">Register as Vendor</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          <Link
            href="/vendors"
            className="block text-sm font-medium py-2"
            onClick={() => setMobileOpen(false)}
          >
            Browse Vendors
          </Link>
          <Link
            href="/rentals"
            className="block text-sm font-medium py-2"
            onClick={() => setMobileOpen(false)}
          >
            Rentals
          </Link>
          {user ? (
            <>
              <Link
                href={getDashboardHref(user.role)}
                className="block text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <button
                className="block text-sm font-medium py-2 text-destructive"
                onClick={() => logoutAction()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register/customer"
                className="block text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Register as Customer
              </Link>
              <Link
                href="/register/vendor"
                className="block text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Register as Vendor
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
