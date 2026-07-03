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

    const body = await req.json().catch(() => ({}))
    const { submissionId, action, points, adminWallet, signature, timestamp } = body

    if (typeof submissionId !== 'number' || !Number.isInteger(submissionId)) {
      return json({ error: 'invalid submissionId' }, 400)
    }
    if (action !== 'approve' && action !== 'reject') {
      return json({ error: 'action must be approve or reject' }, 400)
    }
    const pointsAwarded = action === 'approve' ? Number(points) : 0
    if (action === 'approve' && (!Number.isFinite(pointsAwarded) || pointsAwarded < 0)) {
      return json({ error: 'invalid points' }, 400)
    }
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

    const message = `ansem-hub-admin-review:${submissionId}:${action}:${pointsAwarded}:${timestamp}`

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

    const { data: submission } = await db
      .from('content_submissions')
      .select('id, wallet, x_handle, status')
      .eq('id', submissionId)
      .maybeSingle()
    if (!submission) return json({ error: 'submission not found' }, 404)
    if (submission.status !== 'pending') return json({ error: 'submission already reviewed' }, 409)

    const { error: updateError } = await db
      .from('content_submissions')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        points_awarded: pointsAwarded,
        reviewed_at: new Date().toISOString(),
        reviewer_wallet: adminWallet,
      })
      .eq('id', submissionId)
    if (updateError) throw new Error(updateError.message)

    if (action === 'approve' && pointsAwarded > 0) {
      const { error: rpcError } = await db.rpc('increment_contributor_points', {
        p_wallet: submission.wallet,
        p_delta: pointsAwarded,
        p_x_handle: submission.x_handle,
      })
      if (rpcError) throw new Error(rpcError.message)
    }

    return json({ ok: true, submissionId, status: action === 'approve' ? 'approved' : 'rejected', pointsAwarded })
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
