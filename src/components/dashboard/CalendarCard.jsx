import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarRange } from 'lucide-react'
import { formatPeriod, weekdaysShort } from '../../lib/format'

/**
 * Kolom kalender — frame Figma "Calendar & Schedule Column" (397x260, r24,
 * padding 16/18).
 *
 * Yang nyata: header bulan ("September 2026", Inter 700 14/17) dan strip 7 hari
 * (label hari Inter 400 9/11 #94a3b8, tanggal Inter 500 10/12 #1e293b, hari ini
 * jadi pill #5B61F6). Dihitung dari tanggal sekarang, bukan data server.
 * Panah ‹ › di Figma berfungsi untuk pindah minggu.
 *
 * Yang kosong: daftar jadwalnya (Figma menampilkan 2 entri: istirahat & siklus
 * penjemputan). Belum ada endpoint kalender akademik untuk admin — hari libur
 * pun hanya bisa diambil per tahun ajaran, bukan rentang minggu.
 */
export default function CalendarCard() {
  const { t } = useTranslation()
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Monday-first, seperti Figma (Mon..Sun)
  const mondayFirst = [1, 2, 3, 4, 5, 6, 0]
  const labels = weekdaysShort()

  const startOfWeek = new Date(today)
  const isoDay = (today.getDay() + 6) % 7 // Senin = 0
  startOfWeek.setDate(today.getDate() - isoDay + weekOffset * 7)

  const days = mondayFirst.map((weekday, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return {
      label: labels[weekday],
      date,
      isToday: date.toDateString() === today.toDateString(),
    }
  })

  const monthLabel = formatPeriod(
    `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}`,
  )

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-bg-surface p-4 px-[18px]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-body text-[14px] font-bold leading-[17px] text-text-primary">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label={t('dashboard.calendarPrevWeek')}
            className="cursor-pointer px-0.5 text-[14px] font-bold leading-none text-[#94a3b8] transition-colors hover:text-text-primary"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            aria-label={t('dashboard.calendarNextWeek')}
            className="cursor-pointer px-0.5 text-[14px] font-bold leading-none text-[#94a3b8] transition-colors hover:text-text-primary"
          >
            ›
          </button>
        </div>
      </div>

      {/* Week strip */}
      <ul className="mt-3 flex items-center justify-between gap-1">
        {days.map((d) => (
          <li key={d.date.toISOString()} className="flex flex-col items-center gap-[4px]">
            <span className="text-[9px] leading-[11px] text-[#94a3b8]">{d.label}</span>
            {d.isToday ? (
              <span className="flex h-[12px] min-w-[22px] items-center justify-center rounded-full bg-[#5b61f6] px-1 text-[10px] font-medium leading-none text-white">
                {d.date.getDate()}
              </span>
            ) : (
              <span className="text-[10px] font-medium leading-[12px] text-[#1e293b] dark:text-text-secondary">
                {d.date.getDate()}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Jadwal — belum ada endpoint kalender akademik admin */}
      <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg bg-bg-page/60 py-4 text-center">
        <CalendarRange size={16} className="text-[#94a3b8]" />
        <p className="max-w-[28ch] text-[9.5px] leading-[11px] text-[#94a3b8]">
          {t('dashboard.calendarEmpty')}
        </p>
      </div>
    </div>
  )
}
