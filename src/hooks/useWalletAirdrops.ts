import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface WalletAirdropRow {
  amount: number
  mint: string
  createdAt: string
  txSignature: string
}

export function useWalletAirdrops(wallet: string | null) {
  const [rows, setRows] = useState<WalletAirdropRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!wallet) {
      setRows([])
      return
    }

    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('airdrop_events')
        .select('amount, mint, created_at, tx_signature')
        .eq('wallet', wallet)
        .order('created_at', { ascending: false })
        .limit(20)

      if (cancelled) return
      setRows(
        (data ?? []).map((e) => ({
          amount: Number(e.amount),
          mint: e.mint,
          createdAt: e.created_at,
          txSignature: e.tx_signature,
        })),
      )
      setLoading(false)
    }
    load()

    return () => {
      cancelled = true
    }
  }, [wallet])

  return { rows, loading }
}
