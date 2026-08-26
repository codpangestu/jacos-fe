import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Tombol export PDF/Excel — backend belum punya endpoint generate file asli
 * (lihat context.md), jadi disabled dengan tooltip sampai backend menyusul.
 */
export default function ExportButton({ label }) {
  const { t } = useTranslation()

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
