import { cn } from '../../lib/cn'

export function ProgressBar({
  percent,
  striped,
  gradient,
  fillClassName,
  className,
}: {
  percent: number
  striped?: boolean
  gradient?: boolean
  fillClassName?: string
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, percent))
  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-raised',
        striped &&
          'bg-[repeating-linear-gradient(90deg,transparent_0_6px,#14171455_6px_7px)]',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full',
          gradient ? 'bg-gradient-to-r from-green-deep to-green' : fillClassName ?? 'bg-green',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
