import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Repeat } from 'lucide-react'

/** Indikator anak aktif + shortcut ganti anak (kalau akun ortu terhubung >1 anak). */
export default function ActiveChildBar({ child, multiple }) {
  const { t } = useTranslation()
  if (!child) return null

  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary-300/8 px-4 py-2.5 text-sm">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-300/15 text-xs font-semibold text-primary-300">
        {child.name
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')}
      </span>
      <span className="font-medium text-text-primary">{child.name}</span>
      <span className="text-text-secondary">— {child.classroom?.name}</span>
      {multiple && (
        <Link to="/ortu/select-child" className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary-300 hover:underline">
          <Repeat size={13} />
          {t('ortu.switchChild')}
        </Link>
      )}
    </div>
  )
}
