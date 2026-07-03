import { PublicKey, VersionedTransaction, type Connection } from '@solana/web3.js'

const QUOTE_URL = 'https://lite-api.jup.ag/swap/v1/quote'
const SWAP_URL = 'https://lite-api.jup.ag/swap/v1/swap'

export interface JupiterQuote {
  outAmount: number
  priceImpactPct: number
  raw: unknown
}

// No platform fee for now — confirmed via direct on-chain simulation
// (connection.simulateTransaction with a real funded wallet, not just a
// dry-run build) that Jupiter's classic feeAccount/platformFeeBps mechanism
// fails with a real custom program error (0x1789/InvalidTokenAccount) for
// this specific route (a Meteora "SharedAccountsRoute"), in both swap
// directions, regardless of which token program the fee account uses. A
// custom appended SOL-transfer instruction does work on-chain but triggers a
// Phantom security warning on every swap. The plain swap with zero fee
// parameters simulates cleanly. Revisit fee collection via Jupiter's
// Referral Program (the officially-supported, wallet-recognized mechanism)
// rather than either of the above — see reference memory for details.
export async function fetchSwapQuote(
  inputMint: string,
  outputMint: string,
  amountRaw: number,
): Promise<JupiterQuote> {
  const url = `${QUOTE_URL}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountRaw}&slippageBps=50`
  const res = await fetch(url)
  // A 429 response body isn't guaranteed to be valid JSON, so don't let a
  // parse failure mask the real status code.
  const raw = await res.json().catch(() => ({}))
  if (!res.ok || raw.error) throw new Error(raw.error ?? `quote ${res.status}`)

  return {
    outAmount: raw.outAmount != null ? Number(raw.outAmount) : 0,
    priceImpactPct: raw.priceImpactPct != null ? Number(raw.priceImpactPct) : 0,
    raw,
  }
}

export async function buildSwapTransaction(quote: JupiterQuote, userPublicKey: PublicKey): Promise<VersionedTransaction> {
  const res = await fetch(SWAP_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: quote.raw,
      userPublicKey: userPublicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error ?? `swap ${res.status}`)

  const txBytes = Uint8Array.from(atob(data.swapTransaction), (c) => c.charCodeAt(0))
  return VersionedTransaction.deserialize(txBytes)
}

export async function sendSwapTransaction(
  connection: Connection,
  transaction: VersionedTransaction,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
): Promise<string> {
  const signed = await signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  })

  await confirmBySignaturePolling(connection, signature)
  return signature
}

// connection.confirmTransaction() normally waits on a WebSocket subscription
// for near-instant confirmation, but our RPC endpoint (rpc-proxy, a Supabase
// edge function) is HTTP-only — there's no WS upgrade available at that URL,
// so the WS subscription silently never fires and web3.js falls back to a
// much slower default polling interval. Poll getSignatureStatuses directly
// on a tight interval instead (already an allowed rpc-proxy method) for a
// snappier, predictable "success" instead of waiting on a dead subscription.
async function confirmBySignaturePolling(connection: Connection, signature: string): Promise<void> {
  const POLL_MS = 500
  const TIMEOUT_MS = 45_000
  const start = Date.now()

  while (Date.now() - start < TIMEOUT_MS) {
    const { value } = await connection.getSignatureStatuses([signature])
    const status = value[0]
    if (status) {
      if (status.err) throw new Error(`transaction failed: ${JSON.stringify(status.err)}`)
      if (status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized') return
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }

  throw new Error('confirmation timed out — check the transaction on Solscan before retrying')
}
