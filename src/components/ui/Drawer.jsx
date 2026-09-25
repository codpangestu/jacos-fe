import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Panel yang keluar dari sisi kanan layar (dipakai Notification Drawer, dst).
 *
 * Panelnya selalu ter-mount supaya animasi slide-nya jalan, jadi saat tertutup
 * dia diberi `inert` + `aria-hidden` dan `role="dialog"`-nya dilepas: kontrol di
 * dalamnya tidak ikut urutan Tab dan tidak diumumkan pembaca layar. Tanpa ini
 * setiap halaman dashboard membawa modal tak terlihat yang bisa di-Tab.
 *
 * Catatan React 19: `inert` harus boolean. Idiom React 18 (`inert=""`) sekarang
 * menghasilkan atribut yang HILANG plus warning — alias tidak inert sama sekali.
 */
export default function Drawer({ open, onClose, title, description, headerAction, children, footer }) {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Fokus masuk ke panel saat dibuka (panel yang memegang aria-labelledby, jadi
  // pembaca layar langsung mengumumkan judul drawer), lalu kembali ke elemen
  // pemicu saat ditutup. Cabang else tidak mencuri fokus waktu pertama mount.
  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement
      panelRef.current?.focus()
    } else if (restoreFocusRef.current) {
      restoreFocusRef.current.focus()
      restoreFocusRef.current = null
    }
  }, [open])

  // Escape menutup, dan Tab berputar di dalam panel. Tanpa trap ini fokus bisa
  // jalan ke halaman di belakang drawer yang mengaku aria-modal.
  useEffect(() => {
    if (!open) return

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = panelRef.current?.querySelectorAll(FOCUSABLE)
      if (!focusables?.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* Scrim pointer-only (tabIndex -1): fokus dikurung di dalam panel, dan
          keyboard sudah punya tombol X plus Escape untuk menutup. */}
      <button
        aria-label={t('common.close')}
        aria-hidden={!open}
        onClick={onClose}
        tabIndex={-1}
        className={`fixed inset-0 z-100 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? 'true' : undefined}
        aria-hidden={!open}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        inert={!open}
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-100 flex w-full max-w-md flex-col border-l border-border bg-bg-surface shadow-xl transition-transform duration-300 ease-out focus:outline-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              {title && (
                <h2 id={titleId} className="font-heading text-lg font-bold text-text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-0.5 text-xs text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerAction}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-page"
                aria-label={t('common.close')}
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
