// MOCK DATA. Every value here is placeholder from the design handoff.
// Replace each field with a real data source before launch (Helius / price feed /
// Jupiter / indexer). Nothing here is fetched. See the handoff README build checklist.

export interface AirdropReceived {
  date: string
  label: string
  amount: number
  valueUsd: number
}

export interface LeaderboardRow {
  rank: number
  wallet: string
  balance: number
  change24h: number
  daysHeld: number
  dropsReceived: number
  isYou?: boolean
}

export interface FeedRow {
  wallet: string
  handle: string | null
  amount: number
  valueUsd: number
  timeAgo: string
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

export const mockLeaderboard: LeaderboardRow[] = [
  { rank: 1, wallet: '3xQ9...mK2v', balance: 84_200_000, change24h: 2.4, daysHeld: 12, dropsReceived: 4_200_000 },
  { rank: 2, wallet: '9Lz4...8Rnc', balance: 61_800_000, change24h: -1.1, daysHeld: 11, dropsReceived: 3_100_000 },
  { rank: 3, wallet: 'Tk2w...6Bqa', balance: 47_500_000, change24h: 5.8, daysHeld: 12, dropsReceived: 2_400_000 },
  { rank: 4, wallet: 'Hq7m...2Kpv', balance: 38_900_000, change24h: 0.6, daysHeld: 9, dropsReceived: 1_900_000 },
  { rank: 5, wallet: 'Bn5x...9Wts', balance: 29_400_000, change24h: 3.2, daysHeld: 10, dropsReceived: 1_500_000 },
  { rank: 6, wallet: '7Fk2...9xQa', balance: 24_500_000, change24h: 1.4, daysHeld: 8, dropsReceived: 635_000, isYou: true },
  { rank: 7, wallet: 'Pw8r...4Lmn', balance: 18_700_000, change24h: -2.3, daysHeld: 7, dropsReceived: 920_000 },
  { rank: 8, wallet: 'Cx3v...7Hjk', balance: 14_200_000, change24h: 4.1, daysHeld: 11, dropsReceived: 740_000 },
  { rank: 9, wallet: 'Mz6q...1Ddp', balance: 11_900_000, change24h: 0.9, daysHeld: 6, dropsReceived: 610_000 },
  { rank: 10, wallet: 'Rt4n...5Ffs', balance: 9_600_000, change24h: -0.4, daysHeld: 9, dropsReceived: 480_000 },
]

export const mockFeed = {
  sentToday: 1_280_000,
  recipients: 41,
  avgDrop: 9_300,
  rows: [
    { wallet: 'Hq7m...2Kpv', handle: '@degenmike', amount: 250_000, valueUsd: 12_075, timeAgo: '4s ago' },
    { wallet: '9Lz4...8Rnc', handle: null, amount: 100_000, valueUsd: 4_830, timeAgo: '31s ago' },
    { wallet: 'Tk2w...6Bqa', handle: '@solbull_eth', amount: 500_000, valueUsd: 24_150, timeAgo: '1m ago' },
    { wallet: 'Bn5x...9Wts', handle: null, amount: 75_000, valueUsd: 3_622, timeAgo: '2m ago' },
    { wallet: 'Pw8r...4Lmn', handle: '@trenchrat', amount: 320_000, valueUsd: 15_456, timeAgo: '3m ago' },
    { wallet: 'Cx3v...7Hjk', handle: null, amount: 45_000, valueUsd: 2_173, timeAgo: '5m ago' },
    { wallet: 'Mz6q...1Ddp', handle: '@bagholder99', amount: 180_000, valueUsd: 8_694, timeAgo: '6m ago' },
  ] as FeedRow[],
}
