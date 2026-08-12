import { db } from "@/lib/db"

export async function getUnreadCount(userId: string): Promise<number> {
  return db.message.count({
    where: {
      readStatus: "UNREAD",
      senderId: { not: userId },
      conversation: {
        participants: {
          some: {
            OR: [
              { customerProfile: { userId } },
              { vendorProfile: { userId } },
            ],
          },
        },
      },
    },
  })
}
