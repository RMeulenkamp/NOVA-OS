'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getChatMessages,
  saveChatMessage,
  clearChatHistory,
  generateId,
  getChatMessagesRemaining,
  incrementChatMessages,
} from '@/lib/storage'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'
import { Send, Trash2, MessageSquare, Lock, Zap } from 'lucide-react'

const STARTER_PROMPTS = [
  "I can't get anything done today.",
  "I feel like I'm lazy and falling behind.",
  "I want to eat sugar / I'm craving something.",
  "I'm overwhelmed and don't know where to start.",
  "I'm procrastinating and can't stop.",
  "I feel like I'm failing.",
  "I'm tired but can't rest.",
  "I slept badly and now I feel behind.",
]

export default function CoachPage() {
  const { user, updateUser } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const remaining = user ? getChatMessagesRemaining(user) : 0
  const isLimitReached = !user?.isPro && remaining <= 0

  useEffect(() => {
    if (user) {
      const history = getChatMessages().filter((m) => m.userId === user.id)
      setMessages(history)
    }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function sendMessage(text?: string) {
    const content = (text || input).trim()
    if (!content || !user || isStreaming) return
    if (isLimitReached) return

    const userMessage: ChatMessage = {
      id: generateId(),
      userId: user.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    saveChatMessage(userMessage)
    setInput('')
    setIsStreaming(true)
    setStreamingText('')

    // Increment the weekly counter immediately
    const monday = new Date()
    const day = monday.getDay()
    const diff = day === 0 ? -6 : 1 - day
    monday.setDate(monday.getDate() + diff)
    const mondayStr = monday.toISOString().split('T')[0]
    const usedThisWeek = (!user.chatMessageLastReset || user.chatMessageLastReset < mondayStr)
      ? 0
      : (user.chatMessagesUsed ?? 0)
    updateUser({ chatMessagesUsed: usedThisWeek + 1, chatMessageLastReset: mondayStr })

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, user }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          fullText += chunk
          setStreamingText(fullText)
        }
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        userId: user.id,
        role: 'assistant',
        content: fullText,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      saveChatMessage(assistantMessage)
      setStreamingText('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleClearHistory() {
    clearChatHistory()
    setMessages([])
  }

  const hasMessages = messages.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        title="Pattern Interrupt"
        subtitle="Talk through what's happening"
        showBack
        rightAction={
          <div className="flex items-center gap-2">
            {/* Message counter */}
            {!user?.isPro && (
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border',
                remaining <= 2
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : remaining <= 5
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-nova-surface border-nova-border text-nova-muted'
              )}>
                <MessageSquare className="w-3 h-3" />
                {remaining} left
              </div>
            )}
            {hasMessages && (
              <button
                onClick={handleClearHistory}
                className="w-8 h-8 rounded-lg bg-nova-surface border border-nova-border flex items-center justify-center text-nova-dim hover:text-nova-danger transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto pb-48 max-w-lg mx-auto w-full px-4">
        {/* Empty state */}
        {!hasMessages && !isStreaming && (
          <div className="py-8 space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-nova-accent/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-nova-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-nova-text-bright">
                  Pattern Interrupt Coach
                </h3>
                <p className="text-sm text-nova-muted mt-1 max-w-xs mx-auto leading-relaxed">
                  Type what's happening — or use a starter below. NOVA will identify the pattern and give you grounded support.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-nova-dim uppercase tracking-wider">Common starting points</p>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left px-4 py-3 rounded-xl bg-nova-surface border border-nova-border text-sm text-nova-muted hover:text-nova-text hover:border-nova-accent/30 transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {hasMessages && (
          <div className="py-6 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Streaming */}
            {isStreaming && streamingText && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-nova-card border border-nova-border">
                  <p className="text-sm text-nova-text leading-relaxed whitespace-pre-wrap">
                    {streamingText}
                    <span className="inline-block w-0.5 h-4 bg-nova-accent ml-0.5 animate-pulse" />
                  </p>
                </div>
              </div>
            )}

            {/* Loading dots */}
            {isStreaming && !streamingText && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-nova-card border border-nova-border">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-nova-muted typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-nova-muted typing-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-nova-muted typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="fixed bottom-16 left-0 right-0 bg-nova-bg/95 backdrop-blur-xl border-t border-nova-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          {isLimitReached ? (
            /* Limit reached — upgrade prompt */
            <div className="flex items-center gap-3 p-3 rounded-xl bg-nova-accent/5 border border-nova-accent/20">
              <div className="w-8 h-8 rounded-lg bg-nova-accent/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-nova-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nova-text-bright">Weekly limit reached</p>
                <p className="text-xs text-nova-muted mt-0.5">Upgrade to NOVA Pro for unlimited coaching messages</p>
              </div>
              <a
                href="https://www.nova-method.com/nova-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nova-accent text-nova-bg text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <Zap className="w-3 h-3" />
                Upgrade
              </a>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's happening right now?"
                  rows={1}
                  className="nova-input resize-none flex-1 min-h-[44px] max-h-32 py-2.5 text-sm"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    input.trim() && !isStreaming
                      ? 'bg-nova-accent text-white hover:bg-nova-accent-soft'
                      : 'bg-nova-surface border border-nova-border text-nova-dim cursor-not-allowed'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-nova-dim text-center mt-2">
                Press Enter to send · Shift+Enter for new line
              </p>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-nova-accent/20 border border-nova-accent/30 text-nova-text rounded-tr-sm'
            : 'bg-nova-card border border-nova-border text-nova-text rounded-tl-sm'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
