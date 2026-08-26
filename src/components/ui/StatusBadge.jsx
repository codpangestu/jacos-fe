import { useTranslation } from 'react-i18next'
import { statusTone } from '../../lib/statusLabels'

const TONE_STYLES = {
  primary: 'bg-primary-300/12 text-primary-300 dark:bg-primary-300/18',
  accent: 'bg-accent-500/12 text-accent-500 dark:bg-accent-500/18',
  success: 'bg-success-500/12 text-success-500 dark:bg-success-500/18',
  navy: 'bg-primary-900/8 text-primary-900 dark:bg-white/10 dark:text-white',
  danger: 'bg-danger-500/12 text-danger-500 dark:bg-danger-500/18',
}

/** Badge status seragam untuk kode/slug dari backend (hadir/lunas/pending/dst). */
export default function StatusBadge({ code, label }) {
  const { t } = useTranslation()
  const tone = statusTone(code)
  const text = label ?? t(`status.${code}`, code)

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE_STYLES[tone]}`}
    >
      {text}
    </span>
  )
}
