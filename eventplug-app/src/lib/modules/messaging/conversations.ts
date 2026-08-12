import { db } from "@/lib/db"

export async function getOrCreateConversation(customerProfileId: string, vendorProfileId: string) {
  // Check for existing conversation between this customer and vendor
  const existing = await db.conversationParticipant.findFirst({
    where: {
      customerProfileId,
      conversation: {
        participants: {
          some: { vendorProfileId },
        },
      },
    },
    include: { conversation: true },
  })

  if (existing) return existing.conversation

  // Create new conversation with both participants
  const conversation = await db.conversation.create({
    data: {
      participants: {
        createMany: {
          data: [
            { customerProfileId },
            { vendorProfileId },
          ],
        },
      },
    },
  })

  return conversation
}

export async function createQuoteConversation(
  quoteRequestId: string,
  customerProfileId: string,
  vendorProfileId: string
) {
  const conversation = await db.conversation.create({
    data: {
      participants: {
        createMany: {
          data: [
            { customerProfileId },
            { vendorProfileId },
          ],
        },
      },
    },
  })

  // Link conversation to quote request
  await db.quoteRequest.update({
    where: { id: quoteRequestId },
    data: { conversationId: conversation.id },
  })

  return conversation
}

export async function createDirectConversation(
  customerProfileId: string,
  vendorProfileId: string
) {
  return getOrCreateConversation(customerProfileId, vendorProfileId)
}
