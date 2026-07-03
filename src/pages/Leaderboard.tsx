import { useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { useLeaderboard, type LeaderboardRow } from '../hooks/useLeaderboard'
import { useWalletTrades } from '../hooks/useWalletTrades'
import { useMarket } from '../providers/MarketProvider'
import { formatNumber, formatCompact, formatPercent, formatUsd, shortenAddress } from '../lib/format'
import { cn } from '../lib/cn'

const filters = [
  { key: 'balance', label: 'balance' },
  { key: 'diamond', label: 'diamond hands' },
  { key: 'gainers', label: '24h gainers' },
] as const

type FilterKey = (typeof filters)[number]['key']

function sortRows(rows: LeaderboardRow[], filter: FilterKey): LeaderboardRow[] {
  const sorted = [...rows]
  if (filter === 'diamond') sorted.sort((a, b) => b.daysHeld - a.daysHeld)
  else if (filter === 'gainers') sorted.sort((a, b) => b.change24h - a.change24h)
  else sorted.sort((a, b) => b.balance - a.balance)
  return sorted
}

export default function Leaderboard() {
  const { rows, loading } = useLeaderboard()
  const [filter, setFilter] = useState<FilterKey>('balance')
  const sorted = useMemo(() => sortRows(rows, filter), [rows, filter])
  const [expanded, setExpanded] = useState<string | null>(null)
  const { data, loading: tradesLoading, error, fetchTrades } = useWalletTrades()
  const market = useMarket()

  function toggle(wallet: string) {
    if (expanded === wallet) {
      setExpanded(null)
      return
    }
    setExpanded(wallet)
    void fetchTrades(wallet)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="disp text-2xl uppercase text-ink-primary">top holders</h1>
        <span className="tnum text-xs text-ink-muted">{formatNumber(rows.length)} tracked</span>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'shrink-0 rounded-pill border px-3 py-1 text-xs',
              filter === f.key
                ? 'border-line-accent bg-raised text-green'
                : 'border-line text-ink-muted',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">loading holders…</div>
        ) : sorted.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">no holder data yet</div>
        ) : (
          <ul className="divide-y divide-line">
            {sorted.map((row, i) => (
              <li key={row.wallet}>
                <Row row={row} displayRank={i + 1} onClick={() => toggle(row.wallet)} />
                {expanded === row.wallet && (
                  <TradeDetail
                    loading={tradesLoading}
                    error={error}
                    data={data}
                    solPrice={market.solPrice}
                    ansemPrice={market.ansemPrice}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Row({
  row,
  displayRank,
  onClick,
}: {
  row: LeaderboardRow
  displayRank: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'grid w-full grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3 text-left',
        row.isYou && 'border-l-2 border-l-green bg-[#0c130c]',
      )}
    >
      <span
        className={cn(
          'disp tnum text-lg',
          displayRank <= 3 ? 'text-green' : 'text-ink-muted',
        )}
      >
        {displayRank}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="tnum truncate text-sm text-ink-primary">{shortenAddress(row.wallet)}</span>
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
    </button>
  )
}

function TradeDetail({
  loading,
  error,
  data,
  solPrice,
  ansemPrice,
}: {
  loading: boolean
  error: string | null
  data: ReturnType<typeof useWalletTrades>['data']
  solPrice: number
  ansemPrice: number
}) {
  if (loading) {
    return <div className="border-t border-line bg-[#0a0d0a] px-4 py-3 text-center text-xs text-ink-muted">loading 14d trade history…</div>
  }
  if (error) {
    return <div className="border-t border-line bg-[#0a0d0a] px-4 py-3 text-center text-xs text-red">{error}</div>
  }
  if (!data) return null

  // avgCost only reflects tokens we actually saw bought in the 14d window.
  // Holdings beyond that (pre-existing, airdropped, or bought before the
  // window) have no known cost basis — treating them as "free" would wildly
  // overstate unrealized PnL, so unrealized value/cost is capped to the
  // amount we can actually attribute to a tracked buy.
  const avgCost = data.ansemBought > 0 ? data.costBasisSol / data.ansemBought : 0
  const realizedPnlSol = data.proceedsSol - avgCost * data.ansemSold
  const trackedRemaining = Math.max(0, data.ansemBought - data.ansemSold)
  const untrackedBalance = data.currentBalance - trackedRemaining
  const pnlKnown = data.ansemBought > 0
  const ansemPriceInSol = ansemPrice > 0 && solPrice > 0 ? ansemPrice / solPrice : 0

  let pnlValue = 'n/a'
  let pnlSub = 'no buys tracked in 14d window'
  let pnlClass = 'text-ink-muted'

  if (pnlKnown) {
    const unrealizedBasisAmount = Math.min(data.currentBalance, trackedRemaining)
    const unrealizedPnlSol = unrealizedBasisAmount * ansemPriceInSol - avgCost * unrealizedBasisAmount
    const totalPnlSol = realizedPnlSol + unrealizedPnlSol
    pnlValue = `${totalPnlSol >= 0 ? '+' : ''}${totalPnlSol.toFixed(3)} SOL`
    pnlSub = formatUsd(totalPnlSol * solPrice) + (untrackedBalance > 0 ? ' · excludes untracked bag' : '')
    pnlClass = totalPnlSol >= 0 ? 'text-green' : 'text-red'
  }

  return (
    <div className="grid grid-cols-2 gap-px border-t border-line bg-line text-center sm:grid-cols-4">
      <Stat label="buys (14d)" value={String(data.buys)} />
      <Stat label="sells (14d)" value={String(data.sells)} />
      <Stat label="pnl (14d, approx)" value={pnlValue} valueClassName={pnlClass} sub={pnlSub} />
      <Stat label="current bag" value={formatCompact(data.currentBalance)} sub={data.cached ? 'cached' : 'fresh'} />
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string
  value: string
  sub?: string
  valueClassName?: string
}) {
  return (
    <div className="bg-[#0a0d0a] px-3 py-3">
      <div className="text-[9px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className={cn('disp tnum mt-1 text-sm', valueClassName ?? 'text-ink-primary')}>{value}</div>
      {sub && <div className="tnum mt-0.5 text-[10px] text-ink-muted">{sub}</div>}
    </div>
  )
}
