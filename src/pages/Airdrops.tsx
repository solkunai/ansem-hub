import { Card } from '../components/ui/Card'
import { LiveDot } from '../components/ui/LiveDot'
import { StatCell } from '../components/ui/StatCell'
import { mockFeed, type FeedRow } from '../lib/mock'
import { formatCompact, formatUsd, formatNumber } from '../lib/format'

export default function Airdrops() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="disp text-2xl text-ink-primary">live airdrop feed</h1>
        <span className="flex items-center gap-1.5 text-xs text-red">
          <LiveDot color="red" /> ansem is sending
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-cell bg-line">
        <StatCell label="sent today" value={formatCompact(mockFeed.sentToday)} />
        <StatCell label="recipients" value={formatNumber(mockFeed.recipients)} />
        <StatCell label="avg drop" value={formatUsd(mockFeed.avgDrop, true)} />
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-line">
          {mockFeed.rows.map((row, i) => (
            <Row key={i} row={row} />
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Row({ row }: { row: FeedRow }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-cell border border-line bg-raised text-green">
        ↓
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="tnum truncate text-sm text-ink-primary">{row.wallet}</span>
          {row.handle && (
            <a
              href={`https://x.com/${row.handle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs text-cyan hover:underline"
            >
              {row.handle} ↗
            </a>
          )}
        </div>
        <div className="tnum mt-0.5 text-[11px] text-ink-muted">{row.timeAgo}</div>
      </div>

      <div className="text-right">
        <div className="disp tnum text-sm text-green">+{formatNumber(row.amount)}</div>
        <div className="tnum text-xs text-ink-muted">{formatUsd(row.valueUsd)}</div>
      </div>
    </li>
  )
}
