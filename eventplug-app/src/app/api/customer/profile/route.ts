import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await db.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        fullName: true,
        phoneNumber: true,
        profilePhoto: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
