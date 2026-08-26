import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../lib/api'

/** Bell icon topbar dengan badge unread count (FR-FE-1.5 dst) — polling ringan, push delivery beneran belum aktif. */
export default function NotificationBell() {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: ['notifications', 'bell'],
    queryFn: () => apiGet('/api/notifications'),
    refetchInterval: 60_000,
  })

  const unread = data?.unread_count ?? 0

  return (
    <Link
      to="/notifications"
      className="relative rounded-full p-2 text-text-secondary hover:bg-primary-300/10"
      aria-label={t('nav.notifications')}
    >
      <Bell size={20} />
      {unread > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
