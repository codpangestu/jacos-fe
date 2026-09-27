import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Link2, Pencil, Users } from 'lucide-react'

/**
 * "Today Tasks - Classroom Attendance" — frame Figma 574x318, r24, padding 16/18.
 *
 * Struktur baris persis Figma: [nama + meta] … [persen + track 70x6 r999
 * #E2E8F0 berisi fill #5B61F6] … ["N Belum"] dengan justify-between.
 *
 * Dua hal yang diganti sadar:
 * - Emoji di Figma (👥👥+ untuk legenda, ✏️ Edit, 🔗 Share) jadi ikon lucide,
 *   karena konvensi ikon project ini `lucide-react` saja.
 * - Fill bar pakai #5B61F6 apa adanya (sesuai permintaan "warna persis Figma"),
 *   sehingga di dark mode kontrasnya di bawah ambang 3:1 untuk elemen grafis.
 */
export default function ClassStatusCard({ title, rows = [], viewAllTo }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-bg-surface p-4 px-[18px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Users size={16} className="shrink-0 text-text-primary" />
          <h3 className="truncate font-body text-[14px] font-bold leading-[17px] text-text-primary">
            {title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-[11px] font-medium leading-[13px] text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <Pencil size={11} />
            {t('common.edit')}
          </span>
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="flex items-center gap-1 text-[11px] font-medium leading-[13px] text-[#94a3b8] no-underline hover:text-text-primary"
            >
              <Link2 size={11} />
              {t('common.viewAll')}
            </Link>
          )}
        </div>
      </div>

      <ul className="mt-4 flex flex-1 flex-col justify-between gap-3">
        {rows.map((r) => (
          <li key={r.id} className="flex h-[26px] items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-[2px]">
              <p className="truncate font-body text-[11px] font-bold leading-[13px] text-text-primary">
                {r.name}
              </p>
              <p className="truncate font-body text-[9px] leading-[11px] text-text-secondary">
                {r.meta}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-[10px]">
              <span className="font-body text-[10px] font-bold leading-[12px] text-text-primary">
                {r.pct}%
              </span>
              <span className="block h-[6px] w-[70px] overflow-hidden rounded-full bg-[#e2e8f0] dark:bg-white/15">
                <span
                  className="block h-full rounded-full bg-[#5b61f6]"
                  style={{ width: `${r.pct}%` }}
                />
              </span>
            </div>

            <span className="w-16 shrink-0 text-right font-body text-[9px] font-medium leading-[11px] text-text-secondary">
              {r.trailing}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
