import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName } = await req.json()

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 })
    }

    const apiKey = process.env.SYSTEME_API_KEY
    if (!apiKey) {
      console.warn('[CRM] SYSTEME_API_KEY not set — skipping')
      return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 200 })
    }

    const res = await fetch('https://api.systeme.io/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        email,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        tags: [{ name: 'App User' }],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.warn('[CRM] Systeme error:', res.status, text)
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('[CRM] Failed:', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
