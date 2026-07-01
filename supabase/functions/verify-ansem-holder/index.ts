import { corsHeaders } from '../_shared/cors.ts'

const ANSEM_MINT = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump'
const HELIUS_RPC_URL = Deno.env.get('HELIUS_RPC_URL')
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!HELIUS_RPC_URL) throw new Error('HELIUS_RPC_URL not configured')

    const { owner } = await req.json().catch(() => ({}))
    if (typeof owner !== 'string' || !BASE58.test(owner)) {
      return json({ error: 'invalid owner address' }, 400)
    }

    const res = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'ansem-verify',
        method: 'getTokenAccountsByOwner',
        params: [owner, { mint: ANSEM_MINT }, { encoding: 'jsonParsed' }],
      }),
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message ?? 'rpc error')

    let balance = 0
    for (const acc of data.result?.value ?? []) {
      const amount = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount
      if (typeof amount === 'number') balance += amount
    }

    return json({ verified: balance > 0, balance, mint: ANSEM_MINT })
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
