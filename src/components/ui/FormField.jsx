const baseInputClass =
  'w-full rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none disabled:opacity-60'

/**
 * Wrapper label+input/select/textarea+error seragam untuk form CRUD/ajuan.
 * `as`: 'input' (default) | 'select' | 'textarea'. Props lain diteruskan ke elemen.
 */
export default function FormField({ label, htmlFor, error, required, as = 'input', children, className = '', ...props }) {
  const Tag = as

  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-danger-500"> *</span>}
        </label>
      )}
      {as === 'select' ? (
        <select id={htmlFor} className={baseInputClass} {...props}>
          {children}
        </select>
      ) : (
        <Tag id={htmlFor} className={baseInputClass} {...props} />
      )}
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  )
}
