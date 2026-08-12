"use server"

import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"

export async function markNotificationReadAction(notificationId: string) {
  await requireAuth()
  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
  return { success: true }
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth()
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  })
  return { success: true }
}
