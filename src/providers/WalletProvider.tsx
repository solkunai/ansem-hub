import { type ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger'
import '@solana/wallet-adapter-react-ui/styles.css'

const RPC_ENDPOINT = import.meta.env.VITE_RPC_URL ?? 'https://api.mainnet-beta.solana.com'

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
