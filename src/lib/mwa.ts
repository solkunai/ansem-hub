import {
  registerMwa,
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-standard-mobile'

let registered = false

export function initMwa() {
  if (registered) return
  registered = true

  registerMwa({
    appIdentity: {
      name: 'ANSEM HUB',
      uri: window.location.origin,
      icon: 'favicon.ico',
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ['solana:mainnet'] as const,
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  })
}
