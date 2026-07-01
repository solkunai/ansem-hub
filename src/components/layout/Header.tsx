import { Link, NavLink } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { shortenAddress } from '../../lib/format'
import { cn } from '../../lib/cn'

const navLinks = [
  { to: '/', label: 'trenches', end: true },
  { to: '/dashboard', label: 'dashboard', end: false },
  { to: '/leaderboard', label: 'leaderboard', end: false },
  { to: '/airdrops', label: 'airdrops', end: false },
]

export function Header() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-panel/90 px-4 py-3 backdrop-blur sm:px-6">
      <Link to="/" className="flex items-center gap-2">
        <img src="/bull-logo.png" alt="" className="h-7 w-7 rounded-md" />
        <span className="disp text-lg tracking-tight">
          <span className="text-ink-primary">ANSEM </span>
          <span className="text-green">HUB</span>
        </span>
      </Link>

      <nav className="hidden items-center gap-6 sm:flex">
        {navLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn('text-sm', isActive ? 'text-green' : 'text-ink-secondary hover:text-ink-primary')
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {connected && publicKey ? (
        <button
          onClick={() => void disconnect()}
          title="disconnect"
          className="flex items-center gap-2 rounded-pill border border-line-accent bg-raised px-3 py-1.5 text-xs text-ink-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="tnum">{shortenAddress(publicKey.toBase58())}</span>
        </button>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="disp rounded-pill bg-green px-4 py-1.5 text-sm text-black"
        >
          connect
        </button>
      )}
    </header>
  )
}
