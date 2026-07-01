import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({
  children,
  className,
  accent,
}: {
  children: ReactNode
  className?: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-card border bg-panel p-4 sm:p-5',
        accent ? 'border-line-accent' : 'border-line',
        className,
      )}
    >
      {children}
    </div>
  )
}
