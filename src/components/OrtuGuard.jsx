import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getUser, ROLE_HOME } from '../lib/auth'
import useOrtuChildren from '../hooks/useOrtuChildren'

/**
 * Guard route /ortu/* (FR-FE-5.5): login+role check, lalu redirect paksa ke
 * /consent/child kalau ada anak tanpa consent aktif, lalu (kecuali
 * requireChildSelection=false) pastikan ada anak aktif terpilih — kalau >1
 * anak dan belum ada yang aktif, redirect ke child switcher.
 *
 * requireConsent=false dipakai halaman yang bukan pemrosesan data anak —
 * satu-satunya saat ini Pengaduan (lihat ComplaintController: policy-nya
 * sengaja tidak memakai StudentPolicy/consent, karena consent mengatur
 * pemrosesan data anak, bukan hak orang tua menyampaikan keluhan). Tanpa itu,
 * orang tua yang menarik consent jadi terkunci dari fitur pengaduan.
 */
export default function OrtuGuard({ children, requireChildSelection = true, requireConsent = true }) {
  const { t } = useTranslation()
  const user = getUser()

  const { isLoading, children: childList, needsConsent, activeChild } = useOrtuChildren()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'orang_tua') return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page text-sm text-text-secondary">
        {t('common.loading')}
      </div>
    )
  }

  if (requireConsent && needsConsent) return <Navigate to="/consent/child" replace />

  if (requireChildSelection) {
    if (childList.length === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-page px-4 text-center text-sm text-text-secondary">
          {t('ortu.noChildrenLinked')}
        </div>
      )
    }
    if (!activeChild) return <Navigate to="/ortu/select-child" replace />
  }

  return children
}
