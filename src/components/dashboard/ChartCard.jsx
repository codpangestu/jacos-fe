const WIDTH = 700
const HEIGHT = 220
const PADDING = 12

function buildPath(data) {
  const max = 100
  const step = (WIDTH - PADDING * 2) / (data.length - 1)
  const points = data.map((value, i) => {
    const x = PADDING + i * step
    const y = PADDING + (1 - value / max) * (HEIGHT - PADDING * 2)
    return [x, y]
  })
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const area = `${line} L${points[points.length - 1][0]},${HEIGHT} L${points[0][0]},${HEIGHT} Z`
  return { line, area }
}

export default function ChartCard({ title, labels, series }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-sm font-bold text-text-primary">{title}</h3>
        <div className="flex items-center gap-4">
          {series.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 w-full" preserveAspectRatio="none">
        <defs>
          {series.map((s) => (
            <linearGradient key={s.label} id={`grad-${s.label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {series.map((s) => {
          const { line, area } = buildPath(s.data)
          return (
            <g key={s.label}>
              <path d={area} fill={`url(#grad-${s.label})`} />
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )
        })}
      </svg>

      <div className="mt-2 flex justify-between text-[11px] text-text-secondary">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
