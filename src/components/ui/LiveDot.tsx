import { cn } from '../../lib/cn'

export function LiveDot({ color = 'red' }: { color?: 'red' | 'green' }) {
  return (
    <span
      className={cn(
        'inline-block h-1.5 w-1.5 rounded-full animate-blink',
        color === 'red' ? 'bg-red' : 'bg-green',
      )}
    />
  )
}
