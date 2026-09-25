import { Link } from 'react-router-dom'

// Warna ring mengikuti dua aksen frame Figma: indigo (presensi) & biru (SPP).
// Dipasang sebagai className (bukan atribut `stroke`) supaya bisa punya varian
// dark: — indigo #5b61f6 di atas surface dark hanya 2.93:1, gagal ambang 3:1
// untuk elemen grafis, jadi di dark naik ke #9a97f5 (5.30:1).
const RING_CLASS = {
  indigo: 'stroke-[#5b61f6] dark:stroke-[#9a97f5]',
  blue: 'stroke-[#2082f5]',
}

/**
 * Kartu gauge ring (frame Figma "Gauges and Meeting Column", kartu 203x115).
 * `value` adalah persentase 0-100. `caption` untuk denominator (mis. "306 dari
 * 312 siswa hadir") supaya angkanya tidak menggantung tanpa konteks.
 */
export default function GaugeCard({
  label,
  value,
  caption,
  tone = 'indigo',
  ctaLabel,
  ctaTo,
  isLoading = false,
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = 16
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col rounded-[20px] border border-border bg-bg-surface p-4">
      <div className="flex items-center gap-3">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="shrink-0 -rotate-90"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="5" className="stroke-border" />
          {!isLoading && (
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              className={RING_CLASS[tone] ?? RING_CLASS.indigo}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * pct) / 100}
            />
          )}
        </svg>

        <div className="min-w-0">
          <p className="font-heading text-lg font-bold leading-tight text-text-primary">
            {isLoading ? '-' : `${pct}%`}
          </p>
          <p className="truncate text-[11px] font-semibold text-text-primary">{label}</p>
        </div>
      </div>

      {caption && <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{caption}</p>}

      {ctaTo && ctaLabel && (
        <Link
          to={ctaTo}
          className="mt-3 text-[11px] font-semibold text-primary-fg no-underline hover:underline"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
