import { useEffect } from 'react'
import { X } from 'lucide-react'

/** Panel yang keluar dari sisi kanan layar (dipakai Notification Drawer, dst). */
export default function Drawer({ open, onClose, title, description, headerAction, children, footer }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        aria-label="Tutup"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-100 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 right-0 z-100 flex w-full max-w-md flex-col border-l border-border bg-bg-surface shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              {title && <h2 className="font-heading text-lg font-bold text-text-primary">{title}</h2>}
              {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerAction}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-page"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && <div className="border-t border-border px-5 py-3.5">{footer}</div>}
      </div>
    </>
  )
}
