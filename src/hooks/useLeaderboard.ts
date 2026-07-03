import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'

export interface LeaderboardRow {
  rank: number
  wallet: string
  balance: number
  change24h: number
  daysHeld: number
  dropsReceived: number
  isYou: boolean
}

const REFRESH_MS = 60_000

export function useLeaderboard() {
  const { publicKey } = useWallet()
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('wallet, rank, balance, change_24h, days_held, drops_received')
        .order('rank', { ascending: true })
        .limit(20)

      if (cancelled) return
      if (!error && data) {
        setRows(
          data.map((r) => ({
            rank: r.rank,
            wallet: r.wallet,
            balance: Number(r.balance),
            change24h: Number(r.change_24h),
            daysHeld: r.days_held,
            dropsReceived: Number(r.drops_received),
            isYou: r.wallet === publicKey?.toBase58(),
          })),
        )
      }
      setLoading(false)
    }

    load()
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, REFRESH_MS)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [publicKey])

  return { rows, loading }
}
