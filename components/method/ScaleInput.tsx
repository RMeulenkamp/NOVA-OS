'use client'

import { cn } from '@/lib/utils'

interface ScaleInputProps {
  label: string
  hint?: string
  value?: number
  onChange: (n: number) => void
  /** true: high numbers are good (energy). false: low numbers are good (tension). */
  goodHigh?: boolean
  lowLabel: string
  highLabel: string
}

// One tap instead of dragging a slider — keeps the check-in fast.
export function ScaleInput({ label, hint, value, onChange, goodHigh = true, lowLabel, highLabel }: ScaleInputProps) {
  function tone(n: number): string {
    const good = goodHigh ? n >= 7 : n <= 4
    const bad = goodHigh ? n <= 3 : n >= 8
    if (good) return 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
    if (bad) return 'bg-red-500/20 border-red-400/60 text-red-300'
    return 'bg-amber-500/20 border-amber-400/60 text-amber-300'
  }

  return (
    <div className="space-y-2">
      <div>
        <span className="text-sm font-medium text-nova-text">{label}</span>
        {hint && <p className="text-xs text-nova-dim mt-0.5">{hint}</p>}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'h-10 rounded-lg border text-xs font-semibold transition-all duration-150',
              value === n ? tone(n) : 'bg-nova-surface border-nova-border text-nova-muted hover:border-nova-accent/30'
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-nova-dim">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
