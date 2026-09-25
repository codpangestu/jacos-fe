import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'

/**
 * "Status Rombel Kelas" (frame Figma "Today Tasks - Classroom Attendance").
 *
 * `rows[]` = { id, name, meta, pct, trailing }. Figma memakai satu warna bar
 * (#5B61F6) untuk semua baris — jadi tidak ada color-coding per persentase di
 * sini; beda dengan AttendanceByClassCard versi lama yang hijau/kuning/merah.
 */
export default function ClassStatusCard({ title, rows = [], viewAllTo }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Users size={17} className="shrink-0 text-text-primary" />
          <h3 className="truncate font-heading text-[15px] font-bold text-text-primary">{title}</h3>
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="shrink-0 text-xs font-semibold text-primary-fg no-underline hover:underline"
          >
            {t('common.viewAll')}
          </Link>
        )}
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-3">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-primary">{r.name}</p>
              <p className="truncate text-[11px] text-text-secondary">{r.meta}</p>
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-bold text-text-primary">
              {r.pct}%
            </span>
            {/* Bar pakai versi indigo lebih terang di dark: #5b61f6 di atas
                surface dark hanya 2.93:1, di bawah ambang 3:1 elemen non-teks. */}
            <div className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-border sm:block">
              <div
                className="h-full rounded-full bg-[#5b61f6] dark:bg-[#9a97f5]"
                style={{ width: `${r.pct}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-[11px] text-text-secondary">
              {r.trailing}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
