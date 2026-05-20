import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { NOVA_SYSTEM_PROMPT, getToneModifier } from '@/lib/nova-prompts'
import type { NovaUser } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { period, averages, checkInCount, user }: {
      period: 'week' | 'month' | 'year'
      averages: { sleepQuality: number; morningEnergy: number; mentalClarity: number; stressPressure: number; bodyTension: number }
      checkInCount: number
      user?: NovaUser
    } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ result: getMockPeriodReading(period, averages) })
    }

    const periodLabel = period === 'week' ? 'last 7 days' : period === 'month' ? 'last 30 days' : 'last 365 days'
    const tone = getToneModifier(user?.preferredTone)

    const prompt = `Analyze these average energy and wellness scores over the ${periodLabel} (based on ${checkInCount} check-ins).

Averages:
- Sleep quality: ${averages.sleepQuality}/10
- Morning energy: ${averages.morningEnergy}/10
- Mental clarity: ${averages.mentalClarity}/10
- Stress / pressure: ${averages.stressPressure}/10
- Body tension: ${averages.bodyTension}/10

Tone: ${tone}

Return a JSON object with exactly these fields:
{
  "overallState": "2-3 word summary of this period (e.g. 'Moderate regulation', 'Strong recovery', 'High stress load')",
  "reading": "2-3 sentences interpreting the pattern across this period",
  "keyInsight": "1 sentence — the most important thing to know from this data",
  "recommendation": "1-2 sentences — what to focus on going forward based on this period",
  "strengthSignal": "1 sentence on the strongest signal (what was working)",
  "watchSignal": "1 sentence on what needs more attention"
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: NOVA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return NextResponse.json({ result: JSON.parse(clean) })

  } catch (error) {
    console.error('Period reading error:', error)
    return NextResponse.json({ error: 'Failed to generate reading' }, { status: 500 })
  }
}

function getMockPeriodReading(
  period: string,
  avgs: { sleepQuality: number; morningEnergy: number; mentalClarity: number; stressPressure: number; bodyTension: number }
) {
  const avgEnergy = (avgs.sleepQuality + avgs.morningEnergy + avgs.mentalClarity) / 3
  const avgStress = (avgs.stressPressure + avgs.bodyTension) / 2

  if (avgEnergy >= 7 && avgStress <= 5) {
    return {
      overallState: 'Stable regulation',
      reading: `Over the ${period}, your energy and recovery signals have been above baseline. Sleep quality and morning energy are consistent, suggesting your system is operating from genuine reserves rather than stress compensation.`,
      keyInsight: "Your body has been getting what it needs — this is a period to build on, not just maintain.",
      recommendation: "Continue what is working and add one small optimization, like earlier sleep timing or reducing afternoon stimulants.",
      strengthSignal: "Consistent sleep quality — the foundation of everything else.",
      watchSignal: "Stress scores are moderate — stay proactive about regulation even in good periods.",
    }
  }

  return {
    overallState: 'Moderate stress load',
    reading: `Over the ${period}, your system has been carrying a moderate stress load. Energy and clarity are functional but not fully optimized, and stress scores suggest your nervous system has been working harder than ideal.`,
    keyInsight: "This period shows a pattern of functioning under load — managing, but not yet thriving.",
    recommendation: "Prioritize one stabilizing habit: protein before caffeine, a 5-minute afternoon reset, or consistent sleep timing.",
    strengthSignal: "You are still showing up — consistency counts even in difficult periods.",
    watchSignal: 'Body tension is elevated — that often precedes crashes if not addressed.',
  }
}
