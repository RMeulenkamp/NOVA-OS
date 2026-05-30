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

    const prompt = `You are an energy regulation coach using the NOVA Method. Analyse these answers and return a diagnosis as a raw JSON object.

NOVA Method: low energy is a regulation problem, not discipline. The hypothalamus is a safety gate. When unsafe signals come in, it withholds energy.

Three signals: BODY (blood sugar, nutrition, stimulants, tension, sleep), CONSCIOUS (pressure thoughts, overload), SUBCONSCIOUS (nervous system baseline, stored patterns).

If answers show healthy patterns, reflect that positively. Not everyone has a problem.

Person: ${name}
Answers:
${summary}

Respond with ONLY a raw JSON object. No intro text. No explanation. No markdown. Your entire response must start with { and end with }.

Required format:
{"pattern_name":"string","pattern_description":"string","body_status":"Needs attention or Doing okay or Well regulated","conscious_status":"Needs attention or Doing okay or Well regulated","subconscious_status":"Needs attention or Doing okay or Well regulated","signals_text":"string","drain_text":"string","steps":["string","string","string"]}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        },
        {
          role: 'assistant',
          content: '{'
        }
      ]
    })

    const raw = '{' + (message.content[0] as { text: string }).text
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json({ result }, { headers: CORS })

  } catch (err) {
    console.error('Diagnose API error:', err)
    return NextResponse.json(
      { error: 'Failed to generate diagnosis' },
      { status: 500, headers: CORS }
    )
  }
}
