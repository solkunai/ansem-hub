import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ANSEM_CREATOR_WALLET, ANSEM_TOTAL_SUPPLY } from '../lib/ansem'
import { mockCreator } from '../lib/mock'

// Reuses holder_snapshots, already populated every 15 min by the
// snapshot-holders cron for the leaderboard — the creator wallet is
// consistently rank 1, so no new backend work needed for this stat.
export function useCreatorHoldings() {
  const [balance, setBalance] = useState(mockCreator.balance)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('holder_snapshots')
        .select('balance')
        .eq('wallet', ANSEM_CREATOR_WALLET)
        .maybeSingle()
      if (!cancelled && data) setBalance(Number(data.balance))
    }

    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const percentSupply = ANSEM_TOTAL_SUPPLY > 0 ? (balance / ANSEM_TOTAL_SUPPLY) * 100 : 0
  return { balance, percentSupply }
}
