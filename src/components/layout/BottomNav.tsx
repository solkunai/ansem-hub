import { NavLink } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { cn } from '../../lib/cn'

export function BottomNav() {
  const { connected } = useWallet()
  const tabs = [
    { to: connected ? '/dashboard' : '/', label: 'home', end: true },
    { to: '/leaderboard', label: 'holders', end: false },
    { to: '/airdrops', label: 'airdrops', end: false },
    { to: '/creators', label: 'creators', end: false },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line bg-panel/95 px-2 py-2 backdrop-blur sm:hidden">
      {tabs.map((t) => (
        <NavLink
          key={t.label}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            cn('disp px-4 py-1 text-sm uppercase', isActive ? 'text-green' : 'text-ink-faint')
          }
        >
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
