import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Card } from './ui/Card'
import { useMarket } from '../providers/MarketProvider'
import { useJupiterQuote } from '../hooks/useJupiterQuote'
import { buildSwapTransaction, sendSwapTransaction } from '../lib/swap'
import { ANSEM_MINT, WSOL_MINT } from '../lib/ansem'
import { formatUsd } from '../lib/format'
import { cn } from '../lib/cn'

const SOL_DECIMALS = 9
const ANSEM_DECIMALS = 6

const amount4 = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })

type SwapStatus = 'idle' | 'signing' | 'sending' | 'success' | 'error'

export function SwapWidget() {
  const market = useMarket()
  const { connection } = useConnection()
  const { connected, publicKey, signTransaction } = useWallet()
  const { setVisible } = useWalletModal()

  const [buyAnsem, setBuyAnsem] = useState(true)
  const [amount, setAmount] = useState('1')
  const [status, setStatus] = useState<SwapStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const payNum = parseFloat(amount) || 0
  const inDecimals = buyAnsem ? SOL_DECIMALS : ANSEM_DECIMALS
  const outDecimals = buyAnsem ? ANSEM_DECIMALS : SOL_DECIMALS
  const amountRaw = Math.floor(payNum * 10 ** inDecimals)

  const inputMint = buyAnsem ? WSOL_MINT : ANSEM_MINT
  const outputMint = buyAnsem ? ANSEM_MINT : WSOL_MINT

  const { quote, outAmount, priceImpactPct, error: quoteError } = useJupiterQuote(inputMint, outputMint, amountRaw)

  const receiveNum = outAmount != null ? outAmount / 10 ** outDecimals : 0
  const rate = payNum > 0 ? receiveNum / payNum : 0

  const paySym = buyAnsem ? 'SOL' : 'ANSEM'
  const recvSym = buyAnsem ? 'ANSEM' : 'SOL'
  const payPrice = buyAnsem ? market.solPrice : market.ansemPrice
  const recvPrice = buyAnsem ? market.ansemPrice : market.solPrice

  function flip() {
    setBuyAnsem((v) => !v)
    setStatus('idle')
    setStatusMessage(null)
  }

  async function handleSwap() {
    if (!connected || !publicKey || !signTransaction) {
      setVisible(true)
      return
    }
    if (!quote) return

    setStatus('signing')
    setStatusMessage(null)
    setTxSignature(null)

    try {
      const transaction = await buildSwapTransaction(quote, publicKey)
      setStatus('sending')
      const signature = await sendSwapTransaction(connection, transaction, signTransaction)
      setTxSignature(signature)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setStatusMessage(err instanceof Error ? err.message : 'swap failed, try again')
    }
  }

  const isBusy = status === 'signing' || status === 'sending'
  const buttonLabel = !connected
    ? 'connect wallet to swap'
    : isBusy
      ? status === 'signing'
        ? 'confirm in wallet…'
        : 'sending…'
      : quoteError
        ? quoteError
        : 'swap & join the trenches'

  return (
    <Card accent className="bg-gradient-to-b from-[#0d130d] to-panel">
      <div className="rounded-cell border border-line bg-raised p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">you pay</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.]/g, ''))
              setStatus('idle')
              setStatusMessage(null)
            }}
            className="disp tnum w-0 flex-1 bg-transparent text-2xl text-ink-primary outline-none"
          />
          <span className="disp shrink-0 rounded-pill border border-line bg-panel px-3 py-1 text-sm text-ink-primary">
            {paySym}
          </span>
        </div>
        <div className="tnum mt-1 text-xs text-ink-muted">{formatUsd(payNum * payPrice)}</div>
      </div>

      <div className="flex justify-center py-1">
        <button
          onClick={flip}
          aria-label="flip direction"
          className="rounded-full border border-line bg-raised px-3 py-1 text-ink-secondary hover:text-green"
        >
          ⇅
        </button>
      </div>

      <div className="rounded-cell border border-line bg-raised p-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">you receive (est.)</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="disp tnum text-2xl text-ink-primary">{amount4(receiveNum)}</span>
          <span className="disp shrink-0 rounded-pill border border-line bg-panel px-3 py-1 text-sm text-ink-primary">
            {recvSym}
          </span>
        </div>
        <div className="tnum mt-1 text-xs text-ink-muted">{formatUsd(receiveNum * recvPrice)}</div>
      </div>

      <dl className="mt-4 space-y-1.5 text-xs text-ink-muted">
        <div className="flex justify-between">
          <dt>rate</dt>
          <dd className="tnum text-ink-secondary">
            1 {paySym} = {amount4(rate)} {recvSym}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>price impact</dt>
          <dd className="tnum text-ink-secondary">
            {priceImpactPct != null ? `${(priceImpactPct * 100).toFixed(2)}%` : '—'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>route</dt>
          <dd className="tnum text-ink-secondary">jupiter · best</dd>
        </div>
        <div className="flex justify-between">
          <dt>slippage</dt>
          <dd className="tnum text-ink-secondary">0.5%</dd>
        </div>
      </dl>

      <button
        onClick={() => void handleSwap()}
        disabled={isBusy || (connected && (!quote || payNum <= 0))}
        className="disp mt-4 w-full rounded-pill bg-green py-3 text-base text-black disabled:opacity-50"
      >
        {buttonLabel}
      </button>

      {status === 'success' && txSignature && (
        <a
          href={`https://solscan.io/tx/${txSignature}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-xs text-green hover:underline"
        >
          swap confirmed — view on solscan ↗
        </a>
      )}
      {status === 'error' && statusMessage && (
        <p className={cn('mt-2 text-center text-xs text-red')}>{statusMessage}</p>
      )}
    </Card>
  )
}
