'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect } from 'react'

interface UIMessageChunk {
  type: string
  delta?: string
  text?: string
}

export default function ChatContent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Start a conversation with your coach</p>
              <p className="text-sm">Ask about training, form, nutrition, or anything running-related</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">
                    {message.parts && Array.isArray(message.parts)
                      ? message.parts
                          .filter((p: any) => p.type === 'text')
                          .map((p: any) => p.text)
                          .join('')
                      : message.content || ''}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-4 bg-background"
      >
        <div className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your coach something..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
