import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { extractAirdropRows, type HeliusTransaction } from '../_shared/airdropParsing.ts'

const WEBHOOK_SECRET = Deno.env.get('HELIUS_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!WEBHOOK_SECRET || req.headers.get('authorization') !== WEBHOOK_SECRET) {
      return json({ error: 'unauthorized' }, 401)
    }
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('supabase service credentials not configured')

    const rawBody = await req.text()
    const txs = (JSON.parse(rawBody || '[]')) as HeliusTransaction[]
    if (!Array.isArray(txs)) return json({ error: 'expected an array of transactions' }, 400)

    const rows = extractAirdropRows(txs)
    if (!rows.length) return json({ ok: true, inserted: 0 })

    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { error } = await db
      .from('airdrop_events')
      .upsert(rows, { onConflict: 'tx_signature,wallet,mint', ignoreDuplicates: true })
    if (error) throw new Error(error.message)

    return json({ ok: true, inserted: rows.length })
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
