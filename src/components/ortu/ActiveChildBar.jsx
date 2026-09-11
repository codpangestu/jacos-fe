import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Repeat } from 'lucide-react'
import { storageUrl } from '../../lib/api'

/**
 * Kartu "siswa aktif" + shortcut ganti anak (kalau akun ortu terhubung >1 anak) —
 * meniru blok "Siswa Aktif" di referensi m.jacos.id.
 */
export default function ActiveChildBar({ child, multiple }) {
  const { t } = useTranslation()
  if (!child) return null

  const initials = child.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-surface p-3.5">
      {child.photo_path ? (
        <img src={storageUrl(child.photo_path)} alt={child.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-300/15 text-sm font-semibold text-primary-300">
          {initials}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-primary-300">{t('ortu.activeChildLabel')}</p>
        <p className="truncate text-sm font-bold text-text-primary">{child.name}</p>
        <p className="truncate text-xs text-text-secondary">{child.classroom?.name}</p>
      </div>
      {multiple && (
        <Link
          to="/ortu/select-child"
          className="flex shrink-0 items-center gap-1 rounded-full bg-primary-300/12 px-3 py-1.5 text-xs font-bold text-primary-300 no-underline hover:bg-primary-300/20"
        >
          <Repeat size={13} />
          {t('ortu.switchChild')}
        </Link>
      )}
    </div>
  )
}
