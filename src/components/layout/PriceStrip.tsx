import { useMarket } from '../../providers/MarketProvider'
import { cn } from '../../lib/cn'

function priceFmt(n: number): string {
  return n >= 1
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
}

export function PriceStrip() {
  const m = useMarket()
  const items = [
    { sym: 'ANSEM', price: m.ansemPrice, change: m.ansemChange24h },
    { sym: 'PUMP', price: m.pumpPrice, change: m.pumpChange24h },
    { sym: 'SOL', price: m.solPrice, change: m.solChange24h },
  ]

  return (
    <div className="flex items-center gap-5 overflow-x-auto border-b border-line bg-panel-alt px-4 py-1.5 text-xs sm:px-6">
      {items.map((it) => (
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
