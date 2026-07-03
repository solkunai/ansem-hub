import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase'
import { signAdminAction } from '../lib/adminSignature'
import { shortenAddress } from '../lib/format'

interface PendingSubmission {
  id: number
  wallet: string
  x_handle: string | null
  url: string
  submitted_at: string
}

export default function Admin() {
  const { connected, publicKey, signMessage } = useWallet()
  const { setVisible } = useWalletModal()

  const [submissions, setSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [pointsById, setPointsById] = useState<Record<number, number>>({})

  const address = publicKey?.toBase58() ?? null

  const load = useCallback(async () => {
    if (!address || !signMessage) return
    setLoading(true)
    setError(null)

    const { timestamp, signature } = await signAdminAction({
      signMessage,
      parts: ['ansem-hub-admin-list'],
    })

    const { data, error: invokeError } = await supabase.functions.invoke('admin-list-submissions', {
      body: { adminWallet: address, signature, timestamp },
    })

    setLoading(false)
    if (invokeError || data?.error) {
      setError(invokeError?.message ?? data?.error ?? 'failed to load submissions')
      return
    }
    setSubmissions(data.submissions ?? [])
  }, [address, signMessage])

  useEffect(() => {
    if (connected) void load()
  }, [connected, load])

  async function review(id: number, action: 'approve' | 'reject') {
    if (!address || !signMessage) return
    setBusyId(id)

    const points = pointsById[id] ?? 10
    const { timestamp, signature } = await signAdminAction({
      signMessage,
      parts: ['ansem-hub-admin-review', id, action, action === 'approve' ? points : 0],
    })

    const { data, error: invokeError } = await supabase.functions.invoke('admin-review-submission', {
      body: {
        submissionId: id,
        action,
        points: action === 'approve' ? points : 0,
        adminWallet: address,
        signature,
        timestamp,
      },
    })

    setBusyId(null)
    if (invokeError || data?.error) {
      setError(invokeError?.message ?? data?.error ?? 'action failed')
      return
    }
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
  }

  if (!connected) {
    return (
      <div className="space-y-4">
        <h1 className="disp text-2xl text-ink-primary">admin review</h1>
        <button onClick={() => setVisible(true)} className="disp rounded-pill bg-green px-4 py-1.5 text-sm text-black">
          connect wallet
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="disp text-2xl text-ink-primary">admin review</h1>
        <button onClick={() => void load()} className="text-xs text-cyan hover:underline">
          refresh
        </button>
      </div>

      {error && <p className="text-sm text-red">{error}</p>}

      <Card className="p-0">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">loading…</div>
        ) : submissions.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">no pending submissions</div>
        ) : (
          <ul className="divide-y divide-line">
            {submissions.map((s) => (
              <li key={s.id} className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="tnum truncate text-sm text-ink-primary">{shortenAddress(s.wallet)}</span>
                  {s.x_handle && <span className="text-xs text-cyan">{s.x_handle}</span>}
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm text-cyan hover:underline"
                >
                  {s.url} ↗
                </a>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={pointsById[s.id] ?? 10}
                    onChange={(e) => setPointsById((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
                    className="w-20 rounded-cell border border-line bg-raised px-2 py-1 text-sm text-ink-primary"
                  />
                  <button
                    disabled={busyId === s.id}
                    onClick={() => void review(s.id, 'approve')}
                    className="disp rounded-pill bg-green px-3 py-1 text-xs text-black disabled:opacity-50"
                  >
                    approve
                  </button>
                  <button
                    disabled={busyId === s.id}
                    onClick={() => void review(s.id, 'reject')}
                    className="disp rounded-pill border border-red/40 px-3 py-1 text-xs text-red disabled:opacity-50"
                  >
                    reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
