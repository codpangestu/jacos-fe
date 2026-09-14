import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, BellOff, Check, ChevronRight, Megaphone } from 'lucide-react'
import Drawer from './ui/Drawer'
import { apiGet, apiPost } from '../lib/api'
import { formatDateTime } from '../lib/format'
import { getUser } from '../lib/auth'

const ANNOUNCEMENT_HISTORY_URL = {
  admin: '/admin/announcements',
  guru: '/guru/announcements',
  staff: '/staff/announcements',
  orang_tua: '/ortu/announcements',
}

/** Panel notifikasi yang keluar dari sisi kanan (ported dari jacos-react Shell.jsx NotificationsDrawer). */
export default function NotificationDrawer({ open, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const announcementHistoryUrl = ANNOUNCEMENT_HISTORY_URL[getUser()?.role]

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'drawer'],
    queryFn: () => apiGet('/api/notifications'),
    enabled: open,
  })

  const items = data?.data ?? []
  const unread = data?.unread_count ?? 0

  async function markRead(id) {
    await apiPost(`/api/notifications/${id}/read`)
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  async function markAllRead() {
    await apiPost('/api/notifications/read-all')
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  function handleItemClick(n, isUnread, url) {
    if (isUnread) markRead(n.id)
    if (!url) return
    onClose()
    navigate(url)
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('nav.notifications')}
      description={t('notifications.unreadCount', { count: unread })}
      headerAction={
        unread > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary-300 hover:bg-primary-300/10"
          >
            <Check size={13} />
            {t('notifications.markAllRead')}
          </button>
        )
      }
      footer={
        announcementHistoryUrl && (
          <button
            type="button"
            onClick={() => {
              onClose()
              navigate(announcementHistoryUrl)
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-semibold text-primary-300 hover:bg-primary-300/10"
          >
            <Megaphone size={15} />
            {t('announcements.viewHistory')}
          </button>
        )
      }
    >
      {isLoading && <p className="px-5 py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <BellOff size={28} className="text-text-secondary" />
          <p className="text-sm text-text-secondary">{t('notifications.allCaughtUp')}</p>
        </div>
      )}

      <ul>
        {items.map((n) => {
          const payload = typeof n.data === 'string' ? JSON.parse(n.data) : (n.data ?? {})
          const isUnread = !n.read_at
          return (
            <li
              key={n.id}
              onClick={() => handleItemClick(n, isUnread, payload.url)}
              className={`flex cursor-pointer items-start gap-3 border-b border-border px-5 py-3.5 last:border-0 hover:bg-bg-page/50 ${
                isUnread ? 'bg-primary-300/5' : ''
              }`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isUnread ? 'bg-primary-300/15 text-primary-300' : 'bg-bg-page text-text-secondary'
                }`}
              >
                <Bell size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-text-primary">
                    {payload.title ?? payload.type ?? n.type?.split('\\').pop() ?? 'Notifikasi'}
                  </p>
                  <span className="shrink-0 text-xs text-text-secondary">{formatDateTime(n.created_at)}</span>
                </div>
                {(payload.message || payload.body) && (
                  <p className="mt-0.5 text-sm text-text-secondary">{payload.message ?? payload.body}</p>
                )}
              </div>
              {payload.url && <ChevronRight size={16} className="mt-1 shrink-0 text-text-secondary" />}
            </li>
          )
        })}
      </ul>
    </Drawer>
  )
}
