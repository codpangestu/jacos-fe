import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff, Check } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet, apiPost } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { getUser } from '../../lib/auth'

export default function NotificationCenter() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const user = getUser()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => apiGet('/api/notifications', { page }),
  })

  async function markRead(id) {
    await apiPost(`/api/notifications/${id}/read`)
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  async function markAllRead() {
    await apiPost('/api/notifications/read-all')
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const items = data?.data ?? []
  const unread = data?.unread_count ?? 0

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS[user?.role] ?? []}
      pageTitle={t('nav.notifications')}
      pageSubtitle={unread > 0 ? t('notifications.unreadCount', { count: unread }) : undefined}
      showSearch={false}
    >
      <div className="rounded-2xl border border-border bg-bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-base font-bold text-text-primary">{t('nav.notifications')}</h2>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm font-medium text-primary-300 hover:underline"
            >
              <Check size={15} />
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>

        {isLoading && <p className="px-5 py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <BellOff size={32} className="text-text-secondary" />
            <p className="text-sm text-text-secondary">{t('common.noData')}</p>
          </div>
        )}

        <ul>
          {items.map((n) => {
            const payload = typeof n.data === 'string' ? JSON.parse(n.data) : (n.data ?? {})
            const isUnread = !n.read_at
            return (
              <li
                key={n.id}
                onClick={() => isUnread && markRead(n.id)}
                className={`flex cursor-pointer items-start gap-3 border-b border-border px-5 py-4 last:border-0 hover:bg-bg-page/50 ${
                  isUnread ? 'bg-primary-300/5' : ''
                }`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isUnread ? 'bg-primary-300/15 text-primary-300' : 'bg-bg-page text-text-secondary'
                  }`}
                >
                  <Bell size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">
                    {payload.title ?? payload.type ?? n.type?.split('\\').pop() ?? 'Notifikasi'}
                  </p>
                  {(payload.message || payload.body) && (
                    <p className="mt-0.5 text-sm text-text-secondary">{payload.message ?? payload.body}</p>
                  )}
                  <p className="mt-1 text-xs text-text-secondary">{formatDateTime(n.created_at)}</p>
                </div>
                {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-300" />}
              </li>
            )
          })}
        </ul>

        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm text-text-secondary">
            <span>
              {data.current_page}/{data.last_page}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                disabled={page >= data.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
              >
                {t('common.viewAll')}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
