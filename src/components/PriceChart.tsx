export function PriceChart({ pairAddress }: { pairAddress: string | null }) {
  if (!pairAddress) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-card border border-line bg-panel text-sm text-ink-muted">
        loading chart…
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-card border border-line">
      <iframe
        title="ANSEM price chart"
        src={`https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&trades=0&info=0`}
        className="h-[360px] w-full"
        loading="lazy"
      />
    </div>
  )
}
