import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { ANSEM_CREATOR_WALLET } from '../_shared/constants.ts'
import { extractAirdropRows, type HeliusTransaction } from '../_shared/airdropParsing.ts'

// One-off maintenance endpoint: the helius-webhook only started receiving
// live calls when it was first deployed, so any airdrops sent before that
// point were never recorded. This walks the creator wallet's transaction
// history from Helius's Enhanced Transactions API and backfills the same
// airdrop_events table the webhook writes to (same upsert/unique constraint,
// so it's safe to re-run — duplicates are ignored).
//
// Gated by a dedicated admin secret (not the public anon key) since each
// page costs Helius Enhanced API credits — capped by MAX_PAGES regardless of
// how many times this is triggered.
const ADMIN_SECRET = Deno.env.get('BACKFILL_ADMIN_SECRET')
const HELIUS_RPC_URL = Deno.env.get('HELIUS_RPC_URL')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const PAGE_SIZE = 100
const MAX_PAGES = 20 // hard cap: 20 * 100 = 2,000 historical txs per run

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!ADMIN_SECRET || req.headers.get('authorization') !== ADMIN_SECRET) {
      return json({ error: 'unauthorized' }, 401)
    }
    if (!HELIUS_RPC_URL) throw new Error('HELIUS_RPC_URL not configured')
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('supabase service credentials not configured')

    const apiKey = new URL(HELIUS_RPC_URL).searchParams.get('api-key')
    if (!apiKey) throw new Error('could not extract api-key from HELIUS_RPC_URL')

    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Optional resume cursor so a run that hits a rate limit partway through
    // can be continued from where it left off, instead of only ever walking
    // the most recent history.
    const body = await req.text()
    const parsed = body ? (JSON.parse(body) as { before?: string }) : {}

    let before: string | undefined = parsed.before
    let totalFetched = 0
    let totalInserted = 0
    let pages = 0

    for (; pages < MAX_PAGES; pages++) {
      const url = new URL(`https://api.helius.xyz/v0/addresses/${ANSEM_CREATOR_WALLET}/transactions`)
      url.searchParams.set('api-key', apiKey)
      url.searchParams.set('limit', String(PAGE_SIZE))
      if (before) url.searchParams.set('before', before)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`helius history fetch failed: ${res.status} ${await res.text()}`)

      const txs = (await res.json()) as HeliusTransaction[]
      if (!Array.isArray(txs) || txs.length === 0) break

      totalFetched += txs.length
      const rows = extractAirdropRows(txs)

      if (rows.length) {
        const { error, count } = await db
          .from('airdrop_events')
          .upsert(rows, { onConflict: 'tx_signature,wallet,mint', ignoreDuplicates: true, count: 'exact' })
        if (error) throw new Error(error.message)
        totalInserted += count ?? rows.length
      }

      before = txs[txs.length - 1]?.signature
      if (txs.length < PAGE_SIZE) break // reached the end of history
    }

    return json({ ok: true, pages, totalFetched, totalInserted })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'unexpected error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}
