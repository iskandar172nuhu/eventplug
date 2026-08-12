import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"

export const config = {
  matcher: ["/dashboard/:path*"],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = session.user.role

  // Enforce role-based access
  if (
    pathname.startsWith("/dashboard/customer") &&
    role !== "CUSTOMER"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (
    pathname.startsWith("/dashboard/vendor") &&
    role !== "VENDOR"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (
    pathname.startsWith("/dashboard/admin") &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect base dashboard to role-specific dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    switch (role) {
      case "CUSTOMER":
        return NextResponse.redirect(
          new URL("/dashboard/customer", req.url)
        )

      case "VENDOR":
        return NextResponse.redirect(
          new URL("/dashboard/vendor", req.url)
        )

      case "ADMIN":
        return NextResponse.redirect(
          new URL("/dashboard/admin", req.url)
        )

      default:
        return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
})