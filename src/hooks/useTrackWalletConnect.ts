import { useEffect, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { track } from '@vercel/analytics'

// Fires a lightweight, identity-free 'wallet_connected' event into Vercel
// Analytics the moment a wallet transitions from disconnected to connected —
// not on every render where `connected` happens to already be true (e.g.
// autoConnect on page load restoring a prior session isn't a new connect).
export function useTrackWalletConnect() {
  const { connected } = useWallet()
  const wasConnected = useRef(false)

  useEffect(() => {
    if (connected && !wasConnected.current) {
      track('wallet_connected')
    }
    wasConnected.current = connected
  }, [connected])
}
