import { Card } from '../components/ui/Card'
import { mockLeaderboard, type LeaderboardRow } from '../lib/mock'
import { formatNumber, formatCompact, formatPercent } from '../lib/format'
import { cn } from '../lib/cn'

const filters = ['balance', 'diamond hands', '24h gainers']

export default function Leaderboard() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="disp text-2xl text-ink-primary">top holders</h1>
        <span className="tnum text-xs text-ink-muted">{formatNumber(mockLeaderboard.length)} of 100</span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {filters.map((f, i) => (
          <span
            key={f}
            className={cn(
              'shrink-0 rounded-pill border px-3 py-1 text-xs',
              i === 0
                ? 'border-line-accent bg-raised text-green'
                : 'border-line text-ink-muted',
            )}
          >
            {f}
          </span>
        ))}
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-line">
          {mockLeaderboard.map((row) => (
            <Row key={row.rank} row={row} />
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Row({ row }: { row: LeaderboardRow }) {
  return (
    <li
      className={cn(
        'grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3',
        row.isYou && 'border-l-2 border-l-green bg-[#0c130c]',
      )}
    >
      <span
        className={cn(
          'disp tnum text-lg',
          row.rank <= 3 ? 'text-green' : 'text-ink-muted',
        )}
      >
        {row.rank}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="tnum truncate text-sm text-ink-primary">{row.wallet}</span>
          {row.isYou && (
            <span className="rounded-pill border border-green/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-green">
              you
            </span>
          )}
        </div>
        <div className="tnum mt-0.5 text-[11px] text-ink-muted">
          ◆ {row.daysHeld}d held · drops {formatCompact(row.dropsReceived)}
        </div>
      </div>

      <div className="text-right">
        <div className="disp tnum text-sm text-ink-primary">{formatCompact(row.balance)}</div>
        <div className={cn('tnum text-xs', row.change24h >= 0 ? 'text-green' : 'text-red')}>
          {formatPercent(row.change24h)}
        </div>
      </div>
    </li>
  )
}
