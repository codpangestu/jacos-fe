import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/guide/logo baru.svg'
import { apiPost } from '../../lib/api'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiPost('/api/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-300 to-primary-900 px-4 py-10">
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="h-14 w-auto" />
          <h1 className="mt-5 font-heading text-xl font-bold text-text-primary">
            {t('auth.forgotPasswordTitle')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">{t('auth.forgotPasswordDescription')}</p>
        </div>

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-lg bg-success-500/10 px-3 py-2.5 text-sm text-success-500">
              {t('auth.forgotPasswordSuccess')}
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-300 hover:underline"
            >
              <ArrowLeft size={16} />
              {t('auth.backToLogin')}
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:ring-2 focus:ring-primary-300/20 focus:outline-none"
                placeholder="nama@jacos.sch.id"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-60"
            >
              {loading ? t('common.processing') : t('auth.sendResetLink')}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft size={16} />
              {t('auth.backToLogin')}
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
