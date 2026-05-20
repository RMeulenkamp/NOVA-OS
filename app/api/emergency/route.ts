import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { NOVA_SYSTEM_PROMPT, buildEmergencyPrompt } from '@/lib/nova-prompts'
import type { EmergencyEventType, NovaUser, AIEmergencyResponse } from '@/lib/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const {
      eventType,
      intensity,
      triggerText,
      user,
    }: {
      eventType: EmergencyEventType
      intensity: number
      triggerText?: string
      user?: NovaUser
    } = await req.json()

    if (!eventType || !intensity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ result: getMockEmergencyResponse(eventType) })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: NOVA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildEmergencyPrompt(eventType, intensity, triggerText, user),
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result: AIEmergencyResponse = JSON.parse(cleanText)

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Emergency API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}

// ─── Mock responses ───────────────────────────────────────────────────────────

const mockResponses: Partial<Record<EmergencyEventType, AIEmergencyResponse>> = {
  crashing: {
    immediateValidation:
      "This is your system asking for support, not failing you. An energy crash is a signal, not a verdict.",
    patternInterpretation:
      "This may be a stress-response depletion pattern — where adrenaline-driven energy runs out and the system drops suddenly. Very common in high-output people.",
    sixtySecondReset:
      "Place one hand on your chest. Take 6 slow breaths — exhale longer than you inhale. Let your jaw soften. You don't need to fix anything in this moment.",
    threeMinuteNextStep:
      "Drink water with a pinch of salt or minerals. If you haven't eaten protein in the last 3 hours, eat something now. Sit quietly for 3 minutes before deciding what to do next.",
    whatNotToDo:
      "Don't add caffeine on top of a crash — it borrows more from an already depleted system.",
    groundingSentence:
      "My body is asking for recovery, not pushing through.",
  },
  sugar_craving: {
    immediateValidation:
      "Pause. This does not look like a discipline problem. A strong craving often means your system is asking for fast safety, stimulation, or blood sugar stability.",
    patternInterpretation:
      "Strong food or sugar cravings often coincide with stress, low blood sugar, emotional suppression, or nervous system dysregulation — not weakness.",
    sixtySecondReset:
      "Put one hand on your chest. Take 6 slow breaths — let the exhale be longer than the inhale. Relax your jaw. Let your shoulders drop.",
    threeMinuteNextStep:
      "Drink water with minerals or salt. Eat protein if you haven't eaten enough recently. Wait 5 minutes before deciding.",
    whatNotToDo:
      "Don't add shame — shame increases the stress signal and often makes the craving stronger.",
    groundingSentence:
      "I can listen to the signal without obeying the impulse immediately.",
  },
  cant_focus: {
    immediateValidation:
      "Not being able to focus doesn't mean you're broken or lazy. It often means your system is overloaded or under-resourced.",
    patternInterpretation:
      "Scattered or blocked focus is frequently a sign of nervous system activation, decision fatigue, or low glucose — not a character flaw.",
    sixtySecondReset:
      "Stand up. Look slowly around the room and name 5 things you can see. This activates your parasympathetic system and brings you back to the present.",
    threeMinuteNextStep:
      "Choose one tiny action — not a full task. Open the document. Write one sentence. Set a timer for 5 minutes. Build movement, not pressure.",
    whatNotToDo:
      "Don't judge the state — self-pressure narrows cognitive bandwidth further.",
    groundingSentence:
      "Right now, I just need to start. One thing. That's all.",
  },
}

function getMockEmergencyResponse(eventType: EmergencyEventType): AIEmergencyResponse {
  return (
    mockResponses[eventType] || {
      immediateValidation:
        "What you're feeling is a signal from your system — not a sign you're failing. Take a breath.",
      patternInterpretation:
        "This state likely has a physiological or nervous system component. It's worth understanding the pattern before acting on it.",
      sixtySecondReset:
        "Slow your breath. Exhale longer than your inhale for 6 cycles. Let your body settle.",
      threeMinuteNextStep:
        "Don't make any decisions for 3 minutes. Drink water. Sit somewhere quiet. Let the activation settle.",
      whatNotToDo:
        "Don't add judgment to the feeling — that creates a second layer of stress on top of the first.",
      groundingSentence:
        "This is temporary. I can support myself through it.",
    }
  )
}
