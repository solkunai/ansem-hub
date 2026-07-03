import { useState } from 'react'
import { useMarket } from '../../providers/MarketProvider'
import { ANSEM_MINT } from '../../lib/ansem'
import { shortenAddress } from '../../lib/format'
import { cn } from '../../lib/cn'

function priceFmt(n: number): string {
  return n >= 1
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

export function PriceStrip() {
  const m = useMarket()
  const [copied, setCopied] = useState(false)
  const items = [
    { sym: 'ANSEM', price: m.ansemPrice, change: m.ansemChange24h },
    { sym: 'PUMP', price: m.pumpPrice, change: m.pumpChange24h },
    { sym: 'SOL', price: m.solPrice, change: m.solChange24h },
  ]

  async function copyCa() {
    await navigator.clipboard.writeText(ANSEM_MINT)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto border-b border-line bg-panel-alt px-4 py-1.5 text-xs sm:px-6">
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="disp text-ink-secondary">{items[0].sym}</span>
        <span className="tnum text-ink-primary">{'$' + priceFmt(items[0].price)}</span>
        <span className={cn('tnum', items[0].change >= 0 ? 'text-green' : 'text-red')}>
          {items[0].change >= 0 ? '+' : ''}
          {items[0].change.toFixed(1)}%
        </span>
      </div>
      <button
        onClick={copyCa}
        title="copy ANSEM contract address"
        className="tnum flex shrink-0 items-center gap-1.5 rounded-pill border border-line px-2 py-0.5 text-ink-muted hover:border-green hover:text-green"
      >
        CA {shortenAddress(ANSEM_MINT)} {copied ? '✓' : '⧉'}
      </button>
      {items.slice(1).map((it) => (
        <div key={it.sym} className="flex shrink-0 items-center gap-1.5">
          <span className="disp text-ink-secondary">{it.sym}</span>
          <span className="tnum text-ink-primary">{'$' + priceFmt(it.price)}</span>
          <span className={cn('tnum', it.change >= 0 ? 'text-green' : 'text-red')}>
            {it.change >= 0 ? '+' : ''}
            {it.change.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}
