"use server"
import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function sendMessageAction(conversationId: string, body: string) {
  const session = await requireAuth()
  
  if (!body.trim()) return { success: false, error: "Message cannot be empty" }
  if (body.length > 2000) return { success: false, error: "Message too long" }

  await db.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      body: body.trim(),
      readStatus: "UNREAD",
    },
  })

  // Update conversation's updatedAt
  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  revalidatePath("/dashboard/customer/messages")
  revalidatePath("/dashboard/vendor/messages")
  return { success: true }
}

export async function markConversationReadAction(conversationId: string) {
  const session = await requireAuth()

  // Mark all messages from other participants as READ
  await db.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      readStatus: "UNREAD",
    },
    data: { readStatus: "READ" },
  })

  revalidatePath("/dashboard/customer/messages")
  revalidatePath("/dashboard/vendor/messages")
  return { success: true }
}
