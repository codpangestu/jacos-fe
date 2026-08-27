import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Tombol export CSV. Kalau `onClick` diberikan, tombol aktif dan memanggilnya
 * (async — spinner otomatis saat mengunduh). Tanpa `onClick`, tetap fallback
 * disabled+tooltip seperti semula (belum ada sumber data utk diexport).
 */
export default function ExportButton({ label, onClick }) {
  const { t } = useTranslation()
  const [pending, setPending] = useState(false)

  if (!onClick) {
    return (
      <button
        type="button"
        disabled
        title={t('common.exportSoon')}
        className="flex shrink-0 cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-bg-page px-4 py-2.5 text-sm font-semibold text-text-secondary opacity-70"
      >
        <Download size={16} />
        {label ?? t('common.export')}
      </button>
    )
  }

  async function handleClick() {
    setPending(true)
    try {
      await onClick()
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-page disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {label ?? t('common.export')}
    </button>
  )
}
