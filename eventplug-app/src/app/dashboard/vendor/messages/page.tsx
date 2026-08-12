import { redirect } from "next/navigation"
import Link from "next/link"

import { getSession } from "@/lib/auth/guards"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared"

export default async function VendorMessagesPage() {
  const session = await getSession()
  if (!session || session.user.role !== "VENDOR") {
    redirect("/login")
  }

  const vendorProfile = await db.vendorProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!vendorProfile) {
    redirect("/login")
  }

  // Find all conversations the vendor is a participant in
  const participations = await db.conversationParticipant.findMany({
    where: { vendorProfileId: vendorProfile.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              customerProfile: { select: { fullName: true } },
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
        (cp) => cp.customerProfileId !== null
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
        otherPartyName: otherParticipant?.customerProfile?.fullName || "Unknown",
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
        description="Conversations will appear here when customers contact you."
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
            href={`/dashboard/vendor/messages/${conv.id}`}
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
