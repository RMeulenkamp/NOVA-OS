'use client'

import { cn } from '@/lib/utils'
import type { Option } from '@/lib/method'

interface ChipGroupProps {
  options: Option[]
  selected: string[]
  onChange: (next: string[]) => void
  /** Only one option can be selected at a time */
  single?: boolean
  /** Selecting this option clears all others (e.g. "Nothing obvious") */
  exclusiveId?: string
}

export function ChipGroup({ options, selected, onChange, single = false, exclusiveId }: ChipGroupProps) {
  function toggle(id: string) {
    if (single) {
      onChange(selected.includes(id) ? [] : [id])
      return
    }
    if (exclusiveId && id === exclusiveId) {
      onChange(selected.includes(id) ? [] : [id])
      return
    }
    const base = exclusiveId ? selected.filter((s) => s !== exclusiveId) : selected
    onChange(base.includes(id) ? base.filter((s) => s !== id) : [...base, id])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={cn(
              'px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all duration-200',
              on
                ? 'bg-nova-accent/15 border-nova-accent/50 text-nova-accent'
                : 'bg-nova-surface border-nova-border text-nova-muted hover:border-nova-accent/30 hover:text-nova-text'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
