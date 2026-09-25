import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BellRing, ClipboardCheck, Send } from 'lucide-react'

/**
 * "Pengingat Input Absensi" (frame Figma "Pengingat Absensi Column").
 *
 * Data dari GET /api/admin/attendance/submission-status. Aksi per-rombel
 * memakai POST /api/admin/classrooms/{id}/attendance/remind.
 *
 * Catatan: tombol "Kirim Pengingat ke Semua" TIDAK punya endpoint bulk di
 * backend — ia memanggil endpoint per-rombel yang sama untuk tiap rombel
 * (lihat handler di AdminDashboard). Jadi tidak ada angka palsu di sini.
 */
export default function AttendanceReminderCard({
  classes = [],
  reminded = {},
  onRemind,
  onRemindAll,
  isPending = false,
  isBulkPending = false,
  viewAllTo,
}) {
  const { t } = useTranslation()
  const count = classes.length

  const statusLabel = (c) => {
    if (c.status === 'not_started') return t('dashboard.reminderNotStarted')
    if (c.status === 'partial') {
      return t('dashboard.reminderPartial', { marked: c.marked, total: c.total_students })
    }
    return t('attendance.holiday')
  }

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardCheck size={17} className="shrink-0 text-text-primary" />
          <h3 className="truncate font-heading text-[15px] font-bold text-text-primary">
            {t('dashboard.reminderTitle')}
          </h3>
          {count > 0 && (
            <span className="shrink-0 rounded-md bg-accent-500/15 px-1.5 py-0.5 text-[11px] font-bold text-accent-fg">
              {t('dashboard.reminderBadge', { count })}
            </span>
          )}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="shrink-0 text-xs font-semibold text-accent-fg no-underline hover:underline"
          >
            {t('dashboard.reminderStatusLink')}
          </Link>
        )}
      </div>

      {count === 0 ? (
        <p className="mt-4 text-[13px] text-text-secondary">{t('dashboard.reminderAllComplete')}</p>
      ) : (
        <>
          <p className="mt-2 text-xs text-text-secondary">
            {t('dashboard.reminderSubtitle', { count })}
          </p>

          <ul className="mt-3 flex flex-col gap-1.5">
            {classes.slice(0, 3).map((c) => {
              const sent = reminded[c.classroom_id]
              const disabled = !c.homeroom_teacher_id || sent || isPending
              return (
                <li
                  key={c.classroom_id}
                  className="flex items-center gap-2 rounded-lg bg-bg-page px-2.5 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-text-primary">
                      {c.classroom_name}
                    </p>
                    <p className="truncate text-[11px] text-text-secondary">
                      {c.homeroom_teacher ?? t('dashboard.noHomeroomTeacher')} · {statusLabel(c)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    title={!c.homeroom_teacher_id ? t('dashboard.noHomeroomTeacher') : undefined}
                    onClick={() => onRemind(c.classroom_id)}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-accent-500/15 px-2 py-1 text-[11px] font-semibold text-accent-fg transition-colors hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <BellRing size={11} />
                    {sent ? t('dashboard.reminderSent') : t('dashboard.reminderAction')}
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            disabled={isBulkPending}
            onClick={onRemindAll}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-accent-500/15 px-3 py-2 text-[11px] font-bold text-accent-fg transition-colors hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={13} />
            {t('dashboard.reminderBroadcast', { count })}
          </button>
        </>
      )}
    </div>
  )
}
