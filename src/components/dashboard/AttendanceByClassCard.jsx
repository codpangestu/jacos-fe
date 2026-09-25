/**
 * Tabel ringkasan kehadiran per kelas hari ini.
 * `rows` = array of { className, hadir, total }
 */
export default function AttendanceByClassCard({ title, rows = [] }) {
  if (!rows.length) return null

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <h3 className="font-heading text-sm font-bold text-text-primary">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const pct = row.total > 0 ? Math.round((row.hadir / row.total) * 100) : 0
          const color =
            pct >= 90
              ? 'var(--color-success-500)'
              : pct >= 70
              ? 'var(--color-accent-500)'
              : 'var(--color-danger-500)'

          return (
            <div key={row.className} className="flex items-center gap-3">
              <span className="w-16 shrink-0 truncate text-[13px] text-text-secondary">
                {row.className}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[13px] font-semibold text-text-primary">
                {row.hadir}/{row.total}
              </span>
              <span
                className="w-10 shrink-0 text-right text-[11px] font-semibold"
                style={{ color }}
              >
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
