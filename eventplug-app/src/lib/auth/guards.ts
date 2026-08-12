import { auth } from "./config"
import { UnauthorizedError, ForbiddenError } from "@/lib/errors"

export type Role = "CUSTOMER" | "VENDOR" | "ADMIN"

export interface AuthSession {
  user: {
    id: string
    email: string
    role: Role
    vendorProfileId: string | null
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const session = await auth()
  return session as AuthSession | null
}

export async function requireAuth(role?: Role): Promise<AuthSession> {
  const session = await getSession()
  if (!session) throw new UnauthorizedError("Not authenticated")
  if (role && session.user.role !== role) {
    throw new ForbiddenError("Insufficient role")
  }
  return session
}
