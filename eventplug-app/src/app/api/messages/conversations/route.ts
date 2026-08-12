import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find all conversations where the current user is a participant
  const participations = await db.conversationParticipant.findMany({
    where: {
      OR: [
        { customerProfile: { userId: session.user.id } },
        { vendorProfile: { userId: session.user.id } },
      ],
    },
    select: { conversationId: true },
  })

  const conversationIds = participations.map((p) => p.conversationId)

  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] })
  }

  // Fetch conversations with last message and unread count
  const conversations = await db.conversation.findMany({
    where: { id: { in: conversationIds } },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
        select: {
          id: true,
          body: true,
          sentAt: true,
          senderId: true,
          readStatus: true,
        },
      },
      participants: {
        include: {
          customerProfile: { select: { fullName: true, userId: true, profilePhoto: true } },
          vendorProfile: { select: { businessName: true, userId: true, logoUrl: true } },
        },
      },
      quoteRequest: { select: { id: true, eventType: true } },
      booking: { select: { id: true, status: true } },
    },
  })

  // Build response with unread counts
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await db.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: session.user.id },
          readStatus: "UNREAD",
        },
      })

      // Determine the other party
      let otherPartyName = "Unknown"
      let otherPartyAvatar: string | null = null
      for (const p of conv.participants) {
        if (p.customerProfile && p.customerProfile.userId !== session.user.id) {
          otherPartyName = p.customerProfile.fullName
          otherPartyAvatar = p.customerProfile.profilePhoto
          break
        }
        if (p.vendorProfile && p.vendorProfile.userId !== session.user.id) {
          otherPartyName = p.vendorProfile.businessName
          otherPartyAvatar = p.vendorProfile.logoUrl
          break
        }
      }

      const lastMessage = conv.messages[0] || null

      return {
        id: conv.id,
        otherPartyName,
        otherPartyAvatar,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              body: lastMessage.body.length > 100
                ? lastMessage.body.slice(0, 100) + "..."
                : lastMessage.body,
              sentAt: lastMessage.sentAt.toISOString(),
              isOwn: lastMessage.senderId === session.user.id,
            }
          : null,
        unreadCount,
        linkedQuoteRequest: conv.quoteRequest
          ? { id: conv.quoteRequest.id, eventType: conv.quoteRequest.eventType }
          : null,
        linkedBooking: conv.booking
          ? { id: conv.booking.id, status: conv.booking.status }
          : null,
        updatedAt: conv.updatedAt.toISOString(),
      }
    })
  )

  return NextResponse.json({ conversations: conversationsWithUnread })
}
