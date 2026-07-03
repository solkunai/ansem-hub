import { createClient } from 'jsr:@supabase/supabase-js@2'
import nacl from 'npm:tweetnacl@1.0.3'
import bs58 from 'npm:bs58@5.0.0'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
const SIGNATURE_MAX_AGE_MS = 5 * 60 * 1000
const CLOCK_SKEW_TOLERANCE_MS = 30 * 1000

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('supabase service credentials not configured')

    const { adminWallet, signature, timestamp } = await req.json().catch(() => ({}))

    if (typeof adminWallet !== 'string' || !BASE58.test(adminWallet)) {
      return json({ error: 'invalid adminWallet' }, 400)
    }
    if (typeof signature !== 'string' || typeof timestamp !== 'number') {
      return json({ error: 'missing signature or timestamp' }, 400)
    }

    const now = Date.now()
    if (timestamp > now + CLOCK_SKEW_TOLERANCE_MS || now - timestamp > SIGNATURE_MAX_AGE_MS) {
      return json({ error: 'signature expired, please retry' }, 401)
    }

    const message = `ansem-hub-admin-list:${timestamp}`
    let signatureValid = false
    try {
      signatureValid = nacl.sign.detached.verify(
        new TextEncoder().encode(message),
        base64ToBytes(signature),
        bs58.decode(adminWallet),
      )
    } catch {
      signatureValid = false
    }
    if (!signatureValid) return json({ error: 'invalid signature' }, 401)

    const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: admin } = await db.from('admin_wallets').select('wallet').eq('wallet', adminWallet).maybeSingle()
    if (!admin) return json({ error: 'not an admin wallet' }, 403)

    const { data: submissions, error } = await db
      .from('content_submissions')
      .select('id, wallet, x_handle, url, status, points_awarded, submitted_at')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
    if (error) throw new Error(error.message)

    return json({ submissions: submissions ?? [] })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'unexpected error' }, 500)
  }
})

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}
