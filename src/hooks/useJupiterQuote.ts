import { useEffect, useState } from 'react'
import { fetchSwapQuote, type JupiterQuote } from '../lib/swap'

export interface QuoteState {
  quote: JupiterQuote | null
  outAmount: number | null
  priceImpactPct: number | null
  loading: boolean
  error: string | null
}

// Polls the Jupiter quote every 6s (and immediately on input change). Jupiter's
// free lite-api tier caps at 1 request/sec per client, shared with
// MarketProvider's own price poll for any single visitor — both are tuned to
// leave real margin under that ceiling rather than each independently
// assuming they own the whole budget.
export function useJupiterQuote(inputMint: string, outputMint: string, amountRaw: number): QuoteState {
  const [state, setState] = useState<QuoteState>({
    quote: null,
    outAmount: null,
    priceImpactPct: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!amountRaw || amountRaw <= 0) {
      setState({ quote: null, outAmount: null, priceImpactPct: null, loading: false, error: null })
      return
    }

    let cancelled = false
    async function load() {
      setState((s) => ({ ...s, loading: true }))
      try {
        const quote = await fetchSwapQuote(inputMint, outputMint, amountRaw)
        if (cancelled) return
        setState({ quote, outAmount: quote.outAmount, priceImpactPct: quote.priceImpactPct, loading: false, error: null })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'quote failed'
        setState((s) => ({
          ...s,
          loading: false,
          error: /429|rate limit/i.test(message) ? 'price feed busy, retrying…' : message,
        }))
      }
    }

    load()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 6000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [inputMint, outputMint, amountRaw])

  return state
}
