import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../lib/api'
import NotificationDrawer from './NotificationDrawer'

const VARIANT_STYLES = {
  default: 'relative rounded-full p-2 text-text-secondary hover:bg-primary-300/10',
  hero: 'relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30',
}

/**
 * Bell icon topbar dengan badge unread count (FR-FE-1.5 dst) — klik buka drawer notifikasi dari sisi kanan.
 * `className` opsional buat nambah/override spacing (padding/margin) dari pemanggil, tanpa ubah komponen ini.
 */
export default function NotificationBell({ variant = 'default', className = '' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { data } = useQuery({
    queryKey: ['notifications', 'bell'],
    queryFn: () => apiGet('/api/notifications'),
    refetchInterval: 60_000,
  })

  const unread = data?.unread_count ?? 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${VARIANT_STYLES[variant] ?? VARIANT_STYLES.default} ${className}`}
        aria-label={t('nav.notifications')}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
