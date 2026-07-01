export function shortenAddress(addr: string, lead = 4, tail = 4): string {
  if (addr.length <= lead + tail + 1) return addr
  return `${addr.slice(0, lead)}…${addr.slice(-tail)}`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatCompact(n: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: maxFractionDigits,
  }).format(n)
}

export function formatUsd(n: number, compact = false): string {
  if (compact) {
    return '$' + formatCompact(n)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatPercent(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

export function formatSignedNumber(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${formatNumber(n)}`
}
