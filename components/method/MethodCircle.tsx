'use client'

import { STEPS } from '@/lib/method'
import type { MethodStep } from '@/lib/types'

const CX = 145
const CY = 108
const R = 72

interface MethodCircleProps {
  current?: MethodStep | null
  visited?: MethodStep[]
  onSelect?: (step: MethodStep) => void
  large?: boolean
}

// The five functions as a circle, not a staircase. Tap any step to enter there.
export function MethodCircle({ current = null, visited = [], onSelect, large = false }: MethodCircleProps) {
  const nodes = STEPS.map((s, i) => {
    const deg = -90 + i * 72
    const a = (deg * Math.PI) / 180
    return { ...s, i, x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) }
  })

  const arrows = STEPS.map((_, i) => {
    const deg = -90 + i * 72 + 36
    const a = (deg * Math.PI) / 180
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), rot: deg + 90 }
  })

  function labelPos(i: number, x: number, y: number): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
    if (i === 0) return { x, y: y - 24, anchor: 'middle' }
    if (i === 1 || i === 2) return { x: x + 24, y: y + 4, anchor: 'start' }
    return { x: x - 24, y: y + 4, anchor: 'end' }
  }

  return (
    <svg
      viewBox="0 0 290 200"
      role="img"
      aria-label="The NOVA cycle: Reset, Realize, Regulate, Release, Rewire, and back to Reset"
      className="mx-auto block"
      style={{ width: large ? 320 : 240, maxWidth: '100%' }}
    >
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#2a2a5e" strokeWidth="1.5" strokeDasharray="3 5" />

      {arrows.map((p, i) => (
        <polygon
          key={i}
          points="-4,-4 5,0 -4,4"
          fill="#8fffe6"
          opacity="0.55"
          transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`}
        />
      ))}

      <text x={CX} y={CY + 4} textAnchor="middle" fontSize="11" letterSpacing="3" fill="#8fffe6" opacity="0.7">
        NOVA
      </text>

      {nodes.map((n) => {
        const isCurrent = n.id === current
        const isVisited = visited.includes(n.id)
        const lp = labelPos(n.i, n.x, n.y)
        return (
          <g
            key={n.id}
            onClick={() => onSelect?.(n.id)}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={17}
              fill={isCurrent ? '#7b4fe9' : isVisited ? 'rgba(143,255,230,0.16)' : '#0e0e38'}
              stroke={isCurrent || isVisited ? '#8fffe6' : '#2a2a5e'}
              strokeWidth={isCurrent ? 2 : 1.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill={isCurrent ? '#ffffff' : isVisited ? '#8fffe6' : '#8a8ab0'}
            >
              {n.i + 1}
            </text>
            <text
              x={lp.x}
              y={lp.y}
              textAnchor={lp.anchor}
              fontSize="12"
              fill={isCurrent ? '#8fffe6' : '#b8b8d8'}
              fontWeight={isCurrent ? 600 : 400}
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
