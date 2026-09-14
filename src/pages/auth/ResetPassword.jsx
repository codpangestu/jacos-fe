import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/guide/logo baru.svg'
import { apiPost } from '../../lib/api'

export default function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiPost('/api/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/login', { state: { resetSuccess: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const linkInvalid = !token || !email

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-300 to-primary-900 px-4 py-10">
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="h-14 w-auto" />
          <h1 className="mt-5 font-heading text-xl font-bold text-text-primary">
            {t('auth.resetPasswordTitle')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.resetPasswordDescription')}</p>
        </div>

        {linkInvalid ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-danger-500/10 px-3 py-2.5 text-sm text-danger-500">
              {t('auth.invalidResetLink')}
            </p>
            <Link to="/forgot-password" className="block text-center text-sm font-semibold text-primary-300 hover:underline">
              {t('auth.forgotPasswordTitle')}
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">{error}</p>
            )}

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-primary">
                {t('auth.newPassword')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                {t('auth.confirmPassword')}
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-60"
            >
              {loading ? t('common.processing') : t('auth.resetPasswordButton')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
