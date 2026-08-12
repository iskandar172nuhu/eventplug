import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [unreadCount, recent] = await Promise.all([
      db.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
      db.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          body: true,
          link: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({ unreadCount, notifications: recent })
  } catch {
    return NextResponse.json(
      { unreadCount: 0, notifications: [] },
      { status: 500 }
    )
  }
}
