import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const TONE_STYLES = {
  primary: 'bg-primary-300/12 text-primary-300 dark:bg-primary-300/18',
  accent: 'bg-accent-500/12 text-accent-500 dark:bg-accent-500/18',
  success: 'bg-success-500/12 text-success-500 dark:bg-success-500/18',
  navy: 'bg-primary-900/8 text-primary-900 dark:bg-white/10 dark:text-white',
  danger: 'bg-danger-500/12 text-danger-500 dark:bg-danger-500/18',
}

/**
 * Grid tile kecil (icon+angka+label) di dalam 1 kartu — versi padat dari StatCard,
 * meniru grid "Rasio Bulan Agustus" di referensi m.jacos.id. Kolom fixed
 * (bukan breakpoint viewport) supaya aman dipakai di dalam MobileAppShell yang
 * lebarnya terkunci ~480px terlepas dari lebar browser sungguhan.
 */
export default function StatMiniGrid({ title, viewAllTo, columns = 3, items }) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-bold text-text-primary">{title}</p>
          {viewAllTo && (
            <Link to={viewAllTo} className="text-xs font-semibold text-primary-300 hover:underline">
              {t('common.viewAll')}
            </Link>
          )}
        </div>
      )}
      <div className={`grid gap-2.5 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl p-3 ${TONE_STYLES[item.tone ?? 'primary']}`}>
            <div className="flex items-center gap-1.5">
              {item.icon && <item.icon size={14} />}
              <p className="text-lg font-extrabold leading-none">{item.value}</p>
            </div>
            <p className="mt-1.5 truncate text-[10px] font-semibold uppercase leading-tight opacity-80">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
