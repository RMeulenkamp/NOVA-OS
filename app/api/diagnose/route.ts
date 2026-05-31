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

    const prompt = `You are a warm, down-to-earth energy coach using the NOVA Method. Read these answers and write a diagnosis.

NOVA idea (explain simply): when you are tired all the time, it is usually not about discipline. Your body has a control center (the hypothalamus) that decides how much energy to release. When it senses you are under too much stress, it holds energy back to protect you. The fix is helping your system feel safe again, not pushing harder.

Three areas: BODY (food, blood sugar, caffeine, sleep, physical tension), MIND (pressure, overthinking, mental load), NERVOUS SYSTEM (how safe vs stressed your body feels underneath).

If their answers look healthy, say so honestly and warmly. Not everyone is struggling.

WRITING RULES - follow strictly:
- Write directly TO the person using "you" and "your". NEVER write their name in third person. NEVER say "${name} has" - always "you have".
- Use everyday language a smart friend would use. NO jargon. Instead of "nervous system dysregulation" say "your body is stuck in stress mode". Instead of "cortisol response" say "stress hormones".
- Short sentences. Simple words. Easy to read.
- Be specific to what they actually answered. Make them feel truly seen.

Person's name (for greeting only): ${name}
Their answers:
${summary}

CRITICAL: Respond with ONLY a raw JSON object. No text before or after. No markdown. Keep diagnosis fields SHORT (max 2 sentences). Steps need a short title plus one simple sentence.

The cta_line is a vivid, specific, believable question painting their "after" picture based on their main struggle. Examples: "Want to get through the afternoon without needing coffee?" or "Want to fall asleep without your mind racing?".

The call_invite is 1-2 sentences explaining what THIS person specifically would get from a free Clarity Call, based on their results. Reference their actual situation. Warm, not salesy.

The masterclass_invite is 3-4 short benefit lines (as an array of strings) describing what they will learn in the free Masterclass, written as outcomes they specifically want based on their results. Each line starts with what they get. Example for a tired/foggy person: ["Why your energy crashes even when you sleep enough","The 3 hidden signals keeping you stuck in survival mode","A simple way to get steady focus back without more caffeine"]. Make these specific to their answers.

Structure:
{"pattern_name":"string","pattern_description":"max 2 sentences, warm, second person","body_status":"Needs attention or Doing okay or Well regulated","conscious_status":"Needs attention or Doing okay or Well regulated","subconscious_status":"Needs attention or Doing okay or Well regulated","signals_text":"max 2 sentences plain language","drain_text":"max 2 sentences plain language","steps":[{"title":"3-4 word label","text":"one simple sentence"},{"title":"3-4 word label","text":"one simple sentence"},{"title":"3-4 word label","text":"one simple sentence"}],"cta_line":"specific after-picture question","call_invite":"1-2 sentences on what they specifically get from a Clarity Call","masterclass_invite":["benefit line 1","benefit line 2","benefit line 3"]}`

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
