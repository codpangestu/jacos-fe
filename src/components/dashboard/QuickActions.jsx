import { Link } from 'react-router-dom'

/**
 * Baris tombol shortcut ke halaman yang paling sering diakses admin.
 * `actions` = array of { label, to, icon: LucideIcon, badge? }
 */
export default function QuickActions({ actions }) {
  if (!actions?.length) return null

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        Aksi Cepat
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map(({ label, to, icon: Icon, badge }) => (
          <Link
            key={to}
            to={to}
            className="relative flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-page px-3 py-4 text-center text-sm font-medium text-text-primary no-underline transition-colors hover:bg-primary-300/8 hover:text-primary-fg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-300/12 text-primary-fg">
              <Icon size={20} />
            </span>
            <span className="leading-tight">{label}</span>
            {badge > 0 && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
