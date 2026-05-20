'use client'

import { cn } from '@/lib/utils'

interface ScoreSliderProps {
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function ScoreSlider({
  label,
  hint,
  value,
  onChange,
  min = 1,
  max = 10,
}: ScoreSliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  function getColor() {
    if (value >= 8) return '#10b981'
    if (value >= 6) return '#f59e0b'
    if (value >= 4) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-nova-text">{label}</span>
          {hint && <p className="text-xs text-nova-dim mt-0.5">{hint}</p>}
        </div>
        <span
          className="text-lg font-semibold w-8 text-right"
          style={{ color: getColor() }}
        >
          {value}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${getColor()} 0%, ${getColor()} ${pct}%, #1e2f4d ${pct}%, #1e2f4d 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-nova-dim">Low</span>
          <span className="text-[10px] text-nova-dim">High</span>
        </div>
      </div>
    </div>
  )
}

// ─── Option Selector ──────────────────────────────────────────────────────────

interface OptionSelectorProps<T extends string> {
  label: string
  hint?: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  columns?: 2 | 3 | 4
}

export function OptionSelector<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  columns = 3,
}: OptionSelectorProps<T>) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="text-sm font-medium text-nova-text">{label}</span>
        {hint && <p className="text-xs text-nova-dim mt-0.5">{hint}</p>}
      </div>
      <div className={cn('grid gap-2', gridCols[columns])}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200',
              value === opt.value
                ? 'bg-nova-accent/15 border-nova-accent/50 text-nova-accent'
                : 'bg-nova-surface border-nova-border text-nova-muted hover:border-nova-accent/30 hover:text-nova-text'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
