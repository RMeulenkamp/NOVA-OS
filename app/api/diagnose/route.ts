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

    const prompt = `You are an energy regulation coach using the NOVA Method. Analyse these diagnostic answers and return a diagnosis.

NOVA Method: low energy is a regulation problem not discipline. The hypothalamus is a safety gate. Unsafe signals = withheld energy.

Three signals: BODY (blood sugar, nutrition, stimulants, tension, sleep), CONSCIOUS (pressure thoughts, overload), SUBCONSCIOUS (nervous system baseline, stored patterns).

If answers show healthy patterns reflect that positively. Not everyone has a problem.

Person: ${name}
Answers:
${summary}

CRITICAL: Respond with ONLY a raw JSON object. No text before or after. No markdown.

IMPORTANT: Keep all text fields SHORT. Max 2 sentences per field. Steps need a short title and one sentence.

The cta_line must be a visualisable, falsifiable one-liner that paints the after-picture specific to this person's main struggle. Examples: "Want to get through 3pm without reaching for coffee?" or "Want to think clearly through a full meeting without forcing it?" or "Want to wake up and feel ready without needing an hour to get going?"

Use exactly this structure:
{"pattern_name":"string","pattern_description":"max 2 sentences","body_status":"Needs attention or Doing okay or Well regulated","conscious_status":"Needs attention or Doing okay or Well regulated","subconscious_status":"Needs attention or Doing okay or Well regulated","signals_text":"max 2 sentences","drain_text":"max 2 sentences","steps":[{"title":"3-4 word action label","text":"one sentence"},{"title":"3-4 word action label","text":"one sentence"},{"title":"3-4 word action label","text":"one sentence"}],"cta_line":"visualisable falsifiable one-liner painting the after-picture"}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
