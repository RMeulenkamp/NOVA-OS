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

    const prompt = `You are a coach and expert in nervous system regulation and energy for driven, ambitious people. You work with the NOVA Method.

Core idea: low energy in ambitious people is NOT a discipline problem. It is an energy regulation problem. The hypothalamus acts as a safety gate — when the nervous system does not feel safe, it withholds energy. The solution is regulation, not more willpower.

The three signals the hypothalamus reads:
1. BODY — blood sugar, nutrition, stimulants, physical tension, sleep
2. CONSCIOUS — pressure thoughts, self-criticism, mental overload, belief patterns
3. SUBCONSCIOUS — nervous system safety vs stress, stored emotional patterns, baseline state

IMPORTANT: Some people answering this diagnostic are doing well. If their answers reflect good energy, healthy patterns and low stress — their result should reflect that positively. Do not force everyone into a problem pattern. If someone is doing well across all three signals, tell them clearly and give them tips to maintain and optimise further.

The person is \${name}. Their answers:

\${summary}

Analyse their answers carefully across all three signal areas. Then write a personalised energy diagnosis. Return ONLY valid JSON with no markdown and no code fences. Use this exact structure:

{
  "pattern_name": "A short memorable name for their energy pattern. For someone doing well: The Regulated Performer, The Grounded Achiever. For someone struggling: The Adrenaline Compensator, The Wired But Depleted, The Silent Burnout, The High-Functioning Flat.",
  "pattern_description": "2-3 sentences. What their specific pattern looks like day to day. Warm, direct, specific to their actual answers. Make them feel seen — whether they are struggling or thriving.",
  "body_status": "one of: Needs attention / Doing okay / Well regulated",
  "conscious_status": "one of: Needs attention / Doing okay / Well regulated",
  "subconscious_status": "one of: Needs attention / Doing okay / Well regulated",
  "signals_text": "2-3 sentences explaining what the three signal statuses mean together for this specific person. Reference their actual answers indirectly.",
  "drain_text": "3-4 sentences on what is either draining them OR if they are doing well what is working in their favour and what to stay aware of. Reference the hypothalamus and the safety gate mechanism. Be specific to their answers not generic.",
  "steps": [
    "One concrete actionable sentence they can apply today — specific to their dominant signal area",
    "One concrete actionable sentence — addressing a secondary area",
    "One concrete actionable sentence — for long-term regulation or maintenance"
  ]
}`

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
