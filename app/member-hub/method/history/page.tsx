'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getMethodCheckIns, pullMethodCheckInsFromSupabase } from '@/lib/storage'
import { computeMethodStats, buildSummary, labelOf, METHOD_NAME, METHOD_PATH } from '@/lib/method'
import { practiceName } from '@/lib/practices'
import { cn } from '@/lib/utils'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import type { MethodCheckIn } from '@/lib/types'

type Metric = 'energy' | 'tension'

function fmtShift(n: number | null): string {
  if (n == null) return '–'
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return `${sign}${Math.abs(n).toFixed(1)}`
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function pick(c: MethodCheckIn, metric: Metric, which: 'before' | 'after'): number | undefined {
  if (metric === 'energy') return which === 'before' ? c.energyBefore : c.energyAfter
  return which === 'before' ? c.tensionBefore : c.tensionAfter
}

// Each check-in is a short line from "before" (hollow dot) to "after" (filled dot).
function ShiftChart({ items, metric }: { items: MethodCheckIn[]; metric: Metric }) {
  const points = items
    .filter((c) => pick(c, metric, 'before') != null && pick(c, metric, 'after') != null)
    .slice(-14)

  if (points.length === 0) {
    return (
      <p className="text-xs text-nova-dim text-center py-8">
        Complete a few check-ins with before and after scores to see your shifts here.
      </p>
    )
  }

  const W = 320
  const H = 160
  const left = 26
  const right = 10
  const top = 12
  const bottom = 24
  const innerW = W - left - right
  const innerH = H - top - bottom
  const y = (v: number) => top + ((10 - v) / 9) * innerH
  const x = (i: number) => (points.length === 1 ? left + innerW / 2 : left + (i * innerW) / (points.length - 1))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${metric} before and after each check-in`}>
      {[1, 5, 10].map((v) => (
        <g key={v}>
          <line x1={left} x2={W - right} y1={y(v)} y2={y(v)} stroke="#2a2a5e" strokeWidth="1" strokeDasharray="2 4" />
          <text x={left - 6} y={y(v) + 3} textAnchor="end" fontSize="9" fill="#8a8ab0">
            {v}
          </text>
        </g>
      ))}

      {points.map((c, i) => {
        const b = pick(c, metric, 'before') ?? 0
        const a = pick(c, metric, 'after') ?? 0
        const improved = metric === 'energy' ? a > b : a < b
        const same = a === b
        const color = same ? '#8a8ab0' : improved ? '#34d399' : '#fbbf24'
        return (
          <g key={c.id}>
            <line x1={x(i)} x2={x(i)} y1={y(b)} y2={y(a)} stroke={color} strokeWidth="2" opacity="0.6" />
            <circle cx={x(i)} cy={y(b)} r="3.5" fill="#080827" stroke={color} strokeWidth="1.5" />
            <circle cx={x(i)} cy={y(a)} r="4" fill={color} />
          </g>
        )
      })}

      <text x={left} y={H - 6} fontSize="9" fill="#8a8ab0">
        {shortDate(points[0].createdAt)}
      </text>
      {points.length > 1 && (
        <text x={W - right} y={H - 6} fontSize="9" fill="#8a8ab0" textAnchor="end">
          {shortDate(points[points.length - 1].createdAt)}
        </text>
      )}
    </svg>
  )
}

export default function MethodHistoryPage() {
  const { user } = useAuth()
  const [list, setList] = useState<MethodCheckIn[]>([])
  const [metric, setMetric] = useState<Metric>('energy')

  useEffect(() => {
    if (!user) return
    const mine = () => getMethodCheckIns().filter((c) => c.userId === user.id)
    setList(mine())
    pullMethodCheckInsFromSupabase(user.id).then(() => setList(mine()))
  }, [user])

  const stats = useMemo(() => computeMethodStats(list), [list])
  const ascending = useMemo(
    () => [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [list]
  )

  const bestPractice = stats.practiceStats
    .filter((p) => p.uses >= 2 && p.avgTensionShift != null)
    .sort((a, b) => (a.avgTensionShift ?? 0) - (b.avgTensionShift ?? 0))[0]

  return (
    <div className="min-h-screen pb-28">
      <TopBar title="Your progress" subtitle={METHOD_NAME} showBack backHref={METHOD_PATH} />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {list.length === 0 ? (
          <Card className="text-center space-y-3">
            <Compass className="w-6 h-6 text-nova-accent mx-auto" />
            <p className="text-sm text-nova-muted">
              No check-ins yet. After your first one, your shifts and patterns show up here.
            </p>
            <Link href={METHOD_PATH} className="text-sm text-nova-accent hover:underline">
              Start your first {METHOD_NAME}
            </Link>
          </Card>
        ) : (
          <>
            {/* Headline numbers */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <div className="text-2xl font-bold text-nova-text-bright">{stats.total}</div>
                <div className="text-[10px] text-nova-dim mt-0.5">check-ins</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold text-emerald-300">{fmtShift(stats.avgEnergyShift)}</div>
                <div className="text-[10px] text-nova-dim mt-0.5">avg energy shift</div>
              </Card>
              <Card className="text-center">
                <div className="text-2xl font-bold text-emerald-300">{fmtShift(stats.avgTensionShift)}</div>
                <div className="text-[10px] text-nova-dim mt-0.5">avg contraction shift</div>
              </Card>
            </div>

            {/* Shift chart */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-nova-text-bright">Your shifts</p>
                <div className="flex gap-1 p-1 bg-nova-surface rounded-lg border border-nova-border">
                  {(['energy', 'tension'] as Metric[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetric(m)}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-medium capitalize transition-all',
                        metric === m ? 'bg-nova-accent text-white' : 'text-nova-muted'
                      )}
                    >
                      {m === 'tension' ? 'contraction' : m}
                    </button>
                  ))}
                </div>
              </div>
              <ShiftChart items={ascending} metric={metric} />
              <p className="text-[10px] text-nova-dim">
                Hollow dot = before. Filled dot = after.{' '}
                {metric === 'energy' ? 'Higher is better.' : 'Lower is better.'}
              </p>
            </Card>

            {/* Patterns */}
            <Card className="space-y-4">
              <p className="text-sm font-semibold text-nova-text-bright">What keeps showing up</p>

              {stats.topDrains.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-nova-dim mb-2">Biggest energy drains</p>
                  <div className="space-y-1.5">
                    {stats.topDrains.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-sm">
                        <span className="text-nova-text">{labelOf(d.id)}</span>
                        <span className="text-xs text-nova-dim">{d.count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.topEmotions.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-nova-dim mb-2">Most common feelings</p>
                  <div className="space-y-1.5">
                    {stats.topEmotions.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-sm">
                        <span className="text-nova-text">{labelOf(d.id)}</span>
                        <span className="text-xs text-nova-dim">{d.count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.topDrains.length === 0 && stats.topEmotions.length === 0 && (
                <p className="text-xs text-nova-dim">Patterns appear once you have a few check-ins.</p>
              )}
            </Card>

            {/* Tools */}
            {stats.practiceStats.length > 0 && (
              <Card className="space-y-3">
                <p className="text-sm font-semibold text-nova-text-bright">Your tools</p>
                {bestPractice && (
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    {practiceName(bestPractice.slug)} helps you expand the most so far (contraction {fmtShift(bestPractice.avgTensionShift)} on average).
                  </p>
                )}
                <div className="space-y-2">
                  {stats.practiceStats.map((p) => (
                    <div key={p.slug} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-nova-text">{practiceName(p.slug)}</span>
                      <span className="text-xs text-nova-dim text-right">
                        {p.uses}× · energy {fmtShift(p.avgEnergyShift)} · contraction {fmtShift(p.avgTensionShift)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-nova-text-bright">Recent check-ins</p>
              {list.slice(0, 8).map((c) => {
                const s = buildSummary(c)
                return (
                  <Card key={c.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-nova-dim">{shortDate(c.createdAt)}</span>
                      <span className="text-xs text-nova-muted">
                        {c.mode === 'quick' ? 'Quick Compass' : ''}
                        {c.energyBefore != null && c.energyAfter != null ? `Energy ${c.energyBefore}→${c.energyAfter}` : ''}
                        {c.tensionBefore != null && c.tensionAfter != null
                          ? ` · Contraction ${c.tensionBefore}→${c.tensionAfter}`
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-nova-text">{c.situation?.trim() || s.noticed}</p>
                    <p className="text-xs text-nova-dim">{s.chose}</p>
                  </Card>
                )
              })}
            </div>

            <Link
              href={METHOD_PATH}
              className="block text-center text-sm text-nova-accent hover:underline pt-1"
            >
              Start another {METHOD_NAME}
            </Link>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
