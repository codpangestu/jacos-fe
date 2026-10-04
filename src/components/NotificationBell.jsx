import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiGet } from '../lib/api'
import NotificationDrawer from './NotificationDrawer'

const VARIANT_STYLES = {
  default: 'relative rounded-full p-2 text-text-secondary hover:bg-primary-300/10',
  hero: 'relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30',
  // Ikon polos + dot pink (tanpa angka) — sesuai frame Figma "Dashboard ortu (mobile first)" Tab 1
  dot: 'relative flex h-9 w-9 items-center justify-center rounded-full text-[#1F2937] hover:bg-black/5',
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
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unread > 0 && variant === 'dot' && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FB7185]" />
        )}
        {unread > 0 && variant !== 'dot' && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
