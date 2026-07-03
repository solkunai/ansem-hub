import { type ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger'
import '@solana/wallet-adapter-react-ui/styles.css'

// The public Solana RPC blocks sendTransaction (and other heavier methods)
// from unrecognized browser origins, so it can't run a real dApp. Default to
// our own Supabase edge function, which proxies to Helius without exposing
// the API key to the client — see supabase/functions/rpc-proxy.
const RPC_ENDPOINT =
  import.meta.env.VITE_RPC_URL ?? 'https://aoufhqvjjiunpymuolkq.supabase.co/functions/v1/rpc-proxy'

export function SolanaProviders({ children }: { children: ReactNode }) {
  // Phantom, Solflare, Backpack and any Wallet Standard wallet self-register and
  // are auto-detected. Ledger is hardware and needs an explicit adapter.
  const wallets = useMemo(() => [new LedgerWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
