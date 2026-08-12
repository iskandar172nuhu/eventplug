import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const config = {
  matcher: ["/dashboard/:path*"],
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  // Enforce role-based access
  if (pathname.startsWith("/dashboard/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  if (pathname.startsWith("/dashboard/vendor") && role !== "VENDOR") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Handle /dashboard base path — redirect to role-specific dashboard
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    switch (role) {
      case "CUSTOMER":
        return NextResponse.redirect(new URL("/dashboard/customer", req.url))
      case "VENDOR":
        return NextResponse.redirect(new URL("/dashboard/vendor", req.url))
      case "ADMIN":
        return NextResponse.redirect(new URL("/dashboard/admin", req.url))
      default:
        return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}
