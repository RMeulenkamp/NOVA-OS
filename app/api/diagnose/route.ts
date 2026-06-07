import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const { name, answers } = await req.json()

    const summary = (answers as Array<{ question: string; area: string; answer: string }>)
      .map(a => `[${a.area.toUpperCase()}] ${a.question}\nAnswer: ${a.answer}`)
      .join('\n\n')

    const prompt = `You are a warm, down-to-earth energy coach using the NOVA Method. Read these answers and write a scan result.

NOVA idea: when you are tired all the time it is usually not about discipline. Your body has a control center (the hypothalamus) that decides how much energy to release. When it senses too much stress it holds energy back to protect you. The fix is helping your system feel safe again not pushing harder.

Three areas: BODY (food, blood sugar, caffeine, sleep, physical tension), MIND (pressure, overthinking, mental load), NERVOUS SYSTEM (how safe vs stressed your body feels underneath).

If their answers look healthy say so honestly and warmly. Not everyone is struggling.

WRITING RULES:
- Write directly TO the person using "you" and "your". NEVER use their name in third person.
- Use everyday language. NO jargon. Say "your body is stuck in stress mode" not "nervous system dysregulation".
- Short sentences. Simple words. Easy to read.
- Be specific to their actual answers. Make them feel truly seen.

Person name (greeting only): ${name}
Answers:
${summary}

SCORING RULES — read carefully:
For each of the three areas, assign a SPECIFIC integer score from 0 to 100 based on what they actually answered.
- Someone who answered mostly positive/healthy options scores 72-88
- Someone with moderate issues scores 38-65
- Someone with significant issues scores 15-42
- Vary the scores realistically — they should NOT all be the same number
- Examples of realistic score sets: 71/34/28 or 82/79/81 or 44/31/55 or 68/52/41
- NEVER return 50/50/50 — this means you did not calculate the scores

CRITICAL: Respond with ONLY a raw JSON object. No text before or after. No markdown.

Structure — use EXACT integer values for the score fields:
{"pattern_name":"string","pattern_description":"max 2 sentences warm second person","body_score":72,"conscious_score":34,"subconscious_score":28,"body_status":"Needs attention or Doing okay or Well regulated","conscious_status":"Needs attention or Doing okay or Well regulated","subconscious_status":"Needs attention or Doing okay or Well regulated","signals_text":"max 2 sentences plain language","drain_text":"max 2 sentences plain language","steps":[{"title":"3-4 word label","text":"one simple sentence"},{"title":"3-4 word label","text":"one simple sentence"},{"title":"3-4 word label","text":"one simple sentence"}],"cta_line":"specific after-picture question","call_invite":"1-2 sentences specific to their situation","masterclass_invite":["benefit 1","benefit 2","benefit 3"]}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = (message.content[0] as { text: string }).text
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON found in response')
    const result = JSON.parse(match[0])

    return NextResponse.json({ result }, { headers: CORS })

  } catch (err) {
    console.error('Diagnose API error:', err)
    return NextResponse.json(
      { error: 'Failed to generate diagnosis' },
      { status: 500, headers: CORS }
    )
  }
}
