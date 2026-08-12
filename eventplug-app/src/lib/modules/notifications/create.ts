import { db } from "@/lib/db"

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  link?: string
) {
  await db.notification.create({
    data: {
      userId,
      title,
      body,
      link,
      isRead: false,
    },
  })
}
