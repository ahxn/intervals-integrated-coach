'use client'

import ChatContent from '@/components/pages/chat-content'

export default function ChatPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Coach Chat</h1>
        <p className="text-muted-foreground mt-2">
          Get personalized training advice
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatContent />
      </div>
    </div>
  )
}
