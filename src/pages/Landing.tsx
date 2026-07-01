import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Card } from '../components/ui/Card'
import { LiveDot } from '../components/ui/LiveDot'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCell } from '../components/ui/StatCell'
import { SwapWidget } from '../components/SwapWidget'
import { useCountUp } from '../hooks/useCountUp'
import { mockGlobal, mockRace, mockCreator } from '../lib/mock'
import { ANSEM_CREATOR_WALLET, HOLDER_GOAL, MARKET_CAP_GOAL } from '../lib/ansem'
import { formatNumber, formatCompact, formatUsd, shortenAddress } from '../lib/format'

export default function Landing() {
  const { setVisible } = useWalletModal()
  const holders = useCountUp(mockGlobal.holders)
  const holderPct = (holders / HOLDER_GOAL) * 100

  return (
    <div className="space-y-4">
      {/* Race to $1B */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="disp text-xl">
            <span className="text-ink-primary">race to </span>
            <span className="text-green">$1b</span>
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-red">
            <LiveDot color="red" /> live
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <RaceMetric
            title="market cap"
            goalLabel="goal $1b"
            ansem={{ value: formatUsd(mockRace.ansem.marketCap, true), pct: (mockRace.ansem.marketCap / MARKET_CAP_GOAL) * 100 }}
            pump={{ value: formatUsd(mockRace.pump.marketCap, true), pct: (mockRace.pump.marketCap / MARKET_CAP_GOAL) * 100 }}
          />
          <RaceMetric
            title="holders"
            goalLabel="goal 1m"
            ansem={{ value: formatNumber(mockRace.ansem.holders), pct: (mockRace.ansem.holders / HOLDER_GOAL) * 100 }}
            pump={{ value: formatNumber(mockRace.pump.holders), pct: (mockRace.pump.holders / HOLDER_GOAL) * 100 }}
          />
        </div>
      </Card>

      {/* Holder counter hero */}
      <div className="relative overflow-hidden rounded-card border border-line">
        <img
          src="/black-bull.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top opacity-70 animate-breathe"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        <div className="relative flex min-h-[280px] flex-col justify-end p-5">
          <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-secondary">
            <LiveDot color="green" /> the trenches are live
          </span>
          <div className="disp tnum mt-3 text-6xl leading-none text-ink-primary">
            {formatNumber(holders)}
          </div>
          <div className="disp tnum mt-1 text-lg text-ink-secondary">/ {formatNumber(HOLDER_GOAL)} holders</div>
          <ProgressBar percent={holderPct} gradient className="mt-4" />
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-cell bg-line sm:grid-cols-4">
        <StatCell label="24h holders" value={`+${formatNumber(mockGlobal.holders24h)}`} valueClassName="text-green" />
        <StatCell label="market cap" value={formatUsd(mockGlobal.marketCap, true)} />
        <StatCell label="ath mc" value={formatUsd(mockGlobal.athMarketCap, true)} />
        <StatCell label="drops today" value={formatCompact(mockGlobal.airdropsToday)} valueClassName="text-red" />
      </div>

      {/* ANSEM Holdings (creator wallet) */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/bull-logo.png" alt="" className="h-6 w-6 rounded" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">ansem holdings</div>
              <div className="tnum text-xs text-ink-secondary">creator / {shortenAddress(ANSEM_CREATOR_WALLET)}</div>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs text-cyan">✓ verified</span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="disp tnum text-4xl text-green">{mockCreator.percentSupply}%</div>
          <div className="text-right">
            <div className="tnum text-sm text-ink-primary">{formatCompact(mockCreator.balance)} ANSEM</div>
            <div className="tnum text-xs text-ink-muted">{formatUsd(mockCreator.valueUsd, true)}</div>
          </div>
        </div>
        <ProgressBar percent={mockCreator.percentSupply} className="mt-3" />
        <a
          href={`https://solscan.io/account/${ANSEM_CREATOR_WALLET}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-ink-secondary hover:text-green"
        >
          view on solscan ↗
        </a>
      </Card>

      {/* Swap widget */}
      <SwapWidget />

      {/* CTA */}
      <button
        onClick={() => setVisible(true)}
        className="disp w-full rounded-pill bg-green py-4 text-base text-black"
      >
        connect wallet to join the trenches
      </button>
    </div>
  )
}

function RaceMetric({
  title,
  goalLabel,
  ansem,
  pump,
}: {
  title: string
  goalLabel: string
  ansem: { value: string; pct: number }
  pump: { value: string; pct: number }
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-muted">
        <span>{title}</span>
        <span>{goalLabel}</span>
      </div>
      <div className="mt-2 space-y-2">
        <RaceBar logo="/bull-logo.png" ticker="ansem" value={ansem.value} pct={ansem.pct} tone="green" />
        <RaceBar logo="/pump-logo.jpeg" ticker="pump" value={pump.value} pct={pump.pct} tone="red" />
      </div>
    </div>
  )
}

function RaceBar({
  logo,
  ticker,
  value,
  pct,
  tone,
}: {
  logo: string
  ticker: string
  value: string
  pct: number
  tone: 'green' | 'red'
}) {
  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-center gap-3">
      <div className="flex items-center gap-1.5">
        <img src={logo} alt="" className="h-4 w-4 rounded-full" />
        <span className="disp text-xs text-ink-secondary">{ticker}</span>
      </div>
      <ProgressBar percent={pct} striped fillClassName={tone === 'green' ? 'bg-green' : 'bg-red'} />
      <span className={`disp tnum text-right text-sm ${tone === 'green' ? 'text-green' : 'text-red'}`}>{value}</span>
    </div>
  )
}
