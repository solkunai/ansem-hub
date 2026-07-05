import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { PriceStrip } from './PriceStrip'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { useTrackWalletConnect } from '../../hooks/useTrackWalletConnect'

export function AppShell() {
  useTrackWalletConnect()

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
      <div className="sticky top-0 z-20">
        <Header />
        <PriceStrip />
      </div>
      <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-12">
        <Outlet />
        <Footer />
      </main>
      <BottomNav />
    </div>
  )
}
