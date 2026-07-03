import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Contributor {
  wallet: string
  xHandle: string | null
  totalPoints: number
}

export function useContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from('contributors')
        .select('wallet, x_handle, total_points')
        .order('total_points', { ascending: false })
        .limit(50)

      if (cancelled) return
      if (data) {
        setContributors(
          data.map((c) => ({ wallet: c.wallet, xHandle: c.x_handle, totalPoints: Number(c.total_points) })),
        )
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { contributors, loading }
}
