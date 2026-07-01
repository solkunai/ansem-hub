export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const w = 100
  const h = 32
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <path d={area} fill="#4FE05D" fillOpacity="0.12" />
      <path d={line} fill="none" stroke="#4FE05D" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
