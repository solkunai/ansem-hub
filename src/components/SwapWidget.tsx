import { useState } from 'react'
import { Card } from './ui/Card'
import { formatNumber, formatUsd } from '../lib/format'

// Mock rates from the design. Replaced by live Jupiter quotes in the swap batch.
const SOL_USD = 148.2
const ANSEM_USD = 0.0483
const PRICE_IMPACT = 0.003

type Side = { sym: 'SOL' | 'ANSEM'; usd: number }
const SOL: Side = { sym: 'SOL', usd: SOL_USD }
const ANSEM: Side = { sym: 'ANSEM', usd: ANSEM_USD }

export function SwapWidget() {
  const [buyAnsem, setBuyAnsem] = useState(true)
  const [amount, setAmount] = useState('1')

  const pay = buyAnsem ? SOL : ANSEM
  const receive = buyAnsem ? ANSEM : SOL

  const payNum = parseFloat(amount) || 0
  const rate = pay.usd / receive.usd
  const receiveNum = payNum * rate * (1 - PRICE_IMPACT)
  const payUsd = payNum * pay.usd

  return (
    <Card accent className="bg-gradient-to-b from-[#0d130d] to-panel">
      <div className="space-y-2">
        <Field
          label="you pay"
          sym={pay.sym}
          value={amount}
          onChange={setAmount}
          usd={formatUsd(payUsd)}
          editable
        />

        <div className="flex justify-center">
          <button
            onClick={() => setBuyAnsem((v) => !v)}
            aria-label="flip direction"
            className="rounded-full border border-line bg-raised px-3 py-1 text-ink-secondary hover:text-green"
          >
            ⇅
          </button>
        </div>

        <Field
          label="you receive (est.)"
          sym={receive.sym}
          value={payNum > 0 ? formatNumber(Math.round(receiveNum)) : '0'}
          usd={formatUsd(receiveNum * receive.usd)}
        />
      </div>

      <dl className="mt-4 space-y-1.5 text-xs text-ink-muted">
        <Row k="rate" v={`1 ${pay.sym} = ${formatNumber(Math.round(rate))} ${receive.sym}`} />
        <Row k="price impact" v={`${(PRICE_IMPACT * 100).toFixed(1)}%`} />
        <Row k="route" v="jupiter · best" />
        <Row k="slippage" v="0.5%" />
      </dl>

      <button className="disp mt-4 w-full rounded-pill bg-green py-3 text-base text-black">
        swap & join the trenches
      </button>
    </Card>
  )
}

function Field({
  label,
  sym,
  value,
  onChange,
  usd,
  editable,
}: {
  label: string
  sym: string
  value: string
  onChange?: (v: string) => void
  usd: string
  editable?: boolean
}) {
  return (
    <div className="rounded-cell border border-line bg-raised p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-3">
        {editable ? (
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange?.(e.target.value.replace(/[^0-9.]/g, ''))}
            className="disp tnum w-0 flex-1 bg-transparent text-2xl text-ink-primary outline-none"
          />
        ) : (
          <span className="disp tnum text-2xl text-ink-primary">{value}</span>
        )}
        <span className="disp shrink-0 rounded-pill border border-line bg-panel px-3 py-1 text-sm text-ink-primary">
          {sym}
        </span>
      </div>
      <div className="tnum mt-1 text-xs text-ink-muted">{usd}</div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt>{k}</dt>
      <dd className="tnum text-ink-secondary">{v}</dd>
    </div>
  )
}
