import { useWallet } from '@solana/wallet-adapter-react'
import { Card } from '../components/ui/Card'
import { Sparkline } from '../components/Sparkline'
import { useHolderVerification } from '../hooks/useHolderVerification'
import { useMarket } from '../providers/MarketProvider'
import { mockWallet } from '../lib/mock'
import { formatNumber, formatUsd, formatPercent, shortenAddress } from '../lib/format'

export default function Dashboard() {
  const w = mockWallet
  const { publicKey } = useWallet()
  const { balance, loading } = useHolderVerification()
  const market = useMarket()

  const isLive = balance != null
  const address = publicKey?.toBase58() ?? w.address
  const bal = isLive ? balance : w.balance
  const valueUsd = isLive ? balance * market.ansemPrice : w.valueUsd

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <Card accent className="bg-gradient-to-br from-[#0d130d] to-panel">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">
            your bag{!isLive && ' · sample'}
          </span>
          <span className="tnum rounded-pill border border-line bg-raised px-2.5 py-1 text-xs text-ink-secondary">
            {shortenAddress(address)}
          </span>
        </div>
        <div className="disp tnum mt-3 text-5xl text-ink-primary">
          {loading ? '…' : formatNumber(bal)}
        </div>
        <div className="mt-1">
          <span className="disp text-green">$ANSEM</span>
          <span className="tnum ml-2 text-sm text-ink-secondary">≈ {formatUsd(valueUsd)}</span>
        </div>
      </Card>

      {/* PnL */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">pnl</span>
          <span className="disp tnum text-green">{formatPercent(w.pnlPercent)}</span>
        </div>
        <Sparkline data={w.pnlSeries} className="mt-3 h-16 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-cell bg-line">
          <PnlCell label="cost basis" value={formatUsd(w.costBasis)} />
          <PnlCell label="current value" value={formatUsd(w.currentValue)} />
          <PnlCell label="unrealized" value={`+${formatUsd(w.unrealized)}`} valueClassName="text-green" />
          <PnlCell label="realized" value={`+${formatUsd(w.realized)}`} valueClassName="text-green" />
        </div>
      </Card>

      {/* Airdrops received */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">airdrops received</span>
          <span className="tnum text-sm text-green">{formatNumber(w.airdropsReceivedTotal)} total</span>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {w.airdropsReceived.map((drop, i) => (
            <li key={i} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm text-ink-primary">{drop.label}</div>
                <div className="tnum text-xs text-ink-muted">{drop.date}</div>
              </div>
              <div className="text-right">
                <div className="disp tnum text-sm text-green">+{formatNumber(drop.amount)}</div>
                <div className="tnum text-xs text-ink-muted">{formatUsd(drop.valueUsd)}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* SOL Trivia perk */}
      <a
        href="https://soltrivia.app"
        target="_blank"
        rel="noreferrer"
        className="block rounded-card border border-dashed border-green/40 bg-[#0a0d0a] p-4"
      >
        <div className="flex items-center gap-2">
          <span className="disp text-base text-ink-primary">sol trivia</span>
          <span className="rounded-pill border border-green/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-green">
            perk
          </span>
        </div>
        <p className="mt-1.5 text-sm text-ink-secondary">
          holders get free entry to ansem-gated trivia. win $ANSEM. ↗
        </p>
      </a>
    </div>
  )
}

function PnlCell({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="bg-panel p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className={`disp tnum mt-1 text-lg text-ink-primary ${valueClassName ?? ''}`}>{value}</div>
    </div>
  )
}
