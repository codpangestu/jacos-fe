const inputClass =
  'rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none'

/**
 * Baris filter data-driven untuk layar list/rekap (tanggal, select, dst).
 * `filters`: [{ type: 'date'|'select'|'text', key, label, value, onChange, options?, placeholder? }]
 */
export default function FilterBar({ filters, trailing }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-bg-surface p-4">
      {filters.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          {f.label && <label className="text-xs font-medium text-text-secondary">{f.label}</label>}
          {f.type === 'select' ? (
            <select value={f.value ?? ''} onChange={(e) => f.onChange(e.target.value)} className={inputClass}>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type ?? 'text'}
              value={f.value ?? ''}
              placeholder={f.placeholder}
              onChange={(e) => f.onChange(e.target.value)}
              className={inputClass}
            />
          )}
        </div>
      ))}
      {trailing && <div className="ml-auto flex items-end gap-2">{trailing}</div>}
    </div>
  )
}
