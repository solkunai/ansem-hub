// MOCK DATA. Every value here is placeholder from the design handoff.
// Replace each field with a real data source before launch (Helius / price feed /
// Jupiter / indexer). Nothing here is fetched. See the handoff README build checklist.

export const mockGlobal = {
  holders: 423_847,
  holders24h: 3_412,
  marketCap: 48_200_000,
  athMarketCap: 112_600_000,
  volume24h: 9_100_000,
  ansemPrice: 0.0483,
  solPrice: 148.2,
  airdropsToday: 1_280_000,
}

export const mockRace = {
  ansem: { marketCap: 48_200_000, holders: 423_847 },
  pump: { marketCap: 585_000_000, holders: 124_000 },
}

export const mockCreator = {
  wallet: 'GV6UUmNxz2RpKxmNAPadYKb7uQpszwqQAu3qLJxVdC52',
  percentSupply: 58,
  balance: 580_000_000,
  valueUsd: 28_000_000,
}
