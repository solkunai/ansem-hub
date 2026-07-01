import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
      <Header />
      <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-12">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
