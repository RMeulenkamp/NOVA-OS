import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildCoachSystemPrompt } from '@/lib/nova-prompts'
import type { NovaUser, DailyCheckIn } from '@/lib/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      user,
      recentCheckIn,
    }: {
      messages: { role: 'user' | 'assistant'; content: string }[]
      user?: NovaUser
      recentCheckIn?: Partial<DailyCheckIn>
    } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a helpful mock response
      const lastMessage = messages[messages.length - 1].content.toLowerCase()
      const mockResponse = getMockCoachResponse(lastMessage)

      return new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder()
            const words = mockResponse.split(' ')
            let i = 0
            const interval = setInterval(() => {
              if (i < words.length) {
                controller.enqueue(encoder.encode(words[i] + ' '))
                i++
              } else {
                clearInterval(interval)
                controller.close()
              }
            }, 40)
          },
        }),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
          },
        }
      )
    }

    const stream = await client.messages.create({
      model: 'claude-opus-4-6', // Opus — coach conversations need full nuance
      max_tokens: 512,
      system: buildCoachSystemPrompt(user, recentCheckIn),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Coach API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate response' }), { status: 500 })
  }
}

// ─── Mock responses ───────────────────────────────────────────────────────────

function getMockCoachResponse(message: string): string {
  if (message.includes('lazy') || message.includes('nothing done')) {
    return `Let's slow that down. This may not be laziness — it may be a low-capacity or freeze response. When your system feels overloaded, it reduces access to motivation, clarity, and action. Calling it laziness adds pressure, which often makes the shutdown stronger. Do this first: stand up, look around the room, and name 5 things you see. Let your body know you're here, now, and safe. Then choose one tiny action — open the document, don't work on it yet, just open it. Today we're rebuilding movement, not forcing performance.`
  }
  if (message.includes('focus') || message.includes('distract')) {
    return `What you're describing sounds like a scattered or avoidant focus state — very different from laziness. This often happens when the nervous system is mildly activated, making sustained attention difficult. It's not a willpower problem. Try this: close all other tabs, set a 5-minute timer, and pick just one sentence to write or one thing to read. The goal isn't output — it's building a signal of safety around the task. Most resistance dissolves once you're actually inside the work.`
  }
  if (message.includes('overwhelm') || message.includes('too much')) {
    return `Overwhelm is your system telling you it's receiving more inputs than it can process. It's a real physiological state, not a character flaw. Right now: pause. Close your eyes for 30 seconds and just breathe. When you open them, write down every task in your head — get it out of your nervous system and onto paper. Then circle the ONE thing that actually matters today. Everything else can wait. Your brain can only truly focus on one thing at a time anyway.`
  }
  return `That makes sense to be experiencing. What you're describing sounds like a pattern your nervous system has learned — likely for good reason. The first step is to stop pushing against it and start getting curious about what it's protecting. Take one slow breath before your next action, and ask: what would feel like the tiniest step forward right now? Start there.`
}
