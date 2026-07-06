import { useState } from 'react'
import { DEV_DONATION_WALLET } from '../../lib/ansem'
import { shortenAddress } from '../../lib/format'

export function Footer() {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(DEV_DONATION_WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mt-6 rounded-card border border-dashed border-green/40 bg-[#0a0d0a] p-4">
      <span className="disp text-base uppercase text-ink-primary">donate to ansem hub dev</span>
      <p className="mt-1.5 text-sm text-ink-primary">
        send ANSEM to support the dev — 50% of donations go straight back out as ANSEM giveaways.
      </p>
      <button
        onClick={copy}
        className="tnum mt-3 flex w-full items-center justify-between rounded-cell border border-line bg-raised px-3 py-2 text-sm text-ink-primary hover:border-green"
      >
        <span>{shortenAddress(DEV_DONATION_WALLET)}</span>
        <span className={copied ? 'text-green' : 'text-ink-muted'}>{copied ? 'copied ✓' : 'copy ⧉'}</span>
      </button>

      <div className="mt-4 text-center text-xs text-ink-muted">
        dev:{' '}
        <a
          href="https://x.com/KunaiSol"
          target="_blank"
          rel="noreferrer"
          className="text-ink-primary hover:text-green"
        >
          @KunaiSol
        </a>
      </div>
    </div>
  )
}
