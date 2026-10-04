import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Repeat } from 'lucide-react'
import ChildAvatar from './ChildAvatar'

/**
 * Kartu "siswa aktif" + shortcut ganti anak (kalau akun ortu terhubung >1 anak) —
 * meniru blok "Siswa Aktif" di referensi m.jacos.id.
 */
export default function ActiveChildBar({ child, multiple }) {
  const { t } = useTranslation()
  if (!child) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-surface p-3.5">
      <ChildAvatar child={child} className="h-12 w-12" usePhotoIfAvailable />
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
