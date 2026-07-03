export const ANSEM_MINT = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump'
export const ANSEM_CREATOR_WALLET = 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52'

// Program IDs checked to classify a transaction as a swap (vs. a plain
// transfer/airdrop) when a wallet's ANSEM balance changes. JUP6...TaV4
// (Jupiter Aggregator v6) was confirmed live against a real ANSEM swap
// transaction; the rest are long-established, widely-documented Solana DEX
// program IDs.
export const DEX_PROGRAM_IDS = [
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter Aggregator v6
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium AMM v4
  'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C', // Raydium CPMM
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK', // Raydium CLMM
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpool
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P', // Pump.fun bonding curve
]
