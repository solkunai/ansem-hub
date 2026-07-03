import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { LiveDot } from '../components/ui/LiveDot'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCell } from '../components/ui/StatCell'
import { SwapWidget } from '../components/SwapWidget'
import { PriceChart } from '../components/PriceChart'
import { useCountUp } from '../hooks/useCountUp'
import { useCreatorHoldings } from '../hooks/useCreatorHoldings'
import { useMarket } from '../providers/MarketProvider'
import { mockGlobal, mockRace } from '../lib/mock'
import { ANSEM_CREATOR_WALLET, DEV_DONATION_WALLET, HOLDER_GOAL, MARKET_CAP_GOAL } from '../lib/ansem'
import { formatNumber, formatCompact, formatUsd, shortenAddress } from '../lib/format'

export default function Landing() {
  const market = useMarket()
  const creator = useCreatorHoldings()
  const holders = useCountUp(market.ansemHolders)
  const holderPct = (holders / HOLDER_GOAL) * 100
  const athMc = Math.max(mockGlobal.athMarketCap, market.ansemMarketCap)

  return (
    <div className="space-y-4">
      {/* Race to 1M holders */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="disp text-xl uppercase">
            <span className="text-ink-primary">race to </span>
            <span className="text-green">1m holders</span>
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-red">
            <LiveDot color="red" /> live
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <RaceMetric
            title="holders"
            goalLabel="goal 1m"
            ansem={{ value: formatNumber(market.ansemHolders), pct: (market.ansemHolders / HOLDER_GOAL) * 100 }}
            pump={{ value: formatNumber(mockRace.pump.holders), pct: (mockRace.pump.holders / HOLDER_GOAL) * 100 }}
          />
          <RaceMetric
            title="market cap"
            goalLabel="goal $1b"
            ansem={{ value: formatUsd(market.ansemMarketCap, true), pct: (market.ansemMarketCap / MARKET_CAP_GOAL) * 100 }}
            pump={{ value: formatUsd(market.pumpMarketCap, true), pct: (market.pumpMarketCap / MARKET_CAP_GOAL) * 100 }}
          />
        </div>
      </Card>

      {/* Holder counter hero */}
      <div className="relative overflow-hidden rounded-card border border-line">
        <img
          src="/ansem-bull-green.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top animate-breathe"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
        <div className="relative flex min-h-[280px] flex-col justify-end p-5">
          <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-secondary">
            <LiveDot color="green" /> road to 1m holders
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
        <StatCell label="market cap" value={formatUsd(market.ansemMarketCap, true)} />
        <StatCell label="ath mc" value={formatUsd(athMc, true)} />
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
          <div className="disp tnum text-4xl text-green">{creator.percentSupply.toFixed(1)}%</div>
          <div className="text-right">
            <div className="tnum text-sm text-ink-primary">{formatCompact(creator.balance)} ANSEM</div>
            <div className="tnum text-xs text-ink-muted">{formatUsd(creator.balance * market.ansemPrice, true)}</div>
          </div>
        </div>
        <ProgressBar percent={creator.percentSupply} className="mt-3" />
        <a
          href={`https://solscan.io/account/${ANSEM_CREATOR_WALLET}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-ink-secondary hover:text-green"
        >
          view on solscan ↗
        </a>
      </Card>

      {/* Price chart */}
      <PriceChart pairAddress={market.ansemPairAddress} />

      {/* Swap widget */}
      <SwapWidget />

      {/* Donate to dev */}
      <DonateCard />
    </div>
  )
}

function DonateCard() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(DEV_DONATION_WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-card border border-dashed border-green/40 bg-[#0a0d0a] p-4">
      <div className="flex items-center gap-2">
        <span className="disp text-base uppercase text-ink-primary">donate ansem to dev</span>
      </div>
      <p className="mt-1.5 text-sm text-ink-secondary">
        send ANSEM to support the dev — 50% of donations go straight back out as ANSEM giveaways.
      </p>
      <button
        onClick={copy}
        className="tnum mt-3 flex w-full items-center justify-between rounded-cell border border-line bg-raised px-3 py-2 text-sm text-ink-primary hover:border-green"
      >
        <span>{shortenAddress(DEV_DONATION_WALLET)}</span>
        <span className={copied ? 'text-green' : 'text-ink-muted'}>{copied ? 'copied ✓' : 'copy ⧉'}</span>
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
        <RaceBar logo="/pump-logo.jpeg" ticker="pump" value={pump.value} pct={pump.pct} tone="white" />
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
  tone: 'green' | 'white'
}) {
  return (
    <div className="grid grid-cols-[72px_1fr_auto] items-center gap-3">
      <div className="flex items-center gap-1.5">
        <img src={logo} alt="" className="h-4 w-4 rounded-full" />
        <span className="disp text-xs text-ink-secondary">{ticker}</span>
      </div>
      <ProgressBar percent={pct} striped fillClassName={tone === 'green' ? 'bg-green' : 'bg-white'} />
      <span className={`disp tnum text-right text-sm ${tone === 'green' ? 'text-green' : 'text-white'}`}>{value}</span>
    </div>
  )
}
