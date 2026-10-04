import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BellRing, ClipboardCheck, Send } from 'lucide-react'

/**
 * "Pengingat Absensi Column" — frame Figma 400x260, r24, padding 16/18.
 *
 * Ukuran dari Figma: header 24px, badge r6, baris kelas 34px r8, tombol
 * "Ingatkan" 23px r6, tombol broadcast 32px r10, jarak list 5px.
 *
 * Warna amber ditulis sebagai token `accent-500/15` + `accent-fg` alih-alih
 * hex #FEF3C7/#D97706/#92400E: nilainya nyaris identik (tint-nya terukur sama
 * dalam 2 satuan dan `accent-fg` light memang #92400E persis), tapi token ini
 * punya varian dark sehingga kartunya tidak jadi blok terang di mode gelap.
 * Baris kelas pakai `bg-bg-page` (= #F7F9FC, praktis sama dengan #F8FAFC Figma)
 * untuk alasan yang sama.
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
    <div className="flex flex-col gap-[8px] rounded-3xl border border-border bg-bg-surface p-4 px-[18px]">
      {/* Header */}
      <div className="flex h-6 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-[6px]">
          <ClipboardCheck size={16} className="shrink-0 text-[#1e1b4b] dark:text-text-primary" />
          <h3 className="truncate font-heading text-[14px] font-bold leading-[18px] text-[#1e1b4b] dark:text-text-primary">
            {t('dashboard.reminderTitle')}
          </h3>
          {count > 0 && (
            <span className="shrink-0 rounded-md bg-accent-500/15 px-[6px] py-[2px] font-heading text-[8.5px] font-bold leading-[11px] text-accent-fg">
              {t('dashboard.reminderBadge', { count })}
            </span>
          )}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="shrink-0 font-heading text-[11px] font-semibold leading-[14px] text-accent-fg no-underline hover:underline"
          >
            {t('dashboard.reminderStatusLink')}
          </Link>
        )}
      </div>

      {count === 0 ? (
        <p className="font-heading text-[10.5px] leading-[13px] text-text-secondary">
          {t('dashboard.reminderAllComplete')}
        </p>
      ) : (
        <>
          <p className="font-heading text-[10.5px] leading-[13px] text-text-secondary">
            {t('dashboard.reminderSubtitle', { count })}
          </p>

          <ul className="flex flex-col gap-[5px]">
            {classes.slice(0, 3).map((c) => {
              const sent = reminded[c.classroom_id]
              const disabled = !c.homeroom_teacher_id || sent || isPending
              return (
                <li
                  key={c.classroom_id}
                  className="flex h-[34px] items-center justify-between gap-2 rounded-lg bg-bg-page px-[10px] py-[6px]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="shrink-0 rounded bg-[#5b61f6]/12 px-1.5 py-0.5 font-heading text-[9px] font-bold text-[#1e1b4b] dark:text-text-primary">
                      {c.classroom_name}
                    </span>
                    <span className="truncate font-heading text-[9.5px] leading-[12px] text-text-secondary">
                      {c.homeroom_teacher ?? t('dashboard.noHomeroomTeacher')} · {statusLabel(c)}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    title={!c.homeroom_teacher_id ? t('dashboard.noHomeroomTeacher') : undefined}
                    onClick={() => onRemind(c.classroom_id)}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md bg-accent-500/15 px-2 py-1 font-heading text-[9px] font-bold leading-[11px] text-accent-fg transition-colors hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-40"
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
            className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-accent-500/15 px-3 font-heading text-[10.5px] font-bold leading-[13px] text-accent-fg transition-colors hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={13} />
            {t('dashboard.reminderBroadcast', { count })}
          </button>
        </>
      )}
    </div>
  )
}
