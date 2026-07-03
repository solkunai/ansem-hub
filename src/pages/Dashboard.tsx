import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Card } from '../components/ui/Card'
import { useHolderVerification } from '../hooks/useHolderVerification'
import { useWalletTrades } from '../hooks/useWalletTrades'
import { useWalletAirdrops } from '../hooks/useWalletAirdrops'
import { useMarket } from '../providers/MarketProvider'
import { ANSEM_MINT } from '../lib/ansem'
import { formatNumber, formatUsd, formatPercent, formatTimeAgo, shortenAddress } from '../lib/format'

export default function Dashboard() {
  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { balance, loading: balanceLoading } = useHolderVerification()
  const market = useMarket()

  const address = publicKey?.toBase58() ?? null
  const { data: trades, loading: tradesLoading, error: tradesError, fetchTrades } = useWalletTrades()
  const { rows: airdrops, loading: airdropsLoading } = useWalletAirdrops(address)

  useEffect(() => {
    if (address) fetchTrades(address)
  }, [address, fetchTrades])

  const bal = balance ?? 0
  const valueUsd = bal * market.ansemPrice
  const airdropsTotalUsd = airdrops.reduce(
    (sum, a) => sum + a.amount * (a.mint === ANSEM_MINT ? market.ansemPrice : market.solPrice),
    0,
  )

  if (!connected) {
    return (
      <div className="space-y-4">
        <Card className="py-10 text-center">
          <div className="disp text-lg text-ink-primary">connect your wallet</div>
          <p className="mt-2 text-sm text-ink-secondary">see your real bag, pnl, and airdrops received</p>
          <button
            onClick={() => setVisible(true)}
            className="disp mt-4 rounded-pill bg-green px-4 py-1.5 text-sm text-black"
          >
            connect wallet
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <Card accent className="bg-gradient-to-br from-[#0d130d] to-panel">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">your bag</span>
          <span className="tnum rounded-pill border border-line bg-raised px-2.5 py-1 text-xs text-ink-secondary">
            {shortenAddress(address as string)}
          </span>
        </div>
        <div className="disp tnum mt-3 text-5xl text-ink-primary">
          {balanceLoading ? '…' : formatNumber(bal)}
        </div>
        <div className="mt-1">
          <span className="disp text-green">$ANSEM</span>
          <span className="tnum ml-2 text-sm text-ink-secondary">≈ {formatUsd(valueUsd)}</span>
        </div>
      </Card>

      {/* PnL */}
      <Card>
        <PnlSection
          loading={tradesLoading}
          error={tradesError}
          data={trades}
          solPrice={market.solPrice}
          ansemPrice={market.ansemPrice}
        />
      </Card>

      {/* Airdrops received */}
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">airdrops received</span>
          <span className="tnum text-sm text-green">{formatUsd(airdropsTotalUsd)}</span>
        </div>
        {airdropsLoading ? (
          <div className="py-6 text-center text-sm text-ink-muted">loading…</div>
        ) : airdrops.length === 0 ? (
          <div className="py-6 text-center text-sm text-ink-muted">no airdrops received yet</div>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {airdrops.map((drop) => {
              const isAnsem = drop.mint === ANSEM_MINT
              const symbol = isAnsem ? 'ANSEM' : 'SOL'
              const price = isAnsem ? market.ansemPrice : market.solPrice
              return (
                <li key={drop.txSignature} className="flex items-center justify-between py-2.5">
                  <div>
                    <a
                      href={`https://solscan.io/tx/${drop.txSignature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-ink-primary hover:text-cyan hover:underline"
                    >
                      {symbol} airdrop
                    </a>
                    <div className="tnum text-xs text-ink-muted">{formatTimeAgo(drop.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="disp tnum text-sm text-green">
                      +{symbol === 'SOL' ? drop.amount.toFixed(4) : formatNumber(drop.amount)} {symbol}
                    </div>
                    <div className="tnum text-xs text-ink-muted">{formatUsd(drop.amount * price)}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
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

// avgCost only reflects tokens we actually saw bought in the 14d window.
// Holdings beyond that (pre-existing, airdropped, or bought before the
// window) have no known cost basis — treating them as "free" would wildly
// overstate unrealized PnL, so unrealized value/cost is capped to the
// amount we can actually attribute to a tracked buy. Same math as the
// Leaderboard's per-wallet trade detail, since it's the same underlying data.
function PnlSection({
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
    return <div className="py-6 text-center text-sm text-ink-muted">loading pnl…</div>
  }
  if (error) {
    return <div className="py-6 text-center text-sm text-red">{error}</div>
  }
  if (!data) return null

  const avgCost = data.ansemBought > 0 ? data.costBasisSol / data.ansemBought : 0
  const realizedPnlSol = data.proceedsSol - avgCost * data.ansemSold
  const trackedRemaining = Math.max(0, data.ansemBought - data.ansemSold)
  const untrackedBalance = data.currentBalance - trackedRemaining
  const pnlKnown = data.ansemBought > 0
  const ansemPriceInSol = ansemPrice > 0 && solPrice > 0 ? ansemPrice / solPrice : 0

  let pnlPercentLabel = 'n/a'
  let totalPnlUsd = 0
  let unrealizedUsd = 0
  let realizedUsd = realizedPnlSol * solPrice
  let costBasisUsd = data.costBasisSol * solPrice

  if (pnlKnown) {
    const unrealizedBasisAmount = Math.min(data.currentBalance, trackedRemaining)
    const unrealizedPnlSol = unrealizedBasisAmount * ansemPriceInSol - avgCost * unrealizedBasisAmount
    const totalPnlSol = realizedPnlSol + unrealizedPnlSol
    totalPnlUsd = totalPnlSol * solPrice
    unrealizedUsd = unrealizedPnlSol * solPrice
    pnlPercentLabel = costBasisUsd > 0 ? formatPercent((totalPnlUsd / costBasisUsd) * 100) : 'n/a'
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted">pnl (14d, approx)</span>
        <span className={`disp tnum text-sm ${totalPnlUsd >= 0 ? 'text-green' : 'text-red'}`}>{pnlPercentLabel}</span>
      </div>
      {!pnlKnown ? (
        <p className="mt-3 text-xs text-ink-muted">no buys tracked in the last 14 days — pnl unknown</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-cell bg-line">
            <PnlCell label="cost basis" value={formatUsd(costBasisUsd)} />
            <PnlCell label="current value" value={formatUsd(data.currentBalance * ansemPrice)} />
            <PnlCell
              label="unrealized"
              value={`${unrealizedUsd >= 0 ? '+' : ''}${formatUsd(unrealizedUsd)}`}
              valueClassName={unrealizedUsd >= 0 ? 'text-green' : 'text-red'}
            />
            <PnlCell
              label="realized"
              value={`${realizedUsd >= 0 ? '+' : ''}${formatUsd(realizedUsd)}`}
              valueClassName={realizedUsd >= 0 ? 'text-green' : 'text-red'}
            />
          </div>
          {untrackedBalance > 0 && (
            <p className="mt-2 text-[11px] text-ink-muted">excludes untracked bag held before the 14d window</p>
          )}
        </>
      )}
    </>
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
