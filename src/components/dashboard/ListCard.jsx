export default function ListCard({ title, subtitle, items, viewAllTo }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-sm font-bold text-text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <a href={viewAllTo} className="text-xs font-semibold text-primary-300 hover:underline">
            Lihat semua
          </a>
        )}
      </div>

      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <li key={item.primary} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-xs font-semibold text-primary-300">
              {item.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{item.primary}</p>
              <p className="truncate text-xs text-text-secondary">{item.secondary}</p>
            </div>
            {item.trailing}
          </li>
        ))}
      </ul>
    </div>
  )
}
