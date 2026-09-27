import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Info, MoreHorizontal } from 'lucide-react'
import { formatDateTime } from '../../lib/format'

/**
 * Kolom notifikasi — frame Figma "Notifications Column" (380x270, r24,
 * padding 15/16). Isinya persis dua kartu bertumpuk seperti Figma:
 *
 * 1. Kartu agenda (Figma: "Swiped Notification Item" / "White Event Card",
 *    300x92, r20, padding 11/14) — di Figma berisi acara + tanggal + jam.
 *    Belum ada endpoint kalender/agenda untuk admin, jadi isinya kosong.
 * 2. Kartu notifikasi (Figma: "Message Notification Card", 346x86, r20,
 *    padding 11/14) — heading + baris pengirim + kotak cuplikan pesan.
 *
 * Catatan: Figma menggambar kartu pertama dalam keadaan "terswipe" (ada panel
 * aksi di belakangnya). Itu state interaksi, bukan layout, jadi yang dirender
 * adalah bentuk kartunya saja.
 */
export default function NotificationsCard({
  items = [],
  unread = 0,
  isLoading = false,
  onMarkAllRead,
  onItemClick,
}) {
  const { t } = useTranslation()
  const latest = items[0]
  const payload = latest
    ? typeof latest.data === 'string'
      ? JSON.parse(latest.data)
      : (latest.data ?? {})
    : null

  return (
    <div className="flex flex-col gap-[10px] rounded-3xl border border-border bg-bg-surface p-[15px] px-4">
      {/* Header */}
      <div className="flex h-[19px] items-center justify-between gap-3">
        <h3 className="font-body text-[16px] font-bold leading-[19px] text-text-primary">
          {t('dashboard.notificationsTitle')}
        </h3>
        {unread > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex cursor-pointer items-center gap-[5px] text-[12px] font-medium leading-[15px] text-text-secondary transition-colors hover:text-text-primary"
          >
            <Check size={12} />
            {t('dashboard.notificationsClear')}
          </button>
        )}
      </div>

      {/* Kartu agenda — belum ada endpoint kalender/agenda admin */}
      <div className="flex flex-col gap-[5px] rounded-[20px] border border-border bg-bg-surface p-[11px] px-[14px]">
        <div className="flex h-4 items-center justify-between">
          <span className="text-[10px] font-medium leading-[12px] text-[#94a3b8]">
            {t('dashboard.agendaUpcoming')}
          </span>
          <MoreHorizontal size={14} className="text-[#94a3b8]" />
        </div>
        <p className="text-[12px] font-semibold leading-[15px] text-text-primary">
          {t('dashboard.agendaEmpty')}
        </p>
      </div>

      {/* Kartu notifikasi */}
      <div className="flex flex-col gap-[6px] rounded-[20px] border border-border bg-bg-surface p-[11px] px-[14px]">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[12.5px] font-bold leading-[15px] text-text-primary">
            {payload?.title ?? t('dashboard.notificationsEmpty')}
          </p>
          <MoreHorizontal size={14} className="shrink-0 text-[#94a3b8]" />
        </div>

        {isLoading && <p className="text-[10px] text-text-secondary">{t('common.loading')}</p>}

        {!isLoading && payload && (
          <>
            <div className="flex items-center gap-[5px]">
              <Info size={12} className="shrink-0 text-[#94a3b8]" />
              <span className="truncate text-[10px] font-medium leading-[12px] text-[#94a3b8]">
                {t('dashboard.notificationFrom', { time: formatDateTime(latest.created_at) })}
              </span>
            </div>
            <div className="rounded-lg bg-[#f3f3fa] p-[6px] px-[10px] dark:bg-white/5">
              <p className="line-clamp-1 text-[9.5px] leading-[11px] text-[#94a3b8]">
                {payload.message ?? payload.body ?? '-'}
              </p>
            </div>
            <Link
              to={payload.url || '/admin/dashboard'}
              onClick={() => !latest.read_at && onItemClick?.(latest.id)}
              className="text-[10px] font-semibold text-primary-fg no-underline hover:underline"
            >
              {t('common.viewAll')}
            </Link>
          </>
        )}

        {!isLoading && !payload && (
          <p className="text-[10px] leading-[12px] text-[#94a3b8]">
            {t('dashboard.notificationsEmpty')}
          </p>
        )}
      </div>
    </div>
  )
}
