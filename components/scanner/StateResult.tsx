'use client'

import { Card } from '@/components/ui/Card'
import { cn, getStateLabelBg, getStateLabelColor, getProtocolColor } from '@/lib/utils'
import type { AICheckInResponse, DailyCheckIn } from '@/lib/types'
import { CheckCircle, AlertCircle, TrendingUp, Lightbulb, Shield } from 'lucide-react'

interface StateResultProps {
  result: AICheckInResponse
  checkIn: DailyCheckIn
}

export function StateResult({ result, checkIn }: StateResultProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* State label */}
      <Card className={cn('text-center', getStateLabelBg(result.stateLabel))}>
        <div className="space-y-2">
          <p className="text-xs text-nova-muted uppercase tracking-wider">Your state today</p>
          <h2 className={cn('text-2xl font-semibold', getStateLabelColor(result.stateLabel))}>
            {result.stateLabel}
          </h2>
          <div className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border',
            getStateLabelBg(result.stateLabel)
          )}>
            <span className={getProtocolColor(result.protocolCategory)}>Protocol:</span>
            <span className={cn('font-semibold', getProtocolColor(result.protocolCategory))}>
              {result.protocolCategory}
            </span>
          </div>
        </div>
      </Card>

      {/* Interpretation */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-accent/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-nova-accent" />
          </div>
          <div>
            <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">State reading</p>
            <p className="text-sm text-nova-text leading-relaxed">{result.stateInterpretation}</p>
          </div>
        </div>
      </Card>

      {/* Pattern */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-teal/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-nova-teal" />
          </div>
          <div>
            <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">Likely pattern</p>
            <p className="text-sm text-nova-text leading-relaxed">{result.likelyPattern}</p>
          </div>
        </div>
      </Card>

      {/* Today's focus */}
      <div className="nova-card p-4 border-l-2 border-nova-accent">
        <p className="text-xs text-nova-muted uppercase tracking-wider mb-1">Today's focus</p>
        <p className="text-base font-semibold text-nova-text-bright">{result.todaysFocus}</p>
      </div>

      {/* Recommended actions */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-nova-success" />
          <p className="text-xs text-nova-muted uppercase tracking-wider">Recommended</p>
        </div>
        <div className="space-y-2.5">
          {result.recommendedActions.map((action, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-nova-success/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-nova-success">{i + 1}</span>
              </div>
              <p className="text-sm text-nova-text leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* What to avoid */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-warning/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-nova-warning" />
          </div>
          <div>
            <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">Avoid today</p>
            <p className="text-sm text-nova-text leading-relaxed">{result.whatToAvoid}</p>
          </div>
        </div>
      </Card>

      {/* Reframe */}
      <Card className="bg-gradient-to-br from-nova-accent/5 to-nova-teal/5 border-nova-accent/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-accent/15 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-nova-accent" />
          </div>
          <div>
            <p className="text-xs text-nova-muted uppercase tracking-wider mb-2">Reframe</p>
            <p className="text-sm text-nova-text leading-relaxed italic">
              "{result.encouragingReframe}"
            </p>
          </div>
        </div>
      </Card>

      {/* Quick scores */}
      <Card>
        <p className="text-xs text-nova-muted uppercase tracking-wider mb-3">Today's signals</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sleep', value: checkIn.sleepQuality },
            { label: 'Energy', value: checkIn.morningEnergy },
            { label: 'Clarity', value: checkIn.mentalClarity },
            { label: 'Stress', value: checkIn.stressPressure, invert: true },
            { label: 'Tension', value: checkIn.bodyTension, invert: true },
          ].map(({ label, value, invert }) => {
            const displayValue = invert ? 11 - value : value
            const color =
              displayValue >= 8
                ? 'text-nova-success'
                : displayValue >= 6
                ? 'text-nova-warning'
                : displayValue >= 4
                ? 'text-orange-400'
                : 'text-nova-danger'
            return (
              <div key={label} className="text-center">
                <div className={cn('text-xl font-bold', color)}>{value}</div>
                <div className="text-[10px] text-nova-dim mt-0.5">{label}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
