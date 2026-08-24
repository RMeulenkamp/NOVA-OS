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

        {/* NOVA Program status — read only, set by NOVA team */}
        <Card>
          <p className="nova-label">NOVA Program journey</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-nova-text-bright">Masterclass</p>
                <p className="text-xs text-nova-dim mt-0.5">Abundant Energy Masterclass</p>
              </div>
              {user.masterclassCompleted
                ? <CheckCircle className="w-5 h-5 text-nova-success flex-shrink-0" />
                : <Circle className="w-5 h-5 text-nova-dim flex-shrink-0" />}
            </div>
            <div className="flex items-center justify-between py-2 border-t border-nova-border/50">
              <div>
                <p className="text-sm font-medium text-nova-text-bright">Energy Reset program</p>
                <p className="text-xs text-nova-dim mt-0.5">
                  {user.inProgram ? `Active — week ${user.programWeek ?? 1} of 7` : 'Not enrolled'}
                </p>
              </div>
              {user.inProgram
                ? <CheckCircle className="w-5 h-5 text-nova-accent flex-shrink-0" />
                : <Circle className="w-5 h-5 text-nova-dim flex-shrink-0" />}
            </div>
            {!user.inProgram && (
              <a
                href="https://www.nova-method.com/clarity-call"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-xs text-nova-accent hover:underline pt-1"
              >
                Join the program → Schedule a Clarity Call
              </a>
            )}
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
            Your check-ins, patterns, and profile are stored on your device and securely synced
            to NOVA's database so your data is safe if you switch devices. AI requests are
            processed by Anthropic and not stored.
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
