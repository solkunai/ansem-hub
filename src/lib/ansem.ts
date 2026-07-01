export const ANSEM_MINT = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump'
export const PUMP_MINT = 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn'
export const ANSEM_CREATOR_WALLET = 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52'

export const ANSEM_TOTAL_SUPPLY = 1_000_000_000

export const HOLDER_GOAL = 1_000_000
export const MARKET_CAP_GOAL = 1_000_000_000

// Known imposter / legacy ANSEM tokens. Never honor these as the real ANSEM.
export const IMPOSTER_MINTS = [
  'EMxfR4oNkrC6R9L2B5fCfeqjAMoRgjqHuxqA6NW5pump',
  '3Lec18q7nPM62LQwqXG2ddiBTDrFCiNw1NEA1ehBZPgB',
]

export function isImposterMint(mint: string): boolean {
  return IMPOSTER_MINTS.includes(mint)
}
