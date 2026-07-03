import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { LiveDot } from '../components/ui/LiveDot'
import { StatCell } from '../components/ui/StatCell'
import { useAirdropFeed, AIRDROPS_PAGE_SIZE, type AirdropFeedRow } from '../hooks/useAirdropFeed'
import { useMarket } from '../providers/MarketProvider'
import { ANSEM_MINT } from '../lib/ansem'
import { formatUsd, formatNumber, formatTimeAgo, shortenAddress } from '../lib/format'
import { cn } from '../lib/cn'

const mintFilters = [
  { key: null, label: 'all' },
  { key: ANSEM_MINT, label: 'ansem' },
  { key: 'SOL', label: 'sol' },
] as const

export default function Airdrops() {
  const [page, setPage] = useState(0)
  const [mintFilter, setMintFilter] = useState<string | null>(null)
  const { rows, stats, totalCount } = useAirdropFeed(page, mintFilter)
  const totalPages = Math.max(1, Math.ceil(totalCount / AIRDROPS_PAGE_SIZE))
  const market = useMarket()

  function changeFilter(key: string | null) {
    setMintFilter(key)
    setPage(0)
  }

  // Force a re-render periodically so "Xs/m/h ago" labels stay fresh even
  // when no new airdrop has arrived to trigger one naturally.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000)
    return () => clearInterval(id)
  }, [])

  // Stats are stored per-mint (raw token amounts can't be summed together
  // meaningfully) and combined into USD here using live prices.
  const sentTodayUsd = stats.sentTodayAnsem * market.ansemPrice + stats.sentTodaySol * market.solPrice
  const avgDropUsd = stats.eventsToday > 0 ? sentTodayUsd / stats.eventsToday : 0

  // Rolling window, not a fixed date — recomputed on every render so it
  // always reads "since <7 days ago>" relative to now.
  const sevenDaysAgoLabel = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="disp text-2xl uppercase text-ink-primary">live airdrops</h1>
        <span className="flex items-center gap-1.5 text-xs text-red">
          <LiveDot color="red" /> ansem is sending
        </span>
      </div>

      <div className="flex gap-2">
        {mintFilters.map((f) => (
          <button
            key={f.label}
            onClick={() => changeFilter(f.key)}
            className={cn(
              'rounded-pill border px-3 py-1 text-xs',
              mintFilter === f.key
                ? 'border-line-accent bg-raised text-green'
                : 'border-line text-ink-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-[#0d130d] to-panel">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">ansem airdropped since {sevenDaysAgoLabel}</div>
        <div className="disp tnum mt-1 text-3xl text-green">{formatNumber(stats.sent7dAnsem)}</div>
        <div className="tnum mt-0.5 text-xs text-ink-muted">
          {formatUsd(stats.sent7dAnsem * market.ansemPrice)} · to {formatNumber(stats.recipients7d)} wallets
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-cell bg-line">
        <StatCell label="sent today" value={formatUsd(sentTodayUsd, true)} />
        <StatCell label="recipients" value={formatNumber(stats.recipients)} />
        <StatCell label="avg drop" value={formatUsd(avgDropUsd, true)} />
      </div>

      <Card className="p-0">
        {rows.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">
            no {mintFilter === ANSEM_MINT ? 'ansem ' : mintFilter === 'SOL' ? 'sol ' : ''}airdrops yet
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <Row
                key={`${row.wallet}-${row.mint}-${row.createdAt}`}
                row={row}
                price={row.mint === ANSEM_MINT ? market.ansemPrice : market.solPrice}
              />
            ))}
          </ul>
        )}
      </Card>

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="rounded-pill border border-line px-3 py-1.5 text-xs text-ink-secondary disabled:opacity-30"
      >
        ← prev
      </button>
      <span className="tnum text-xs text-ink-muted">page {page + 1} of {totalPages}</span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page + 1 >= totalPages}
        className="rounded-pill border border-line px-3 py-1.5 text-xs text-ink-secondary disabled:opacity-30"
      >
        next →
      </button>
    </div>
  )
}

function Row({ row, price }: { row: AirdropFeedRow; price: number }) {
  const symbol = row.mint === ANSEM_MINT ? 'ANSEM' : 'SOL'
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <a
        href={`https://solscan.io/tx/${row.txSignature}`}
        target="_blank"
        rel="noreferrer"
        title="view on solscan"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-cell border border-line bg-raised text-green hover:border-green"
      >
        ↓
      </a>

      <div className="min-w-0 flex-1">
        <a
          href={`https://solscan.io/tx/${row.txSignature}`}
          target="_blank"
          rel="noreferrer"
          className="tnum truncate text-sm text-ink-primary hover:text-cyan hover:underline"
        >
          {shortenAddress(row.wallet)}
        </a>
        <div className="tnum mt-0.5 text-[11px] text-ink-muted">{formatTimeAgo(row.createdAt)}</div>
      </div>

      <div className="text-right">
        <div className="disp tnum text-sm text-green">
          +{symbol === 'SOL' ? row.amount.toFixed(4) : formatNumber(row.amount)} {symbol}
        </div>
        <div className="tnum text-xs text-ink-muted">{formatUsd(row.amount * price)}</div>
      </div>
    </li>
  )
}
