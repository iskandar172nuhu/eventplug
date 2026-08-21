import Link from "next/link"
import { getSession } from "@/lib/auth/guards"
import { SiteHeaderClient } from "./SiteHeaderClient"

export async function SiteHeader() {
  const session = await getSession()

  const user = session
    ? {
        role: session.user.role,
        email: session.user.email,
      }
    : null

  return <SiteHeaderClient user={user} />
}
