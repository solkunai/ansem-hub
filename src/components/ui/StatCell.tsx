import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function StatCell({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className={cn('disp tnum mt-1 text-xl text-ink-primary', valueClassName)}>{value}</div>
    </div>
  )
}
