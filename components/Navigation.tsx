'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ScanLine, Zap, MessageSquare, Clock } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scanner', label: 'Scanner', icon: ScanLine },
  { href: '/emergency', label: 'Emergency', icon: Zap },
  { href: '/coach', label: 'Coach', icon: MessageSquare },
  { href: '/history', label: 'History', icon: Clock },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-nova-surface/90 backdrop-blur-xl border-t border-nova-border">
      <div className="max-w-lg mx-auto px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            const isEmergency = href === '/emergency'

            if (isEmergency) {
              return (
                <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1 -mt-2">
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br from-red-600 to-red-500 shadow-lg',
                    isActive && 'ring-2 ring-red-400/50'
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-nova-muted">{label}</span>
                </Link>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200',
                  isActive ? 'text-nova-accent' : 'text-nova-dim hover:text-nova-muted'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export function TopBar({
  title, subtitle, rightAction, showBack = false,
}: {
  title: string; subtitle?: string; rightAction?: React.ReactNode; showBack?: boolean
}) {
  return (
    <header className="sticky top-0 z-40 bg-nova-bg/70 backdrop-blur-xl border-b border-nova-border/50">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link href="/dashboard" className="w-8 h-8 rounded-lg bg-nova-surface border border-nova-border flex items-center justify-center text-nova-muted hover:text-nova-text transition-colors text-sm">
              ←
            </Link>
          )}
          <div>
            <h1 className="text-base font-semibold text-nova-text-bright leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-nova-dim mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}

// ── NOVA arc-of-dots logo (matches brand identity) ───────────────────────────
export function NovaLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dim = { sm: 28, md: 36, lg: 48, xl: 72 }[size]
  const cx = dim / 2
  const cy = dim * 0.62
  const r = dim * 0.36
  const dotCount = 9

  const dots = Array.from({ length: dotCount }, (_, i) => {
    // Arc from left to right (π to 0), so dots form a rising arc
    const angle = Math.PI - (i / (dotCount - 1)) * Math.PI
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    // Center dot largest, taper to edges
    const distFromCenter = Math.abs(i - (dotCount - 1) / 2)
    const dotR = dim * (0.065 - distFromCenter * 0.005)
    return { x, y, r: Math.max(dotR, dim * 0.03) }
  })

  return (
    <svg
      width={dim}
      height={dim}
      viewBox={`0 0 ${dim} ${dim}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Subtle glow behind arc */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={r * 1.1}
        ry={r * 0.5}
        fill="url(#nova-glow)"
        opacity="0.35"
      />
      <defs>
        <radialGradient id="nova-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8fffe6" />
          <stop offset="100%" stopColor="#7b4fe9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Arc dots — mint to purple gradient */}
      {dots.map((dot, i) => {
        // Gradient: center dots mint, edge dots purple
        const t = Math.abs(i - (dotCount - 1) / 2) / ((dotCount - 1) / 2)
        // Blend between #8fffe6 (mint) and #a78bfa (soft purple)
        return (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill={t < 0.4 ? '#8fffe6' : t < 0.7 ? '#b8f5e8' : '#a78bfa'}
            opacity={1 - t * 0.2}
          />
        )
      })}
    </svg>
  )
}
