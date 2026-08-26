const STATUS_TONE = {
  success: 'bg-success-500/12 text-success-500',
  danger: 'bg-danger-500/12 text-danger-500',
  accent: 'bg-accent-500/12 text-accent-500',
  neutral: 'bg-text-secondary/12 text-text-secondary',
}

export default function TableCard({ title, viewAllTo, columns, rows }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-text-primary">{title}</h3>
        {viewAllTo && (
          <a href={viewAllTo} className="text-xs font-semibold text-primary-300 hover:underline">
            Lihat semua
          </a>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="pb-2 text-[11px] font-semibold tracking-wide text-text-secondary uppercase"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="py-3 pr-4 text-text-primary">
                    {col.key === 'status' && row.status ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[row.status.tone]}`}
                      >
                        {row.status.label}
                      </span>
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
