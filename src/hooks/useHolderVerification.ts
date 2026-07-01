import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'

export interface HolderState {
  loading: boolean
  verified: boolean
  balance: number | null
  error: string | null
}

const IDLE: HolderState = { loading: false, verified: false, balance: null, error: null }

export function useHolderVerification(): HolderState {
  const { publicKey } = useWallet()
  const [state, setState] = useState<HolderState>(IDLE)

  useEffect(() => {
    if (!publicKey) {
      setState(IDLE)
      return
    }

    let cancelled = false
    setState({ ...IDLE, loading: true })

    supabase.functions
      .invoke('verify-ansem-holder', { body: { owner: publicKey.toBase58() } })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || data?.error) {
          setState({ loading: false, verified: false, balance: null, error: error?.message ?? data?.error ?? 'error' })
        } else {
          setState({ loading: false, verified: Boolean(data.verified), balance: data.balance ?? 0, error: null })
        }
      })

    return () => {
      cancelled = true
    }
  }, [publicKey])

  return state
}
