import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/guide/logo.png'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-300 to-primary-900 px-4 py-10">
      {/* Subtle decorative pattern */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <defs>
          <pattern id="login-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1.5" fill="white" />
            <path d="M0 40 Q 40 0 80 40 Q 40 80 0 40 Z" stroke="white" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-pattern)" />
      </svg>

      <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="h-14 w-auto" />
          <h1 className="mt-5 font-heading text-xl font-bold text-text-primary">
            {t('auth.welcomeBack')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.signInToAccount')}</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {location.state?.resetSuccess && (
            <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
              {t('auth.resetPasswordSuccess')}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">{error}</p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-primary">
              {t('auth.emailOrUsername')}
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none"
              placeholder="nama@jacos.sch.id"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                {t('auth.password')}
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary-300 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 pr-11 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-60"
          >
            {loading ? t('common.processing') : t('auth.signInButton')}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-text-secondary">{t('auth.noAccount')}</p>
      </div>
    </div>
  )
}
