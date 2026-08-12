"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessageAction, markConversationReadAction } from "@/actions/message"

interface Message {
  id: string
  senderId: string
  body: string
  sentAt: string
  readStatus: string
}

interface ConversationData {
  id: string
  currentUserId: string
  otherPartyName: string
  messages: Message[]
}

export default function VendorMessageThreadPage() {
  const params = useParams()
  const conversationId = params.id as string
  const [data, setData] = useState<ConversationData | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // Silently retry on next interval
    }
  }

  useEffect(() => {
    fetchMessages()
    markConversationReadAction(conversationId)

    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [data?.messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    setError(null)
    const result = await sendMessageAction(conversationId, newMessage.trim())
    if (result.success) {
      setNewMessage("")
      await fetchMessages()
    } else {
      setError(result.error || "Failed to send message")
    }
    setSending(false)
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold">{data.otherPartyName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {data.messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation.
          </p>
        )}
        {data.messages.map((msg) => {
          const isOwn = msg.senderId === data.currentUserId
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  isOwn
                    ? "bg-brand-primary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {new Date(msg.sentAt).toLocaleTimeString("en-GH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t pt-4">
        {error && (
          <p className="text-sm text-red-600 mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            {sending ? "..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  )
}
