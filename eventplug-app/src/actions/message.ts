"use server"
import { requireAuth } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/modules/notifications/create"
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

  // Notify the other participant(s)
  const participants = await db.conversationParticipant.findMany({
    where: { conversationId },
    include: {
      customerProfile: { select: { userId: true, fullName: true } },
      vendorProfile: { select: { userId: true, businessName: true } },
    },
  })

  const senderRole = session.user.role
  let senderName = "Someone"

  // Determine sender name
  if (senderRole === "CUSTOMER") {
    const senderParticipant = participants.find((p) => p.customerProfile?.userId === session.user.id)
    senderName = senderParticipant?.customerProfile?.fullName ?? "A customer"
  } else if (senderRole === "VENDOR") {
    const senderParticipant = participants.find((p) => p.vendorProfile?.userId === session.user.id)
    senderName = senderParticipant?.vendorProfile?.businessName ?? "A vendor"
  }

  // Notify recipients (everyone except the sender)
  for (const participant of participants) {
    let recipientUserId: string | null = null
    let link: string | null = null

    if (participant.customerProfile && participant.customerProfile.userId !== session.user.id) {
      recipientUserId = participant.customerProfile.userId
      link = `/dashboard/customer/messages/${conversationId}`
    } else if (participant.vendorProfile && participant.vendorProfile.userId !== session.user.id) {
      recipientUserId = participant.vendorProfile.userId
      link = `/dashboard/vendor/messages/${conversationId}`
    }

    if (recipientUserId) {
      await createNotification({
        userId: recipientUserId,
        title: "New Message",
        body: `${senderName} sent you a message`,
        link: link ?? undefined,
      })
    }
  }

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
