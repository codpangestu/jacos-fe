import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, BellOff, Check } from 'lucide-react'
import { formatDateTime } from '../../lib/format'

/**
 * "Notifikasi Sekolah" (frame Figma "Notifications Column").
 *
 * Payload notifikasi Laravel: { id, data: { title, message, url }, read_at, created_at }.
 * Markup & pemetaan field sengaja disamakan dengan NotificationDrawer supaya
 * satu tipe payload hanya punya satu cara baca.
 */
export default function NotificationsCard({
  items = [],
  unread = 0,
  isLoading = false,
  onMarkAllRead,
  onItemClick,
  viewAllTo,
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col rounded-3xl border border-border bg-bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Bell size={17} className="shrink-0 text-text-primary" />
          <h3 className="truncate font-heading text-[15px] font-bold text-text-primary">
            {t('dashboard.notificationsTitle')}
          </h3>
          {unread > 0 && (
            <span className="shrink-0 rounded-md bg-danger-500/12 px-1.5 py-0.5 text-[11px] font-bold text-danger-fg">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <Check size={12} />
            {t('dashboard.notificationsMarkAll')}
          </button>
        )}
      </div>

      {isLoading && (
        <p className="mt-4 text-xs text-text-secondary">{t('common.loading')}</p>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <BellOff size={22} className="text-text-secondary" />
          <p className="text-xs text-text-secondary">{t('dashboard.notificationsEmpty')}</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-3 flex flex-col">
          {items.map((n) => {
            const payload = typeof n.data === 'string' ? JSON.parse(n.data) : (n.data ?? {})
            const isUnread = !n.read_at
            return (
              <li key={n.id}>
                <Link
                  to={payload.url || viewAllTo || '/admin/dashboard'}
                  onClick={() => isUnread && onItemClick?.(n.id)}
                  className="flex items-start gap-2.5 border-b border-border py-2.5 no-underline last:border-0"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      isUnread ? 'bg-[#5b61f6] dark:bg-[#9a97f5]' : 'bg-border'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[13px] ${
                        isUnread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'
                      }`}
                    >
                      {payload.title ?? payload.type ?? t('nav.notifications')}
                    </p>
                    {(payload.message || payload.body) && (
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
                        {payload.message ?? payload.body}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-text-secondary">
                      {formatDateTime(n.created_at)}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {viewAllTo && items.length > 0 && (
        <Link
          to={viewAllTo}
          className="mt-3 block text-xs font-semibold text-primary-fg no-underline hover:underline"
        >
          {t('common.viewAll')}
        </Link>
      )}
    </div>
  )
}
