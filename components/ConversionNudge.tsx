'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getCheckIns, getEmergencyEvents } from '@/lib/storage'
import { detectConversionTrigger, isNudgeDismissed, dismissNudge } from '@/lib/conversions'
import { cn } from '@/lib/utils'
import { Sparkles, X, ExternalLink } from 'lucide-react'

interface NudgeData {
  headline: string
  message: string
  ctaText: string
  ctaUrl: string
}

export function ConversionNudge() {
  const { user } = useAuth()
  const [nudge, setNudge] = useState<NudgeData | null>(null)
  const [triggerType, setTriggerType] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const checkIns = getCheckIns().filter(c => c.userId === user.id)
    const emergencyEvents = getEmergencyEvents().filter(e => e.userId === user.id)

    // Need at least 3 check-ins before showing any nudge
    if (checkIns.length < 3) return

    const trigger = detectConversionTrigger(checkIns, emergencyEvents, user)
    if (!trigger) return
    if (isNudgeDismissed(trigger.type)) return

    setTriggerType(trigger.type)
    fetchNudge(trigger.type, trigger.patternSummary)
  }, [user])

  async function fetchNudge(type: string, patternSummary: string) {
    setIsLoading(true)
    try {
      const res = await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: type, patternSummary, user }),
      })
      const data = await res.json()
      if (data.result) {
        setNudge(data.result)
        setIsVisible(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDismiss() {
    if (triggerType) dismissNudge(triggerType)
    setIsVisible(false)
  }

  if (!isVisible || !nudge) return null

  return (
    <div className="nova-card border-nova-accent/30 overflow-hidden animate-slide-up">
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-nova-accent-soft via-nova-accent to-nova-mint" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nova-accent-soft to-nova-accent flex items-center justify-center flex-shrink-0 shadow-nova-accent">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-nova-accent uppercase tracking-widest font-medium">
                NOVA noticed a pattern
              </p>
              <p className="text-sm font-semibold text-nova-text-bright leading-tight mt-0.5">
                {nudge.headline}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-nova-dim hover:text-nova-muted flex-shrink-0 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-nova-muted leading-relaxed mb-4">
          {nudge.message}
        </p>

        {/* CTA */}
        <a
          href={nudge.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
            'bg-gradient-to-r from-nova-accent-soft to-nova-accent',
            'text-white text-sm font-semibold',
            'hover:opacity-90 active:scale-[0.98] transition-all duration-200',
            'shadow-nova-accent'
          )}
        >
          {nudge.ctaText}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <p className="text-[10px] text-nova-dim text-center mt-2">
          Free · Live training · No credit card
        </p>
      </div>
    </div>
  )
}
