import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: conversationId } = await params

  // Verify user is a participant in this conversation
  const participation = await db.conversationParticipant.findFirst({
    where: {
      conversationId,
      OR: [
        {
          customerProfile: { userId: session.user.id },
        },
        {
          vendorProfile: { userId: session.user.id },
        },
      ],
    },
  })

  if (!participation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Support ?after= query param for polling (returns only messages after a given message ID)
  const afterParam = request.nextUrl.searchParams.get("after")
  let afterCursor: { sentAt: Date } | null = null

  if (afterParam) {
    const cursorMessage = await db.message.findUnique({
      where: { id: afterParam },
      select: { sentAt: true },
    })
    if (cursorMessage) {
      afterCursor = cursorMessage
    }
  }

  // Get messages in conversation (optionally after a cursor)
  const messages = await db.message.findMany({
    where: {
      conversationId,
      ...(afterCursor && {
        sentAt: { gt: afterCursor.sentAt },
      }),
    },
    orderBy: { sentAt: "asc" },
    select: {
      id: true,
      senderId: true,
      body: true,
      sentAt: true,
      readStatus: true,
    },
  })

  // Get the other party name
  const participants = await db.conversationParticipant.findMany({
    where: { conversationId },
    include: {
      customerProfile: { select: { fullName: true, userId: true } },
      vendorProfile: { select: { businessName: true, userId: true } },
    },
  })

  let otherPartyName = "Unknown"
  for (const p of participants) {
    if (p.customerProfile && p.customerProfile.userId !== session.user.id) {
      otherPartyName = p.customerProfile.fullName
      break
    }
    if (p.vendorProfile && p.vendorProfile.userId !== session.user.id) {
      otherPartyName = p.vendorProfile.businessName
      break
    }
  }

  return NextResponse.json({
    id: conversationId,
    currentUserId: session.user.id,
    otherPartyName,
    messages: messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      body: msg.body,
      sentAt: msg.sentAt.toISOString(),
      readStatus: msg.readStatus,
    })),
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: conversationId } = await params

  // Verify user is a participant in this conversation
  const participation = await db.conversationParticipant.findFirst({
    where: {
      conversationId,
      OR: [
        {
          customerProfile: { userId: session.user.id },
        },
        {
          vendorProfile: { userId: session.user.id },
        },
      ],
    },
  })

  if (!participation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // Parse body
  const body = await request.json()
  const messageBody = body?.body?.trim()

  if (!messageBody) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 })
  }

  if (messageBody.length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000 characters)" }, { status: 400 })
  }

  // Create message
  const message = await db.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      body: messageBody,
      readStatus: "UNREAD",
    },
  })

  // Update conversation's updatedAt
  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({
    id: message.id,
    senderId: message.senderId,
    body: message.body,
    sentAt: message.sentAt.toISOString(),
    readStatus: message.readStatus,
  }, { status: 201 })
}
