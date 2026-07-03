import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Card } from '../components/ui/Card'
import { useContributors } from '../hooks/useContributors'
import { useHolderVerification } from '../hooks/useHolderVerification'
import { supabase } from '../lib/supabase'
import { formatCompact, shortenAddress } from '../lib/format'
import { cn } from '../lib/cn'

export default function Creators() {
  const { connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const { verified } = useHolderVerification()
  const { contributors, loading } = useContributors()

  const [url, setUrl] = useState('')
  const [handle, setHandle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const address = publicKey?.toBase58() ?? null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address || !url.trim()) return

    setSubmitting(true)
    setSubmitMessage(null)

    const { error } = await supabase.from('content_submissions').insert({
      wallet: address,
      x_handle: handle.trim() || null,
      url: url.trim(),
    })

    setSubmitting(false)
    if (error) {
      setSubmitMessage('something went wrong, try again')
    } else {
      setSubmitMessage('submitted — the team will review it soon')
      setUrl('')
      setHandle('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="disp text-2xl uppercase text-ink-primary">creators</h1>
        <span className="tnum text-xs text-ink-muted">shill $ANSEM, earn points</span>
      </div>

      <Card>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted">submit content</div>
        <p className="mt-1 text-sm text-ink-secondary">
          post about ANSEM on X, paste the link below. the team reviews submissions and awards points that help
          decide who gets airdropped for contributing to the ecosystem.
        </p>

        {!connected ? (
          <button
            onClick={() => setVisible(true)}
            className="disp mt-3 rounded-pill bg-green px-4 py-1.5 text-sm text-black"
          >
            connect wallet to submit
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <input
              type="url"
              required
              placeholder="https://x.com/you/status/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-cell border border-line bg-raised px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint"
            />
            <input
              type="text"
              placeholder="your X handle (optional)"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-cell border border-line bg-raised px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint"
            />
            <button
              type="submit"
              disabled={submitting}
              className="disp w-full rounded-pill bg-green px-4 py-2 text-sm text-black disabled:opacity-50"
            >
              {submitting ? 'submitting…' : 'submit for review'}
            </button>
            {submitMessage && <p className="text-xs text-ink-secondary">{submitMessage}</p>}
          </form>
        )}
      </Card>

      <Card className="p-0">
        <div className="px-4 py-3 text-[10px] uppercase tracking-wider text-ink-muted">top creators</div>
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">loading…</div>
        ) : contributors.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">no approved contributors yet</div>
        ) : (
          <ul className="divide-y divide-line">
            {contributors.map((c, i) => (
              <li
                key={c.wallet}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3',
                  c.wallet === address && 'border-l-2 border-l-green bg-[#0c130c]',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn('disp tnum text-lg', i < 3 ? 'text-green' : 'text-ink-muted')}>{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="tnum truncate text-sm text-ink-primary">{shortenAddress(c.wallet)}</span>
                      {c.wallet === address && verified && (
                        <span className="rounded-pill border border-green/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-green">
                          verified holder
                        </span>
                      )}
                    </div>
                    {c.xHandle && <div className="text-xs text-cyan">{c.xHandle}</div>}
                  </div>
                </div>
                <div className="disp tnum shrink-0 text-sm text-green">{formatCompact(c.totalPoints)} pts</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
