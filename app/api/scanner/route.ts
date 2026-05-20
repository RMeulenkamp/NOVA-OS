import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { NOVA_SYSTEM_PROMPT, buildScannerPrompt } from '@/lib/nova-prompts'
import type { DailyCheckIn, NovaUser, AICheckInResponse } from '@/lib/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { checkIn, user }: { checkIn: DailyCheckIn; user?: NovaUser } = await req.json()

    if (!checkIn) {
      return NextResponse.json({ error: 'Missing check-in data' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a realistic mock response when no API key is set
      const mockResponse: AICheckInResponse = getMockScannerResponse(checkIn)
      return NextResponse.json({ result: mockResponse })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: NOVA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildScannerPrompt(checkIn, user),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result: AICheckInResponse = JSON.parse(cleanText)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Scanner API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}

// ─── Mock response (no API key fallback) ─────────────────────────────────────

function getMockScannerResponse(checkIn: DailyCheckIn): AICheckInResponse {
  const avgScore =
    (checkIn.sleepQuality + checkIn.morningEnergy + checkIn.mentalClarity) / 3

  if (avgScore >= 7 && checkIn.stressPressure <= 5) {
    return {
      stateLabel: 'Calm Focus',
      stateInterpretation:
        "Your system looks well-resourced today. Sleep, energy, and clarity are all above baseline, and stress appears manageable. This is a genuine capacity day, not a borrowed one.",
      likelyPattern: "Regulated recovery has stacked up and your system is rewarding it with consistent output capacity.",
      todaysFocus: "Protect this state and use it for your most important work.",
      recommendedActions: [
        "Prioritize your single highest-leverage task in the first 90 minutes",
        "Keep caffeine to your usual level — no need to push",
        "Protect your afternoon with a 10-minute walk or short reset",
      ],
      whatToAvoid: "Overloading your schedule just because you feel good — preserve the state.",
      encouragingReframe:
        "This is what consistency builds toward. Note how this feels so you can recognize the inputs that got you here.",
      protocolCategory: 'Focus',
    }
  }

  if (checkIn.stressPressure >= 7 || checkIn.caffeineDesire === 'desperate') {
    return {
      stateLabel: 'Battery Saving Mode',
      stateInterpretation:
        "Your system shows signs of running on borrowed energy. Sleep and energy scores suggest your body may be running on adrenaline rather than genuine reserves. The strong caffeine desire is a common signal of this pattern.",
      likelyPattern:
        "When the body is under stress load, it often borrows energy through the stress response — giving short bursts that feel productive but increase the crash likelihood later.",
      todaysFocus: "Stabilization before optimization.",
      recommendedActions: [
        "Start with protein and water before reaching for caffeine",
        "Do one 5-minute downregulation practice before deep work",
        "Choose one main task only — not a full list",
      ],
      whatToAvoid:
        "Trying to force a high-output day from a dysregulated state — it increases the cost.",
      encouragingReframe:
        "This is not a failure day. This is a signal day. If you respond correctly today, you build trust with your system and create better capacity for tomorrow.",
      protocolCategory: 'Stabilize',
    }
  }

  return {
    stateLabel: 'Recovery Needed',
    stateInterpretation:
      "Your system is asking for recovery, not performance. Energy, clarity, and sleep scores suggest your reserves need attention before you can operate at your best.",
    likelyPattern:
      "This looks like cumulative depletion — where ongoing pressure without sufficient recovery has created a deficit that now shows up as low capacity.",
    todaysFocus: "Reduce nervous system noise and create steady, low-demand energy.",
    recommendedActions: [
      "Prioritize nourishment: real food, hydration, minimal stimulants",
      "Reduce your task list to one or two non-urgent items",
      "Add a short rest or body movement — even 10 minutes helps",
    ],
    whatToAvoid:
      "Interpreting low energy as personal failure, or pushing through with more stimulants.",
    encouragingReframe:
      "Recovery is not the opposite of progress. It is how your system prepares for the next level.",
    protocolCategory: 'Recover',
  }
}
