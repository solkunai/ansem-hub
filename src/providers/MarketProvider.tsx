import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchMarketData, fetchJupiterPrices, fetchHolderCount } from '../lib/prices'
import { ANSEM_MINT, PUMP_MINT, WSOL_MINT } from '../lib/ansem'
import { mockGlobal, mockRace } from '../lib/mock'

export interface Market {
  ansemPrice: number
  pumpPrice: number
  solPrice: number
  ansemChange24h: number
  pumpChange24h: number
  solChange24h: number
  ansemMarketCap: number
  pumpMarketCap: number
  ansemVolume24h: number
  ansemHolders: number
  ansemPairAddress: string | null
  live: boolean
}

const fallback: Market = {
  ansemPrice: mockGlobal.ansemPrice,
  pumpPrice: 0.0058,
  solPrice: mockGlobal.solPrice,
  ansemChange24h: 0,
  pumpChange24h: 0,
  solChange24h: 0,
  ansemMarketCap: mockGlobal.marketCap,
  pumpMarketCap: mockRace.pump.marketCap,
  ansemVolume24h: mockGlobal.volume24h,
  ansemHolders: mockGlobal.holders,
  ansemPairAddress: null,
  live: false,
}

const MarketContext = createContext<Market>(fallback)

export function useMarket(): Market {
  return useContext(MarketContext)
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<Market>(fallback)

  // Fast: prices tick every 5s (Jupiter price v3). Jupiter's free lite-api
  // tier caps out at 1 request/sec (60/min, 60s sliding window) per client —
  // this loop and the swap widget's own quote poll (useJupiterQuote) share
  // that same budget for any single visitor, so both are tuned to stay well
  // under it with real margin rather than just barely inside it.
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const p = await fetchJupiterPrices([ANSEM_MINT, PUMP_MINT, WSOL_MINT])
        if (cancelled) return
        setMarket((prev) => ({
          ...prev,
          ansemPrice: p[ANSEM_MINT]?.usdPrice ?? prev.ansemPrice,
          pumpPrice: p[PUMP_MINT]?.usdPrice ?? prev.pumpPrice,
          solPrice: p[WSOL_MINT]?.usdPrice ?? prev.solPrice,
          ansemChange24h: p[ANSEM_MINT]?.priceChange24h ?? prev.ansemChange24h,
          pumpChange24h: p[PUMP_MINT]?.priceChange24h ?? prev.pumpChange24h,
          solChange24h: p[WSOL_MINT]?.priceChange24h ?? prev.solChange24h,
          live: true,
        }))
      } catch {
        // keep last good values
      }
    }
    load()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // Slow: market cap, volume, and holder count every 30s. These move slowly
  // and holderCount comes free from the same Jupiter host used for prices.
  useEffect(() => {
    let cancelled = false
    async function load() {
      const results = await Promise.allSettled([
        fetchMarketData({ ansem: ANSEM_MINT, pump: PUMP_MINT, sol: WSOL_MINT }),
        fetchHolderCount(ANSEM_MINT),
      ])
      if (cancelled) return

      const snap = results[0].status === 'fulfilled' ? results[0].value : null
      const holderCount = results[1].status === 'fulfilled' ? results[1].value : null

      setMarket((prev) => ({
        ...prev,
        ansemMarketCap: snap?.ansem?.marketCap ?? prev.ansemMarketCap,
        pumpMarketCap: snap?.pump?.marketCap ?? prev.pumpMarketCap,
        ansemVolume24h: snap?.ansem?.volume24h ?? prev.ansemVolume24h,
        ansemHolders: holderCount ?? prev.ansemHolders,
        ansemPairAddress: snap?.ansem?.pairAddress ?? prev.ansemPairAddress,
      }))
    }
    load()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return <MarketContext.Provider value={market}>{children}</MarketContext.Provider>
}
