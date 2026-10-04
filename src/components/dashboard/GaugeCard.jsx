import { Link } from 'react-router-dom'

/**
 * Kartu gauge — frame Figma "Gauges and Meeting Column" (kartu 203x115, r20,
 * padding 14, VERTICAL gap 6).
 *
 * Rekonstruksi: dump node Figma menunjukkan "Gauge 98%" hanya berisi teks
 * "98%" (Inter 700 25/30) — cincinnya digambar sebagai vektor yang tidak
 * terlihat di dump. Susunan di sini: overline 8.5/11 → baris header 40px
 * (cincin 40x40 + angka 25/30) → 2 baris subteks 9.5/12. Urutan grup aslinya
 * (mana teks di "Text Group" vs "Subtext Group") tidak 100% pasti dari dump.
 *
 * Warna memakai #5B61F6 apa adanya sesuai permintaan; konsekuensinya cincin ini
 * di dark mode hanya 2.93:1 terhadap surface (di bawah ambang 3:1 elemen grafis).
 */
export default function GaugeCard({
  overline,
  value,
  label,
  subLines = [],
  tone = 'indigo',
  ctaLabel,
  ctaTo,
  isLoading = false,
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = 16
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col gap-[6px] rounded-[20px] border border-border bg-bg-surface p-[14px]">
      <p className="font-heading text-[8.5px] font-bold uppercase leading-[11px] tracking-wide text-[#94a1b2]">
        {overline}
      </p>

      <div className="flex h-10 items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 -rotate-90" aria-hidden="true">
          <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="5" className="stroke-border" />
          {!isLoading && (
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              stroke={tone === 'blue' ? '#2082f5' : '#5b61f6'}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * pct) / 100}
            />
          )}
        </svg>
        <span className="font-body text-[25px] font-bold leading-[30px] text-text-primary">
          {isLoading ? '-' : `${pct}%`}
        </span>
      </div>

      <div className="flex flex-col gap-[1px]">
        <p className="truncate font-heading text-[10px] font-bold leading-[13px] text-text-primary">
          {label}
        </p>
        {subLines.filter(Boolean).map((line) => (
          <p
            key={line}
            className="truncate font-heading text-[9.5px] leading-[12px] text-[#94a1b2]"
          >
            {line}
          </p>
        ))}
      </div>

      {ctaTo && ctaLabel && (
        <Link
          to={ctaTo}
          className="mt-1 flex h-[26px] w-fit items-center rounded-lg bg-[#5b61f6] px-[10px] font-heading text-[10px] font-bold leading-[13px] text-white no-underline transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
