'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  getTodayCheckIn, getCheckIns, getCheckInStreak, getWeeklyCheckInCount, getRecentPattern,
} from '@/lib/storage'
import { getTodayReminderMessage, requestNotificationPermission, getReminderEnabled, setReminderEnabled } from '@/lib/reminders'
import { TopBar, BottomNav, NovaLogo } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { cn, getStateLabelColor, getStateLabelBg, getProtocolColor, formatRelative } from '@/lib/utils'
import type { DailyCheckIn } from '@/lib/types'
import { ScanLine, Zap, MessageSquare, ChevronRight, Flame, TrendingUp, Bell, X } from 'lucide-react'
import { ConversionNudge } from '@/components/ConversionNudge'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null)
  const [streak, setStreak] = useState(0)
  const [weeklyCount, setWeeklyCount] = useState(0)
  const [recentPattern, setRecentPattern] = useState<string | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<DailyCheckIn[]>([])
  const [showReminder, setShowReminder] = useState(false)
  const [reminderDismissed, setReminderDismissed] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/welcome'); return }

    const checkIn = getTodayCheckIn()
    setTodayCheckIn(checkIn || null)
    setStreak(getCheckInStreak())
    setWeeklyCount(getWeeklyCheckInCount())
    setRecentPattern(getRecentPattern())
    setRecentCheckIns(getCheckIns().slice(0, 5))

    // Show reminder banner if no check-in today
    if (!checkIn) {
      setShowReminder(true)
    }
  }, [user, isLoading, router])

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermission()
    if (granted) {
      setReminderEnabled(true)
    }
  }

  if (isLoading || !user) return null

  const firstName = user.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-nova-bg/80 backdrop-blur-xl border-b border-nova-border/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NovaLogo size="sm" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-nova-teal uppercase">Nova OS</p>
              <p className="text-sm font-semibold text-nova-text-bright leading-tight">
                {greeting}, {firstName}
              </p>
            </div>
          </div>
          <Link href="/settings" className="w-8 h-8 rounded-full bg-nova-surface border border-nova-border flex items-center justify-center text-xs font-bold text-nova-accent">
            {firstName[0]?.toUpperCase()}
          </Link>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Daily reminder banner */}
        {showReminder && !reminderDismissed && !todayCheckIn && (() => {
          const msg = getTodayReminderMessage()
          return (
            <div className="nova-card border-nova-accent/30 bg-nova-accent/5 p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-nova-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-nova-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-nova-text-bright mb-0.5">{msg.title}</p>
                    <p className="text-xs text-nova-muted leading-relaxed">{msg.body}</p>
                    <Link href="/scanner" className="inline-block mt-3 text-xs font-medium text-nova-accent hover:underline">
                      Start daily scan →
                    </Link>
                  </div>
                </div>
                <button onClick={() => setReminderDismissed(true)} className="text-nova-dim hover:text-nova-muted flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })()}

        {/* Today's state */}
        {todayCheckIn?.aiRecommendations ? (
          <Card glow className={cn('block', getStateLabelBg(todayCheckIn.aiStateLabel))}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-nova-muted uppercase tracking-wider">Current state</p>
                <h2 className={cn('text-xl font-semibold', getStateLabelColor(todayCheckIn.aiStateLabel))}>
                  {todayCheckIn.aiStateLabel}
                </h2>
                <p className="text-sm text-nova-muted leading-relaxed">
                  {todayCheckIn.aiRecommendations.todaysFocus}
                </p>
              </div>
              <Link href="/scanner" className="text-nova-dim hover:text-nova-muted">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Protocol badge */}
            <div className="mt-4 pt-4 border-t border-nova-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-nova-muted">Today's protocol · </span>
                  <span className={cn('text-xs font-semibold', getProtocolColor(todayCheckIn.aiRecommendations.protocolCategory))}>
                    {todayCheckIn.aiRecommendations.protocolCategory}
                  </span>
                </div>
              </div>
              <p className="text-sm text-nova-text mt-2">
                {todayCheckIn.aiRecommendations.recommendedActions[0]}
              </p>
            </div>
          </Card>
        ) : (
          <Link href="/scanner">
            <Card className="border-nova-accent/30 hover:border-nova-accent/60 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-nova-accent/10 flex items-center justify-center flex-shrink-0">
                  <ScanLine className="w-6 h-6 text-nova-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-nova-text-bright">
                    Start your daily scan
                  </h3>
                  <p className="text-sm text-nova-muted mt-0.5">
                    2 minutes to understand your state today
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-nova-dim" />
              </div>
            </Card>
          </Link>
        )}

        {/* Emergency + Coach quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/emergency">
            <Card className="border-red-500/20 hover:border-red-500/40 cursor-pointer h-full">
              <div className="flex flex-col h-full">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center mb-3">
                  <Zap className="w-4.5 h-4.5 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-nova-text-bright">Emergency</p>
                <p className="text-xs text-nova-dim mt-0.5">Support now</p>
              </div>
            </Card>
          </Link>

          <Link href="/coach">
            <Card className="border-nova-teal/20 hover:border-nova-teal/40 cursor-pointer h-full">
              <div className="flex flex-col h-full">
                <div className="w-9 h-9 rounded-xl bg-nova-teal/15 flex items-center justify-center mb-3">
                  <MessageSquare className="w-4.5 h-4.5 text-nova-teal" />
                </div>
                <p className="text-sm font-semibold text-nova-text-bright">Coach</p>
                <p className="text-xs text-nova-dim mt-0.5">Talk it through</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-nova-warning" />
            </div>
            <div className="text-2xl font-bold text-nova-text-bright">{streak}</div>
            <div className="text-[10px] text-nova-dim mt-0.5">day streak</div>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ScanLine className="w-3.5 h-3.5 text-nova-accent" />
            </div>
            <div className="text-2xl font-bold text-nova-text-bright">{weeklyCount}</div>
            <div className="text-[10px] text-nova-dim mt-0.5">this week</div>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-nova-success" />
            </div>
            <div className="text-2xl font-bold text-nova-text-bright">
              {recentCheckIns.length}
            </div>
            <div className="text-[10px] text-nova-dim mt-0.5">total scans</div>
          </Card>
        </div>

        {/* Smart Masterclass nudge — appears when patterns warrant it */}
        <ConversionNudge />

        {/* Pattern insight */}
        {recentPattern && (
          <Card className="border-nova-teal/20">
            <p className="text-xs text-nova-teal uppercase tracking-wider mb-1.5">Pattern insight</p>
            <p className="text-sm text-nova-text leading-relaxed">{recentPattern}</p>
          </Card>
        )}

        {/* Recent check-ins */}
        {recentCheckIns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-nova-text-bright">Recent check-ins</h3>
              <Link href="/history" className="text-xs text-nova-accent hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2">
              {recentCheckIns.slice(0, 4).map((checkIn) => (
                <Card key={checkIn.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-nova-dim">{formatRelative(checkIn.createdAt)}</p>
                      {checkIn.aiStateLabel ? (
                        <p className={cn('text-sm font-medium mt-0.5', getStateLabelColor(checkIn.aiStateLabel))}>
                          {checkIn.aiStateLabel}
                        </p>
                      ) : (
                        <p className="text-sm text-nova-muted mt-0.5">No analysis</p>
                      )}
                    </div>
                    <div className="flex gap-2 text-right">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-nova-text-bright">
                          {checkIn.morningEnergy}
                        </div>
                        <div className="text-[9px] text-nova-dim">energy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-nova-text-bright">
                          {checkIn.sleepQuality}
                        </div>
                        <div className="text-[9px] text-nova-dim">sleep</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Desired feeling */}
        {user.desiredFeeling && (
          <Card className="border-nova-accent/10">
            <p className="text-xs text-nova-dim uppercase tracking-wider mb-1.5">Your anchor</p>
            <p className="text-sm text-nova-text italic leading-relaxed">
              "{user.desiredFeeling}"
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
