import { redirect } from "next/navigation"
import Link from "next/link"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared"

export default async function CustomerMessagesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/login")
  }

  const customerProfile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!customerProfile) {
    redirect("/login")
  }

  // Find all conversations the customer is a participant in
  const participations = await db.conversationParticipant.findMany({
    where: { customerProfileId: customerProfile.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              vendorProfile: { select: { businessName: true } },
            },
          },
          messages: {
            orderBy: { sentAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  // Build conversation list with unread counts
  const conversations = await Promise.all(
    participations.map(async (p) => {
      const conversation = p.conversation
      const otherParticipant = conversation.participants.find(
        (cp) => cp.vendorProfileId !== null
      )
      const lastMessage = conversation.messages[0] || null

      const unreadCount = await db.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: session.user.id },
          readStatus: "UNREAD",
        },
      })

      return {
        id: conversation.id,
        otherPartyName: otherParticipant?.vendorProfile?.businessName || "Unknown",
        lastMessage: lastMessage?.body || null,
        lastMessageAt: lastMessage?.sentAt?.toISOString() || conversation.updatedAt.toISOString(),
        unreadCount,
      }
    })
  )

  // Sort by most recent activity
  conversations.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No messages"
        description="Start a conversation by messaging a vendor from their profile page."
      />
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Messages</h2>
      <div className="space-y-2">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/dashboard/customer/messages/${conv.id}`}
            className="block"
          >
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {conv.otherPartyName}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-brand-primary text-white text-xs h-5 min-w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground ml-3 flex-shrink-0">
                    {new Date(conv.lastMessageAt).toLocaleDateString("en-GH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
