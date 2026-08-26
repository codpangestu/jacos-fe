import { X } from 'lucide-react'

/** Dialog generik (form atau konfirmasi) — dipakai di layar CRUD & aksi destructive. */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  if (!open) return null

  const width = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-md'

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="fixed inset-0 bg-black/40"
      />
      <div className={`relative w-full ${width} max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-surface p-6 shadow-xl`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-text-primary">{title}</h2>
            {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-text-secondary hover:bg-bg-page"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
