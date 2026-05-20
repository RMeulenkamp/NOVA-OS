'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { clearAllData } from '@/lib/storage'
import { TopBar, BottomNav } from '@/components/Navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { PreferredTone, PrimaryGoal } from '@/lib/types'
import { CheckCircle, Circle } from 'lucide-react'

const goalLabels: Record<string, string> = {
  stable_energy: 'Stable energy',
  better_focus: 'Better focus',
  less_overwhelm: 'Less overwhelm',
  fewer_crashes: 'Fewer crashes',
  better_sleep: 'Better sleep',
  emotional_regulation: 'Emotional regulation',
  reduce_cravings: 'Reduce cravings',
  sustainable_performance: 'Sustainable performance',
}

const toneLabels: Record<PreferredTone, string> = {
  direct: 'Direct & practical',
  warm: 'Warm & encouraging',
  scientific: 'Scientific',
  minimal: 'Minimal',
}

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!user) return null

  function handleLogout() {
    logout()
    router.replace('/welcome')
  }

  function handleDeleteAll() {
    clearAllData()
    logout()
    router.replace('/welcome')
  }

  return (
    <div className="min-h-screen pb-24">
      <TopBar title="Settings" showBack />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Profile */}
        <Card>
          <p className="nova-label">Profile</p>
          <div className="space-y-1">
            <p className="text-base font-semibold text-nova-text-bright">{user.name}</p>
            <p className="text-sm text-nova-muted">{user.email}</p>
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <p className="nova-label">Your setup</p>
          <div className="space-y-3">
            {user.primaryGoal && (
              <div className="flex justify-between">
                <span className="text-sm text-nova-muted">Main goal</span>
                <span className="text-sm text-nova-text-bright">{goalLabels[user.primaryGoal]}</span>
              </div>
            )}
            {user.preferredTone && (
              <div className="flex justify-between">
                <span className="text-sm text-nova-muted">Support tone</span>
                <span className="text-sm text-nova-text-bright">{toneLabels[user.preferredTone]}</span>
              </div>
            )}
            {user.caffeineLevel && (
              <div className="flex justify-between">
                <span className="text-sm text-nova-muted">Caffeine level</span>
                <span className="text-sm text-nova-text-bright capitalize">{user.caffeineLevel}</span>
              </div>
            )}
            {user.desiredFeeling && (
              <div className="pt-2 border-t border-nova-border/50">
                <p className="text-xs text-nova-dim uppercase tracking-wider mb-1.5">Your anchor</p>
                <p className="text-sm text-nova-muted italic">{user.desiredFeeling}</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-nova-border/50">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/onboarding')}
              className="w-full"
            >
              Update preferences
            </Button>
          </div>
        </Card>

        {/* NOVA Program status */}
        <Card>
          <p className="nova-label">NOVA Program journey</p>
          <p className="text-xs text-nova-muted mb-4 leading-relaxed">
            Tell NOVA where you are in the program so it can personalise its support and suggestions.
          </p>
          <div className="space-y-3">

            {/* Masterclass */}
            <button
              onClick={() => updateUser({ masterclassCompleted: !user.masterclassCompleted })}
              className="w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-nova-border/50 hover:border-nova-accent/40 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-nova-text-bright">Attended the free Masterclass</p>
                <p className="text-xs text-nova-dim mt-0.5">Abundant Energy Masterclass</p>
              </div>
              {user.masterclassCompleted
                ? <CheckCircle className="w-5 h-5 text-nova-success flex-shrink-0" />
                : <Circle className="w-5 h-5 text-nova-dim flex-shrink-0" />}
            </button>

            {/* Currently in program */}
            <button
              onClick={() => updateUser({
                inProgram: !user.inProgram,
                // Auto-clear week if toggling off
                programWeek: !user.inProgram ? (user.programWeek || 1) : undefined,
              })}
              className="w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-nova-border/50 hover:border-nova-accent/40 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-nova-text-bright">Currently in the Energy Reset</p>
                <p className="text-xs text-nova-dim mt-0.5">7-week Abundant Energy Reset program</p>
              </div>
              {user.inProgram
                ? <CheckCircle className="w-5 h-5 text-nova-accent flex-shrink-0" />
                : <Circle className="w-5 h-5 text-nova-dim flex-shrink-0" />}
            </button>

            {/* Program week selector (only when in program) */}
            {user.inProgram && (
              <div className="pl-3 pt-1">
                <p className="text-xs text-nova-muted mb-2">Which week are you on?</p>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map(week => (
                    <button
                      key={week}
                      onClick={() => updateUser({ programWeek: week })}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-semibold transition-all',
                        user.programWeek === week
                          ? 'bg-nova-accent text-white'
                          : 'bg-nova-surface border border-nova-border text-nova-muted hover:border-nova-accent/40'
                      )}
                    >
                      {week}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Completed the program */}
            <button
              onClick={() => updateUser({ energyResetCompleted: !user.energyResetCompleted })}
              className="w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-nova-border/50 hover:border-nova-accent/40 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-medium text-nova-text-bright">Completed the Energy Reset</p>
                <p className="text-xs text-nova-dim mt-0.5">Finished the full 7-week program</p>
              </div>
              {user.energyResetCompleted
                ? <CheckCircle className="w-5 h-5 text-nova-success flex-shrink-0" />
                : <Circle className="w-5 h-5 text-nova-dim flex-shrink-0" />}
            </button>

          </div>
        </Card>

        {/* About */}
        <Card>
          <p className="nova-label">About NOVA OS</p>
          <p className="text-xs text-nova-muted leading-relaxed">
            NOVA OS provides educational and behavioral support for energy, focus, stress awareness,
            and nervous system regulation. It is not medical advice and does not diagnose, treat, or
            cure medical conditions.
          </p>
          <p className="text-xs text-nova-dim mt-3 leading-relaxed">
            If you have persistent fatigue, severe anxiety, depression, eating disorder symptoms, or
            other health concerns, please consult a qualified healthcare professional.
          </p>
        </Card>

        {/* Data */}
        <Card>
          <p className="nova-label">Your data</p>
          <p className="text-xs text-nova-muted mb-4 leading-relaxed">
            All data is stored locally on your device. Nothing is sent to external servers except
            AI requests (which are not stored by Anthropic).
          </p>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" onClick={handleLogout}>
              Sign out
            </Button>
            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                className="w-full"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete all data
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-nova-danger text-center">
                  This deletes everything. It cannot be undone.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDeleteAll}>
                    Delete all
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <p className="text-xs text-nova-dim text-center">NOVA OS · MVP v0.1</p>
      </div>

      <BottomNav />
    </div>
  )
}
