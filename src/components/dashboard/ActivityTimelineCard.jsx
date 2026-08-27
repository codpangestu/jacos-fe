/** Timeline vertikal riwayat aktivitas (ported dari jacos-react admin/Dashboard.jsx "Recent activity"). */
export default function ActivityTimelineCard({ title, viewAllTo, items }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-heading text-sm font-bold text-text-primary">{title}</h3>
        {viewAllTo && (
          <a href={viewAllTo} className="text-xs font-semibold text-primary-300 hover:underline">
            Lihat semua
          </a>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-text-secondary">-</p>
      ) : (
        <div className="relative mt-4 pl-6">
          <div className="absolute top-1.5 bottom-1.5 left-[7px] w-0.5 bg-border" />
          {items.map((item, i) => (
            <div key={i} className="relative pb-4 last:pb-0">
              <div className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full border-2 border-primary-300 bg-bg-surface" />
              <p className="text-xs text-text-secondary">{item.time}</p>
              <p className="text-sm font-semibold text-text-primary">{item.who}</p>
              <p className="text-sm text-text-secondary">{item.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
