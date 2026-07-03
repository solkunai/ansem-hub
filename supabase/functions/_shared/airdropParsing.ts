import { ANSEM_MINT, ANSEM_CREATOR_WALLET } from './constants.ts'

export const SOL_AIRDROP_MIN_LAMPORTS = 1_000_000_000 // only SOL sends above 1 SOL count

export interface HeliusTokenTransfer {
  fromUserAccount?: string
  toUserAccount?: string
  tokenAmount?: number
  mint?: string
}

export interface HeliusNativeTransfer {
  fromUserAccount?: string
  toUserAccount?: string
  amount?: number
}

export interface HeliusTransaction {
  signature: string
  timestamp: number
  type?: string
  tokenTransfers?: HeliusTokenTransfer[]
  nativeTransfers?: HeliusNativeTransfer[]
}

export interface AirdropRow {
  tx_signature: string
  wallet: string
  amount: number
  mint: string
  created_at: string
}

export function extractAirdropRows(txs: HeliusTransaction[]): AirdropRow[] {
  return txs.flatMap((tx): AirdropRow[] => {
    const createdAt = new Date(tx.timestamp * 1000).toISOString()

    const ansemRows: AirdropRow[] = (tx.tokenTransfers ?? [])
      .filter(
        (t) =>
          t.mint === ANSEM_MINT &&
          t.fromUserAccount === ANSEM_CREATOR_WALLET &&
          !!t.toUserAccount &&
          t.toUserAccount !== ANSEM_CREATOR_WALLET &&
          typeof t.tokenAmount === 'number' &&
          t.tokenAmount > 0,
      )
      .map((t) => ({
        tx_signature: tx.signature,
        wallet: t.toUserAccount as string,
        amount: t.tokenAmount as number,
        mint: ANSEM_MINT,
        created_at: createdAt,
      }))

    const solRows: AirdropRow[] = (tx.nativeTransfers ?? [])
      .filter(
        (t) =>
          t.fromUserAccount === ANSEM_CREATOR_WALLET &&
          !!t.toUserAccount &&
          t.toUserAccount !== ANSEM_CREATOR_WALLET &&
          typeof t.amount === 'number' &&
          t.amount > SOL_AIRDROP_MIN_LAMPORTS,
      )
      .map((t) => ({
        tx_signature: tx.signature,
        wallet: t.toUserAccount as string,
        amount: (t.amount as number) / 1e9,
        mint: 'SOL',
        created_at: createdAt,
      }))

    return [...ansemRows, ...solRows]
  })
}
