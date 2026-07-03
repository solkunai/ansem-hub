import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SolanaProviders } from './providers/WalletProvider'
import { MarketProvider } from './providers/MarketProvider'
import { initMwa } from './lib/mwa'
import './index.css'

initMwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaProviders>
      <MarketProvider>
        <App />
      </MarketProvider>
    </SolanaProviders>
  </StrictMode>,
)
