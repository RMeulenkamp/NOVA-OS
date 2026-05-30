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

    const summary = answers
      .map((a: { question: string; area: string; answer: string }) =>
        `[${a.area.toUpperCase()}] ${a.question}\nAnswer: ${a.answer}`
      )
      .join('\n\n')

    const prompt = `You are an energy regulation coach working with the NOVA Method. Analyse these diagnostic answers and return a diagnosis.

NOVA Method core: low energy is an energy regulation problem, not discipline. The hypothalamus is a safety gate — when the nervous system feels unsafe, it withholds energy.

Three signals: BODY (blood sugar, nutrition, stimulants, tension, sleep), CONSCIOUS (pressure thoughts, overload), SUBCONSCIOUS (nervous system baseline, stored patterns).

If answers show good energy and healthy patterns, reflect that positively. Not everyone has a problem.

Person: ${name}
Answers:
${summary}

YOU MUST respond with ONLY a raw JSON object. No text before it. No text after it. No markdown. No explanation. Start your response with { and end with }

{"pattern_name":"short memorable name","pattern_description":"2-3 sentences warm and specific to their answers","body_status":"Needs attention or Doing okay or Well regulated","conscious_status":"Needs attention or Doing okay or Well regulated","subconscious_status":"Needs attention or Doing okay or Well regulated","signals_text":"2-3 sentences about their three signal levels","drain
cat > app/api/diagnose/route.ts << 'EOF'
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

    const summary = answers
      .map((a: { question: string; area: string; answer: string }) =>
        `[${a.area.toUpperCase()}] ${a.question}\nAnswer: ${a.answer}`
      )
      .join('\n\n')

    const prompt = `You are an energy regulation coach working with the NOVA Method. Analyse these diagnostic answers and return a diagnosis.

NOVA Method core: low energy is an energy regulation problem, not discipline. The hypothalamus is a safety gate — when the nervous system feels unsafe, it withholds energy.

Three signals: BODY (blood sugar, nutrition, stimulants, tension, sleep), CONSCIOUS (pressure thoughts, overload), SUBCONSCIOUS (nervous system baseline, stored patterns).

If answers show good energy and healthy patterns, reflect that positively. Not everyone has a problem.

Person: ${name}
Answers:
${summary}

YOU MUST respond with ONLY a raw JSON object. No text before it. No text after it. No markdown. No explanation. Start your response with { and end with }

{"pattern_name":"short memorable name","pattern_description":"2-3 sentences warm and specific to their answers","body_status":"Needs attention or Doing okay or Well regulated","conscious_status":"Needs attention or Doing okay or Well regulated","subconscious_status":"Needs attention or Doing okay or Well regulated","signals_text":"2-3 sentences about their three signal levels","drain_text":"3-4 sentences on what is draining them or working in their favour","steps":["concrete action today","concrete action for secondary area","long-term regulation tip"]}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = (message.content[0] as { text: string }).text
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
