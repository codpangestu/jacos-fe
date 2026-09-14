import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, apiPost, logout as apiLogout, ApiError } from '../../lib/api'
import { getUser, clearUser, ROLE_LABEL } from '../../lib/auth'
import { setLanguage } from '../../i18n'

function joinNames(names) {
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}`
}

export default function OrtuAccount() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = getUser()
  const { children } = useOrtuChildren()

  const [helpOpen, setHelpOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [pushPermission, setPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  )

  const { data: consentsData } = useQuery({
    queryKey: ['ortu', 'consents'],
    queryFn: () => apiGet('/api/ortu/consents'),
  })
  const activeConsents = (consentsData?.consents ?? []).filter((c) => !c.withdrawn_at)

  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const changePasswordMutation = useMutation({
    mutationFn: () => apiPost('/api/account/change-password', form),
    onSuccess: () => {
      setForm({ current_password: '', password: '', password_confirmation: '' })
      setSuccess(true)
      setErrors({})
    },
    onError: (err) => {
      if (err instanceof ApiError && err.errors) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])))
      } else {
        setErrors({ current_password: err.message })
      }
    },
  })

  function closePasswordModal() {
    setPasswordOpen(false)
    setSuccess(false)
    setErrors({})
    setForm({ current_password: '', password: '', password_confirmation: '' })
  }

  async function handleTogglePush() {
    if (pushPermission !== 'default') return
    try {
      const result = await Notification.requestPermission()
      setPushPermission(result)
    } catch {
      // izin gagal diminta — biarkan status apa adanya
    }
  }

  async function handleLogout() {
    try {
      await apiLogout()
    } finally {
      clearUser()
      navigate('/login')
    }
  }

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div
        className="flex min-h-screen w-full flex-col gap-4 overflow-x-hidden bg-gradient-to-br from-[#CAE6F6] via-[#F6E3F2] to-[#DDF0F4] px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-[18px] font-bold leading-[22px] text-[#1A2A3A]">
            {t('ortu.accountTopTitle')}
          </h1>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0E8EF] bg-white text-[#0252A3]"
            aria-label={t('ortu.helpModalTitle')}
          >
            <HelpCircle size={18} />
          </button>
        </div>

        {/* Parent Profile Card */}
        <div
          className="flex w-full flex-col gap-3 rounded-3xl border border-[#E0E8EF] bg-white p-[18px]"
          style={{ boxShadow: '0px 8px 24px rgba(70, 163, 2, 0.06)' }}
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#FBCFE8] bg-[#FDF2F8] text-lg font-bold text-[#9D174D]">
              {initials}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex w-fit items-center gap-1 rounded-full bg-[#ECF5FD] px-2 py-0.5 text-[10px] font-bold text-[#054E96]">
                <ShieldCheck size={12} strokeWidth={2.5} />
                {(ROLE_LABEL[user?.role] ?? '').toUpperCase()}
              </span>
              <p className="truncate text-base font-bold text-[#1A2A3A]">{user?.name ?? '-'}</p>
              <p className="truncate text-[11px] text-[#627283]">{user?.email ?? '-'}</p>
            </div>
          </div>

          {children.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8FAFC] p-2.5">
              <p className="min-w-0 flex-1 truncate text-[11px] text-[#516375]">
                {t('ortu.connectedKids', { count: children.length, names: joinNames(children.map((c) => c.name)) })}
              </p>
              <Link
                to="/ortu/select-child"
                className="flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[#0252A3] no-underline"
              >
                {t('ortu.viewChildren')}
                <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* General Settings Card */}
        <div
          className="flex w-full flex-col gap-3 rounded-3xl border border-[#E0E8EF] bg-white p-[18px]"
          style={{ boxShadow: '0px 8px 24px rgba(70, 163, 2, 0.06)' }}
        >
          <p className="text-sm font-bold text-[#1A2A3A]">{t('ortu.preferencesCardTitle')}</p>

          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F7FD] text-[#165DA3]">
                <Globe size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-[#1A2A3A]">{t('ortu.languageTitle')}</p>
                <p className="text-[10px] text-[#627283]">{t('ortu.languageHint')}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-[#F3F4F6] p-[3px]">
              {['id', 'en'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase transition-colors ${
                    i18n.language === lang ? 'bg-[#0252A3] font-bold text-white' : 'font-medium text-[#4B5563]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-[#EEF1F4]" />

          <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED] text-[#EA580C]">
                <Bell size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-[#1A2A3A]">{t('ortu.pushTitle')}</p>
                <p className="text-[10px] text-[#627283]">
                  {pushPermission === 'denied'
                    ? t('ortu.pushPermissionDenied')
                    : pushPermission === 'unsupported'
                      ? t('ortu.pushNotSupportedShort')
                      : t('ortu.pushSubtitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTogglePush}
              disabled={pushPermission !== 'default'}
              aria-pressed={pushPermission === 'granted'}
              className={`flex h-6 w-11 shrink-0 items-center rounded-full px-[3px] transition-colors disabled:cursor-default ${
                pushPermission === 'granted' ? 'justify-end bg-[#0252A3]' : 'justify-start bg-[#E5E7EB]'
              }`}
            >
              <span className="h-[18px] w-[18px] rounded-full bg-white shadow" />
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div
          className="flex w-full flex-col gap-3 rounded-3xl border border-[#E0E8EF] bg-white p-[18px]"
          style={{ boxShadow: '0px 8px 24px rgba(70, 163, 2, 0.06)' }}
        >
          <p className="text-sm font-bold text-[#1A2A3A]">{t('ortu.securityCardTitle')}</p>

          <button
            type="button"
            onClick={() => setPasswordOpen(true)}
            className="flex items-center justify-between gap-3 py-1 text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF] text-[#9333EA]">
                <Lock size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-[#1A2A3A]">{t('ortu.changePasswordTitle')}</p>
                <p className="text-[10px] text-[#627283]">{t('ortu.changePasswordHint')}</p>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#9CA3AF]" />
          </button>

          <div className="h-px w-full bg-[#EEF1F4]" />

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex items-center justify-between gap-3 py-1 text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0284C7]">
                <MessageCircle size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-[#1A2A3A]">{t('ortu.contactAdminTitle')}</p>
                <p className="text-[10px] text-[#627283]">{t('ortu.contactAdminHint')}</p>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#9CA3AF]" />
          </button>

          {activeConsents.length > 0 && (
            <>
              <div className="h-px w-full bg-[#EEF1F4]" />
              <Link
                to="/account/profile"
                className="flex items-center justify-between gap-3 py-1 text-left no-underline"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ECF5FD] text-[#054E96]">
                    <ShieldCheck size={16} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#1A2A3A]">{t('ortu.manageConsent')}</p>
                    <p className="text-[10px] text-[#627283]">{t('ortu.manageConsentHint', { count: activeConsents.length })}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-[#9CA3AF]" />
              </Link>
            </>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-2xl border border-[#FEE2E2] bg-[#FEF2F2] text-xs font-bold text-[#DC2626]"
        >
          <LogOut size={16} />
          {t('nav.logout')}
        </button>

        {/* Footer Version */}
        <div className="flex flex-col items-center gap-0.5 pb-4 text-center">
          <p className="text-[11px] font-semibold text-[#627283]">{t('ortu.appFooterName')}</p>
          <p className="text-[10px] text-[#9CA3AF]">{t('ortu.appFooterSecurity')}</p>
        </div>
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title={t('ortu.helpModalTitle')}>
        <p className="text-sm text-text-secondary">{t('ortu.helpComingSoon')}</p>
      </Modal>

      <Modal open={passwordOpen} onClose={closePasswordModal} title={t('ortu.changePasswordTitle')}>
        {success ? (
          <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
            {t('profile.changePasswordSuccess')}
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              changePasswordMutation.mutate()
            }}
            className="space-y-4"
          >
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
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
            >
              {changePasswordMutation.isPending ? t('common.processing') : t('profile.changePasswordButton')}
            </button>
          </form>
        )}
      </Modal>
    </ResponsiveShell>
  )
}
