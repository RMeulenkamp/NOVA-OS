import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { NOVA_SYSTEM_PROMPT, buildConversionNudgePrompt } from '@/lib/nova-prompts'
import type { NovaUser } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { triggerType, patternSummary, user }: {
      triggerType: string
      patternSummary: string
      user?: NovaUser
    } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ result: getMockNudge(triggerType, user) })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: NOVA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildConversionNudgePrompt(triggerType, patternSummary, user) }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return NextResponse.json({ result: JSON.parse(clean) })

  } catch (err) {
    console.error('Nudge API error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// ── Base nudges (for users who haven't done the Masterclass yet) ──────────────
const mockNudges: Record<string, object> = {
  persistent_tired_wired: {
    headline: "This pattern has a root cause",
    message: "Your data shows a recurring Tired but Wired pattern — exhausted but unable to land. This is one of the most common signals we see in driven people, and it points to a specific nervous system mechanism. The free Abundant Energy Masterclass covers exactly this — why it happens and the three levers that resolve it.",
    ctaText: "Watch the free Masterclass",
    ctaUrl: "https://www.nova-method.com/masterclass",
  },
  frequent_emergency: {
    headline: "Your system is asking for more than resets",
    message: "You've used emergency support several times this week. Resets help in the moment — but your pattern suggests the underlying system needs deeper attention. The Abundant Energy Masterclass in 60 minutes gives you the full picture of what's driving this and how to address it at the root.",
    ctaText: "Watch the free Masterclass",
    ctaUrl: "https://www.nova-method.com/masterclass",
  },
  persistent_compensation: {
    headline: "Battery saving mode is a loan, not a solution",
    message: "Your check-ins show your system repeatedly running in Battery Saving Mode — energy that feels available but comes from your stress response, not genuine reserves. This pattern builds quietly and costs more over time. The free Abundant Energy Masterclass explains the exact mechanism and what it takes to break the cycle.",
    ctaText: "Watch the free Masterclass",
    ctaUrl: "https://www.nova-method.com/masterclass",
  },
  seven_day_streak: {
    headline: "7 days of awareness. Ready to go deeper?",
    message: "You've checked in every day this week — that kind of consistency matters. The awareness you're building here is exactly the first step. If you want to understand the full picture of what drives your energy patterns, the free Abundant Energy Masterclass was built for where you are right now.",
    ctaText: "Watch the free Masterclass",
    ctaUrl: "https://www.nova-method.com/masterclass",
  },
  chronic_low_energy: {
    headline: "Low energy this week isn't random",
    message: "Your morning energy has averaged below 5 this week. That's a signal worth taking seriously — not with more pressure, but with curiosity. The free Abundant Energy Masterclass explains exactly why driven people lose energy and what the three-lever reset looks like.",
    ctaText: "Watch the free Masterclass",
    ctaUrl: "https://www.nova-method.com/masterclass",
  },
  default: {
    headline: "There's a deeper level to this",
    message: "The patterns NOVA is tracking in your data point to something the app can support daily — but the full reset goes deeper. The free Abundant Energy Masterclass covers the complete NOVA Method in 60 minutes.",
    ctaText: "Watch the free Masterclass",
    ctaUrl: "https://www.nova-method.com/masterclass",
  },
}

// ── Post-Masterclass nudges (user has seen the Masterclass, not yet in program) ─
const postMasterclassNudges: Record<string, object> = {
  persistent_tired_wired: {
    headline: "You know this pattern — time to address the root",
    message: "You've seen how tired-but-wired works in the Masterclass. Your data shows it's persisting — which means awareness alone isn't moving the needle yet. The 7-week Abundant Energy Reset is where this actually gets resolved, working all 3 levers simultaneously.",
    ctaText: "Book a Clarity Call",
    ctaUrl: "https://www.nova-method.com/clarity-call",
  },
  frequent_emergency: {
    headline: "The resets aren't enough on their own",
    message: "Emergency resets work in the moment — but the frequency of these moments tells a deeper story. The Abundant Energy Reset addresses what's driving the pattern, not just the symptoms. A Clarity Call takes 30 minutes and shows you exactly where to start.",
    ctaText: "Book a Clarity Call",
    ctaUrl: "https://www.nova-method.com/clarity-call",
  },
  default: {
    headline: "The next step is deeper work",
    message: "Your patterns suggest you understand the mechanism — now it's time to do the work at the root level. The 7-week Abundant Energy Reset was built for exactly where you are. A Clarity Call will show you if it's the right fit.",
    ctaText: "Book a Clarity Call",
    ctaUrl: "https://www.nova-method.com/clarity-call",
  },
}

// ── In-program nudges (user is currently in the Energy Reset) ─────────────────
const inProgramNudges: Record<string, object> = {
  default: {
    headline: "This is part of the process",
    message: "What you're seeing in your check-ins is a normal part of the reset — your system is recalibrating. Stay consistent with your program this week. The pattern you're noticing is data, not a setback. Trust the process and keep going.",
    ctaText: "Continue the program",
    ctaUrl: "https://www.nova-method.com/program",
  },
}

// ── Post-program nudges (user has completed the Energy Reset) ─────────────────
const postProgramNudges: Record<string, object> = {
  default: {
    headline: "A familiar pattern is showing up again",
    message: "You've done the work — and you know what this pattern means. If it's returning, it may be time to revisit specific parts of the reset, or to go deeper with 1-on-1 support. A Clarity Call with Ruben takes 30 minutes and can pinpoint exactly what needs attention.",
    ctaText: "Book a Clarity Call",
    ctaUrl: "https://www.nova-method.com/clarity-call",
  },
}

function getMockNudge(triggerType: string, user?: NovaUser) {
  if (user?.inProgram) {
    return inProgramNudges[triggerType] || inProgramNudges.default
  }
  if (user?.energyResetCompleted) {
    return postProgramNudges[triggerType] || postProgramNudges.default
  }
  if (user?.masterclassCompleted) {
    return postMasterclassNudges[triggerType] || postMasterclassNudges.default
  }
  return mockNudges[triggerType] || mockNudges.default
}
