import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  glow?: boolean
}

export function Card({ children, className, onClick, glow }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'nova-card p-5',
        glow && 'shadow-nova-accent ring-1 ring-nova-accent/20',
        onClick && 'cursor-pointer hover:border-nova-accent/30 hover:shadow-nova-accent transition-all',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-base font-semibold text-nova-text-bright', className)}>{children}</h3>
  )
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-nova-muted mt-1', className)}>{children}</p>
}
