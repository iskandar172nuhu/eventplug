import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { createDirectConversation } from "@/lib/modules/messaging/conversations"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { vendorId, message } = body

  if (!vendorId || !message?.trim()) {
    return NextResponse.json({ success: false, error: "Vendor ID and message are required" }, { status: 400 })
  }

  try {
    const customerProfile = await db.customerProfile.findUniqueOrThrow({
      where: { userId: session.user.id },
    })

    const vendorProfile = await db.vendorProfile.findUniqueOrThrow({
      where: { id: vendorId },
    })

    // Get or create conversation
    const conversation = await createDirectConversation(customerProfile.id, vendorProfile.id)

    // Send the first message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        body: message.trim(),
        readStatus: "UNREAD",
      },
    })

    await db.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, conversationId: conversation.id })
  } catch (error) {
    console.error("[API] Start conversation error:", error)
    return NextResponse.json({ success: false, error: "Failed to start conversation" }, { status: 500 })
  }
}
