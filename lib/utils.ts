import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StateLabel, ProtocolCategory } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── State label colors ───────────────────────────────────────────────────────

export function getStateLabelColor(label?: StateLabel): string {
  if (!label) return 'text-nova-muted'
  const map: Record<StateLabel, string> = {
    'Stable Energy': 'text-nova-success',
    'Calm Focus': 'text-nova-success',
    'Battery Saving Mode': 'text-nova-warning',
    'Overstimulated': 'text-nova-warning',
    'Tired but Wired': 'text-nova-warning',
    'Recovery Needed': 'text-nova-accent',
    'Freeze / Shutdown': 'text-nova-muted',
    'Blood Sugar Instability': 'text-nova-warning',
    'Emotional Overload': 'text-nova-danger',
    'Low Capacity Day': 'text-nova-muted',
    'Regulation Before Output': 'text-nova-mint',
  }
  return map[label] || 'text-nova-muted'
}

export function getStateLabelBg(label?: StateLabel): string {
  if (!label) return 'bg-nova-border/30'
  const map: Record<StateLabel, string> = {
    'Stable Energy': 'bg-nova-success/10 border-nova-success/25',
    'Calm Focus': 'bg-nova-success/10 border-nova-success/25',
    'Battery Saving Mode': 'bg-nova-warning/10 border-nova-warning/25',
    'Overstimulated': 'bg-nova-warning/10 border-nova-warning/25',
    'Tired but Wired': 'bg-nova-warning/10 border-nova-warning/25',
    'Recovery Needed': 'bg-nova-accent/10 border-nova-accent/25',
    'Freeze / Shutdown': 'bg-nova-dim/10 border-nova-dim/20',
    'Blood Sugar Instability': 'bg-nova-warning/10 border-nova-warning/25',
    'Emotional Overload': 'bg-nova-danger/10 border-nova-danger/25',
    'Low Capacity Day': 'bg-nova-dim/10 border-nova-dim/20',
    'Regulation Before Output': 'bg-nova-mint/5 border-nova-mint/20',
  }
  return map[label] || 'bg-nova-border/30'
}

export function getProtocolColor(category?: ProtocolCategory): string {
  if (!category) return 'text-nova-muted'
  const map: Record<ProtocolCategory, string> = {
    Stabilize: 'text-nova-mint',
    Activate: 'text-nova-success',
    Recover: 'text-nova-accent',
    Focus: 'text-nova-accent-bright',
    Regulate: 'text-nova-warning',
    Simplify: 'text-nova-muted',
    Nourish: 'text-nova-success',
    'Sleep Support': 'text-indigo-400',
  }
  return map[category] || 'text-nova-muted'
}

// ─── Format ───────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelative(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(iso)
}

// ─── Score color ──────────────────────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-nova-success'
  if (score >= 6) return 'text-nova-warning'
  if (score >= 4) return 'text-orange-400'
  return 'text-nova-danger'
}

export function getScoreLabel(score: number): string {
  if (score >= 8) return 'Strong'
  if (score >= 6) return 'Moderate'
  if (score >= 4) return 'Low'
  return 'Very Low'
}

// ─── Average calculation ──────────────────────────────────────────────────────

export function getAverages(checkIns: import('./types').DailyCheckIn[]) {
  if (!checkIns.length) return null
  const avg = (arr: number[]) => Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 10) / 10
  return {
    sleepQuality: avg(checkIns.map(c => c.sleepQuality)),
    morningEnergy: avg(checkIns.map(c => c.morningEnergy)),
    mentalClarity: avg(checkIns.map(c => c.mentalClarity)),
    stressPressure: avg(checkIns.map(c => c.stressPressure)),
    bodyTension: avg(checkIns.map(c => c.bodyTension)),
    count: checkIns.length,
  }
}

export function filterByDays(checkIns: import('./types').DailyCheckIn[], days: number) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return checkIns.filter(c => new Date(c.createdAt) >= cutoff)
}
