'use client'

import { useState } from 'react'
import { Check, Headphones, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRACTICES, usePractices } from '@/lib/practices'

interface PracticePlayerProps {
  slug: string
  /** When provided, shows an "I did this" button and calls it once */
  onDone?: () => void
}

// Plays the practice audio when an audio_url is set in the Supabase `practices`
// table. Without audio it shows the practice and points to the course instead.
export function PracticePlayer({ slug, onDone }: PracticePlayerProps) {
  const rows = usePractices()
  const [done, setDone] = useState(false)

  const meta = PRACTICES[slug]
  const row = rows[slug]
  const name = row?.title || meta?.name || slug
  const blurb = row?.description || meta?.blurb || ''
  const audioUrl = row?.audio_url || null
  const courseUrl = row?.course_url || null

  function handleDone() {
    if (done) return
    setDone(true)
    onDone?.()
  }

  return (
    <div id={slug} className="rounded-xl border border-nova-accent/30 bg-nova-accent/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-nova-accent/15 flex items-center justify-center flex-shrink-0">
          <Headphones className="w-4 h-4 text-nova-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-nova-text-bright leading-tight">{name}</p>
          {blurb && <p className="text-xs text-nova-muted mt-1 leading-relaxed">{blurb}</p>}
          {row?.duration_label && <p className="text-[10px] text-nova-dim mt-1">{row.duration_label}</p>}
        </div>
      </div>

      {audioUrl ? (
        <audio controls preload="none" src={audioUrl} className="w-full h-10" />
      ) : (
        <div className="rounded-lg border border-dashed border-nova-border px-3 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-nova-dim">Audio is not added yet. Do this one from your course.</p>
          {courseUrl && (
            <a
              href={courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-nova-accent hover:underline flex-shrink-0"
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {onDone && (
        <button
          type="button"
          onClick={handleDone}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
            done
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
              : 'bg-nova-surface border-nova-border text-nova-text hover:border-nova-accent/40'
          )}
        >
          {done ? (
            <>
              <Check className="w-4 h-4" /> Done
            </>
          ) : (
            'I did this'
          )}
        </button>
      )}
    </div>
  )
}
