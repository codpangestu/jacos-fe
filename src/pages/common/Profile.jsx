import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BellRing, LogOut, ShieldOff } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { apiGet, apiPost, logout as apiLogout, ApiError } from '../../lib/api'
import { clearUser, getUser, ROLE_LABEL } from '../../lib/auth'

export default function Profile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = getUser()
  const isMobileRole = user?.role === 'orang_tua' || user?.role === 'staff'

  async function handleLogout() {
    try {
      await apiLogout()
    } finally {
      clearUser()
      navigate('/login')
    }
  }

  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const pushSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

  const queryClient = useQueryClient()
  const [withdrawing, setWithdrawing] = useState(null)
  const { data: consentsData } = useQuery({
    queryKey: ['ortu', 'consents'],
    queryFn: () => apiGet('/api/ortu/consents'),
    enabled: user?.role === 'orang_tua',
  })
  const activeConsents = (consentsData?.consents ?? []).filter((c) => !c.withdrawn_at)

  const withdrawMutation = useMutation({
    mutationFn: () => apiPost(`/api/ortu/consents/${withdrawing.id}/withdraw`),
    onSuccess: () => {
      setWithdrawing(null)
      queryClient.invalidateQueries({ queryKey: ['ortu', 'consents'] })
      queryClient.invalidateQueries({ queryKey: ['ortu', 'children'] })
    },
  })

  async function handleChangePassword(e) {
    e.preventDefault()
    setErrors({})
    setSuccess(false)
    setLoading(true)
    try {
      await apiPost('/api/account/change-password', form)
      setForm({ current_password: '', password: '', password_confirmation: '' })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])))
      } else {
        setErrors({ current_password: err.message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveShell pageTitle={t('profile.title')} headerVariant="title" showSearch={false}>
      <div className={`grid gap-6 ${isMobileRole ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        <section className="space-y-4 rounded-2xl border border-border bg-bg-surface p-5">
          <h2 className="font-heading text-base font-bold text-text-primary">{t('profile.accountInfo')}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">{t('profile.name')}</dt>
              <dd className="font-medium text-text-primary">{user?.name ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">{t('profile.email')}</dt>
              <dd className="font-medium text-text-primary">{user?.email ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">{t('profile.role')}</dt>
              <dd className="font-medium text-text-primary">{ROLE_LABEL[user?.role] ?? '-'}</dd>
            </div>
          </dl>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-text-primary">{t('profile.language')}</p>
            <p className="mb-2 text-xs text-text-secondary">{t('profile.languageDescription')}</p>
            <LanguageSwitcher />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-bg-surface p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-300/12 text-primary-300">
              <BellRing size={18} />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-text-primary">{t('profile.pushTitle')}</h2>
              <p className="text-xs text-text-secondary">{t('profile.pushDescription')}</p>
            </div>
          </div>
          <p className="rounded-xl bg-bg-page px-3.5 py-3 text-xs text-text-secondary">
            {pushSupported ? t('profile.pushComingSoon') : t('profile.pushNotSupported')}
          </p>
        </section>

        <section className={`space-y-4 rounded-2xl border border-border bg-bg-surface p-5 ${isMobileRole ? '' : 'lg:col-span-2'}`}>
          <div>
            <h2 className="font-heading text-base font-bold text-text-primary">{t('profile.changePassword')}</h2>
            <p className="text-xs text-text-secondary">{t('profile.changePasswordDescription')}</p>
          </div>

          {success && (
            <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
              {t('profile.changePasswordSuccess')}
            </p>
          )}

          <form onSubmit={handleChangePassword} className={`grid gap-4 ${isMobileRole ? 'grid-cols-1' : 'sm:grid-cols-3'}`}>
            <FormField
              label={t('profile.currentPassword')}
              htmlFor="current_password"
              type="password"
              required
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              error={errors.current_password}
            />
            <FormField
              label={t('profile.newPassword')}
              htmlFor="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <FormField
              label={t('profile.confirmPassword')}
              htmlFor="password_confirmation"
              type="password"
              required
              minLength={8}
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            />
            <div className={isMobileRole ? '' : 'sm:col-span-3'}>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary-300 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-60"
              >
                {loading ? t('common.processing') : t('profile.changePasswordButton')}
              </button>
            </div>
          </form>
        </section>

        {user?.role === 'orang_tua' && activeConsents.length > 0 && (
          <section className={`space-y-4 rounded-2xl border border-border bg-bg-surface p-5 ${isMobileRole ? '' : 'lg:col-span-2'}`}>
            <div>
              <h2 className="font-heading text-base font-bold text-text-primary">{t('consent.withdrawTitle')}</h2>
              <p className="text-xs text-text-secondary">{t('consent.withdrawDescription')}</p>
            </div>
            <ul className="divide-y divide-border">
              {activeConsents.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-medium text-text-primary">{c.student?.name}</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawing(c)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-danger-500 hover:bg-danger-500/10"
                  >
                    <ShieldOff size={13} />
                    {t('consent.withdrawButton')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {isMobileRole && (
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-danger-500/30 bg-danger-500/10 py-3 text-sm font-semibold text-danger-500 hover:bg-danger-500/15"
        >
          <LogOut size={16} />
          {t('nav.logout')}
        </button>
      )}

      <Modal
        open={!!withdrawing}
        onClose={() => setWithdrawing(null)}
        title={t('consent.withdrawTitle')}
        description={t('consent.withdrawDescription')}
        footer={
          <button
            type="button"
            disabled={withdrawMutation.isPending}
            onClick={() => withdrawMutation.mutate()}
            className="rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:opacity-60"
          >
            {withdrawMutation.isPending ? t('common.processing') : t('consent.withdrawButton')}
          </button>
        }
      />
    </ResponsiveShell>
  )
}
