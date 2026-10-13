'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from './supabase'
import type { MethodStep } from './types'

// ─── Practice library ─────────────────────────────────────────────────────────
// Static metadata lives here. Audio files, custom titles and descriptions are
// managed from the Supabase `practices` table (no code changes needed).

export interface PracticeMeta {
  slug: string
  name: string
  blurb: string
  step: MethodStep
}

export const PRACTICE_LIST: PracticeMeta[] = [
  { slug: 'open-loop-reset', name: 'Open Loop Reset', blurb: 'Close, schedule or drop what is hanging open.', step: 'reset' },
  { slug: 'expand-breath', name: 'Expand Breath Practice', blurb: 'Widen your attention and come back to the present.', step: 'realize' },
  { slug: 'regulation-breath', name: 'The Regulation Breath', blurb: 'Slow, steady breathing to settle your body.', step: 'regulate' },
  { slug: 'shake-for-sanity', name: 'Shake for Sanity', blurb: 'Shake it out. Move to burn off tension or wake yourself up.', step: 'regulate' },
  { slug: 'nova-recode', name: 'NOVA Recode', blurb: 'Work with an older emotional pattern at its root.', step: 'release' },
  { slug: 'where-focus-goes', name: 'Where Focus Goes, Energy Flows', blurb: 'Point your attention at what you want to grow.', step: 'rewire' },
  { slug: 'future-visualization', name: 'Future Visualization', blurb: 'See and feel the version of you that handles this well.', step: 'rewire' },
  { slug: 'affirmation-meditation', name: 'Affirmation Meditation', blurb: 'A short meditation to anchor a calmer, stronger state.', step: 'rewire' },
  { slug: 'intentional-focus', name: 'Intentional Focus Practice', blurb: 'Choose where your attention goes next.', step: 'rewire' },
]

export const PRACTICES: Record<string, PracticeMeta> = PRACTICE_LIST.reduce(
  (acc, p) => {
    acc[p.slug] = p
    return acc
  },
  {} as Record<string, PracticeMeta>
)

export function practiceName(slug: string): string {
  return PRACTICES[slug]?.name ?? slug
}

// ─── Overrides from Supabase ──────────────────────────────────────────────────

export interface PracticeRow {
  slug: string
  title?: string | null
  description?: string | null
  audio_url?: string | null
  course_url?: string | null
  duration_label?: string | null
}

let cache: Record<string, PracticeRow> | null = null
let inflight: Promise<Record<string, PracticeRow>> | null = null

async function loadPractices(): Promise<Record<string, PracticeRow>> {
  if (cache) return cache
  if (inflight) return inflight

  const sb = getSupabase()
  if (!sb) {
    cache = {}
    return cache
  }

  inflight = (async () => {
    const map: Record<string, PracticeRow> = {}
    try {
      const { data } = await sb.from('practices').select('*')
      ;(data ?? []).forEach((r: PracticeRow) => {
        map[r.slug] = r
      })
      cache = map
    } catch {
      // Network or table problem: fall back to static metadata, try again next visit
    }
    inflight = null
    return map
  })()

  return inflight
}

export function usePractices(): Record<string, PracticeRow> {
  const [rows, setRows] = useState<Record<string, PracticeRow>>(cache ?? {})

  useEffect(() => {
    let alive = true
    loadPractices().then((r) => {
      if (alive) setRows(r)
    })
    return () => {
      alive = false
    }
  }, [])

  return rows
}
