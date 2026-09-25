import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/guide/logo baru.svg'
import bannerLoginDesktop from '../../assets/guide/bannerlogindesktop.svg'
import bannerLoginMobile from '../../assets/guide/bannerloginmobile.svg'
import { login } from '../../lib/api'
import { ROLE_HOME, saveUser } from '../../lib/auth'
import { requestPushPermissionOnce } from '../../lib/push'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      saveUser(user)
      requestPushPermissionOnce()
      navigate(ROLE_HOME[user.role] ?? '/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">

      {/* ══════════════════════════════════════════════════
          DESKTOP — full screen split kiri | kanan
          Hidden on mobile
      ══════════════════════════════════════════════════ */}
      <div className="hidden w-full lg:flex">

        {/* ── Kiri: banner image full height ── */}
        <div className="relative m-4 flex-1 overflow-hidden rounded-[24px]">
          <img
            src={bannerLoginDesktop}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            draggable="false"
          />
        </div>

        {/* ── Kanan: form, full height ── */}
        <div className="flex w-[480px] shrink-0 flex-col justify-center bg-white px-12 py-14">

          {/* Logo */}
          <div className="mb-0 flex items-center gap-2.5">
            <img src={logo} alt="JACOS" className="h-12 w-auto" />
          </div>

          {/* Headline */}
          <h1 className="font-heading text-[34px] font-extrabold leading-tight text-[#0f172a]">
            {t('auth.welcomeBack')}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-text-secondary">
            {t('auth.signInToAccount')}
          </p>

          {/* Alerts */}
          {location.state?.resetSuccess && (
            <p className="mt-5 rounded-xl bg-success-500/10 px-4 py-3 text-sm text-success-500">
              {t('auth.resetPasswordSuccess')}
            </p>
          )}
          {error && (
            <p className="mt-5 rounded-xl bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{error}</p>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

            {/* Email — underline */}
            <div>
              <label htmlFor="email-d" className="block text-[12.5px] font-semibold text-text-secondary">
                {t('auth.emailOrUsername')}
              </label>
              <input
                id="email-d"
                name="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full border-0 border-b-2 border-border bg-transparent pb-2 text-[15px] text-text-primary placeholder:text-text-secondary/50 focus:border-[#0f172a] focus:outline-none transition-colors"
                placeholder="nama@jacos.sch.id"
              />
            </div>

            {/* Password — underline */}
            <div>
              <label htmlFor="password-d" className="block text-[12.5px] font-semibold text-text-secondary">
                {t('auth.password')}
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password-d"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-0 border-b-2 border-border bg-transparent pb-2 pr-9 text-[15px] text-text-primary placeholder:text-text-secondary/50 focus:border-[#0f172a] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-0 top-0 text-text-secondary hover:text-text-primary"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-secondary select-none">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-[#0f172a]" />
                {t('auth.rememberMe', { defaultValue: 'Remember me' })}
              </label>
              <Link to="/forgot-password" className="text-[13px] text-text-secondary no-underline hover:text-primary-300">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit — hitam rounded-full persis referensi */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0f172a] py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {loading ? t('common.processing') : t('auth.signInButton')}
            </button>
          </form>

          {/* No account */}
          <p className="mt-6 text-center text-[13px] text-text-secondary">
            {t('auth.noAccount')}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE — full screen (lg:hidden)
      ══════════════════════════════════════════════════ */}
      <div className="relative w-full min-h-screen lg:hidden overflow-hidden">

        {/* Banner — portrait, penuh layar */}
        <img
          src={bannerLoginMobile}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-top"
          draggable="false"
        />

        {/* Gradient overlay bawah supaya form terbaca */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Form card — overlay dari bawah */}
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[32px] bg-white px-6 pt-7 pb-10 shadow-[0_-8px_40px_rgba(0,0,0,0.15)]">
          <h1 className="mb-6 text-center font-heading text-[26px] font-extrabold text-text-primary">
            {t('auth.signInButton', { defaultValue: 'Login' })}
          </h1>

          {location.state?.resetSuccess && (
            <p className="mb-4 rounded-2xl bg-success-500/10 px-4 py-3 text-sm text-success-500">
              {t('auth.resetPasswordSuccess')}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-2xl bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{error}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                {t('auth.emailOrUsername')}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#F2F4F7] px-4 py-3.5 text-[15px] text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary-300/30 transition-all"
                placeholder="nama@jacos.sch.id"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#F2F4F7] px-4 py-3.5 pr-12 text-[15px] text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary-300/30 transition-all"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-[#F59E0B] py-4 text-[16px] font-bold text-white shadow-md shadow-[#F59E0B]/30 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? t('common.processing') : t('auth.signInButton')}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Link to="/forgot-password" className="text-[13px] font-medium text-text-secondary hover:text-primary-300 no-underline">
              {t('auth.forgotPassword')}
            </Link>
            <p className="text-[13px] text-text-secondary">
              {t('auth.noAccount')}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
