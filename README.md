# NOVA OS — MVP Setup Guide

A calm, intelligent nervous system operating system for ambitious people.

---

## Stack

- **Next.js 14** (App Router) — framework
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **Claude claude-opus-4-6** (Anthropic) — AI responses
- **localStorage** — data persistence (no backend needed to start)
- **Supabase** (optional) — production database + auth

---

## Quick Start (5 minutes)

### 1. Install dependencies

```bash
cd nova-os
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com)

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

That's it. The app runs fully without a database — all data stores in your browser's localStorage.

---

## App Pages

| Route | Feature |
|-------|---------|
| `/welcome` | Landing + signup |
| `/onboarding` | 5-step personalization |
| `/dashboard` | Main dashboard |
| `/scanner` | Daily State Scanner |
| `/emergency` | Emergency Reset button |
| `/coach` | Pattern Interrupt chat |
| `/history` | Check-in and event history |
| `/settings` | Profile and data management |

---

## AI Features

All AI calls route through `/app/api/`:

- `POST /api/scanner` — analyzes daily check-in, returns state label + protocol
- `POST /api/emergency` — returns immediate support for emergency events
- `POST /api/coach` — streaming chat with Pattern Interrupt Coach

**Without an API key:** The app returns realistic mock responses so you can test the full UI flow.

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "NOVA OS MVP"
git remote add origin https://github.com/your-username/nova-os.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Click Deploy

Done. Your app is live.

---

## Add Supabase (Production Database)

For multi-device sync and production data storage:

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project

### 2. Run the schema

In the Supabase SQL Editor, paste and run the contents of `supabase/schema.sql`

### 3. Add environment variables

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Install the Supabase client

```bash
npm install @supabase/supabase-js
```

### 5. Migrate from localStorage

The `lib/storage.ts` file uses localStorage. To switch to Supabase, replace the storage functions with Supabase client calls using the same function signatures — no other code changes needed.

---

## Customization

### Brand colors

Edit `tailwind.config.js` under `colors.nova.*`

### AI tone

Edit the system prompt in `lib/nova-prompts.ts` → `NOVA_SYSTEM_PROMPT`

### Add check-in questions

Edit `app/scanner/page.tsx` and `lib/types.ts` → `DailyCheckIn`

### Change AI model

Edit `app/api/scanner/route.ts`, `app/api/emergency/route.ts`, `app/api/coach/route.ts`
Change `model: 'claude-opus-4-6'` to any available Claude model.

---

## Project Structure

```
nova-os/
├── app/
│   ├── api/
│   │   ├── scanner/route.ts      ← Daily scan AI
│   │   ├── emergency/route.ts    ← Emergency AI
│   │   └── coach/route.ts        ← Coach streaming AI
│   ├── dashboard/page.tsx        ← Main dashboard
│   ├── scanner/page.tsx          ← Daily State Scanner
│   ├── emergency/page.tsx        ← Emergency Button
│   ├── coach/page.tsx            ← Pattern Interrupt Chat
│   ├── history/page.tsx          ← History & insights
│   ├── settings/page.tsx         ← Profile & settings
│   ├── onboarding/page.tsx       ← 5-step onboarding
│   ├── welcome/page.tsx          ← Landing + signup
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navigation.tsx            ← TopBar + BottomNav
│   ├── scanner/StateResult.tsx   ← AI result display
│   └── ui/                       ← Card, Button, ScoreSlider
├── lib/
│   ├── types.ts                  ← All TypeScript types
│   ├── storage.ts                ← localStorage helpers
│   ├── nova-prompts.ts           ← AI system prompts
│   ├── auth-context.tsx          ← Auth state
│   └── utils.ts                  ← Helpers + colors
├── supabase/
│   └── schema.sql                ← Production DB schema
└── README.md
```

---

## Disclaimer

NOVA OS provides educational and behavioral support for energy, focus, stress awareness, and nervous system regulation. It is not medical advice and does not diagnose, treat, or cure medical conditions. If you have persistent fatigue, severe anxiety, depression, eating disorder symptoms, or other health concerns, consult a qualified healthcare professional.
