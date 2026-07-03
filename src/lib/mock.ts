// MOCK DATA. Every value here is placeholder from the design handoff.
// Replace each field with a real data source before launch (Helius / price feed /
// Jupiter / indexer). Nothing here is fetched. See the handoff README build checklist.

export interface AirdropReceived {
  date: string
  label: string
  amount: number
  valueUsd: number
}

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

export const mockWallet = {
  address: '7Fk2bN1pQ8mZ4vR6tY3wK9sJ7xH2cL5dG8nA1bQ9xQa',
  balance: 2_450_000,
  valueUsd: 11_832,
  pnlPercent: 181.7,
  costBasis: 4_200,
  currentValue: 11_832,
  unrealized: 7_632,
  realized: 1_240,
  pnlSeries: [
    4200, 4380, 4310, 4720, 5100, 4980, 5640, 6210, 6050, 6890, 7520, 7330,
    8210, 8990, 8740, 9580, 10240, 10110, 10980, 11420, 11832,
  ],
  airdropsReceivedTotal: 635_000,
  airdropsReceived: [
    { date: 'jun 28', label: 'weekly holder drop', amount: 250_000, valueUsd: 12_075 },
    { date: 'jun 21', label: 'weekly holder drop', amount: 180_000, valueUsd: 8_694 },
    { date: 'jun 14', label: 'diamond hands bonus', amount: 120_000, valueUsd: 5_796 },
    { date: 'jun 07', label: 'weekly holder drop', amount: 85_000, valueUsd: 4_105 },
  ] as AirdropReceived[],
}
