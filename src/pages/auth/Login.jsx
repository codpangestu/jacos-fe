import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/guide/logo.png'
import heroStudents from '../../assets/picture/hero-students-group.png'
import buildingIllustration from '../../assets/picture/building-illustration.png'
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
    <div className="flex min-h-screen bg-[#f0f4f8]">

      {/* ══════════════════════════════════════════════
          LEFT PANEL — desktop only (hidden on mobile)
          Dark navy with school illustration
      ══════════════════════════════════════════════ */}
      <div className="relative hidden flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#0C2B4C] via-[#0f3560] to-[#1a4a7a] lg:flex">
        {/* Decorative dots */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
          <defs>
            <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Glow blobs */}
        <div className="pointer-events-none absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/4 right-0 h-56 w-56 rounded-full bg-primary-100/15 blur-3xl" />

        {/* Logo top-left */}
        <div className="relative z-10 p-10">
          <img src={logo} alt="JACOS" className="h-10 w-auto" />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10 pb-16 text-center">
          {/* Illustration: building behind, students in front */}
          <div className="relative h-72 w-full max-w-sm">
            <img
              src={buildingIllustration}
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 w-3/4 -translate-x-1/2 object-contain drop-shadow-2xl"
            />
            <img
              src={heroStudents}
              alt="Siswa JACOS"
              className="absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/3 object-contain drop-shadow-2xl"
            />
          </div>

          <h2 className="mt-8 font-heading text-3xl font-extrabold leading-tight text-white">
            Jakarta Cosmopolite<br />Islamic School
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            Sistem manajemen sekolah terpadu — absensi, jemput anak, keuangan, dan HR dalam satu platform.
          </p>

          {/* Feature pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['Absensi Digital', 'Digital Dismissal', 'SPP Online', 'HR & Cuti'].map((f) => (
              <span key={f} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — form
          Desktop: putih, centered
          Mobile: full screen dengan header gradient + card slide up
      ══════════════════════════════════════════════ */}
      <div className="flex w-full flex-col lg:w-[480px] lg:shrink-0">

        {/* ── Mobile header (gradient + ilustrasi) — hidden on desktop ── */}
        <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-300 to-primary-900 pb-10 pt-14 lg:hidden">
          {/* Stars */}
          {/* ── Dekorasi kids-friendly ── */}

          {/* Bintang polygon */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <polygon points="42,8 45,18 56,18 47,24 50,34 42,28 34,34 37,24 28,18 39,18"
              fill="rgba(255,220,50,0.90)" />
            {[[15,22],[75,12],[90,45],[8,55],[82,58],[50,8]].map(([x,y],i) => (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r="2.5" fill="rgba(255,255,255,0.70)" />
            ))}
          </svg>

          {/* Awan kiri */}
          <svg className="pointer-events-none absolute top-8 left-3 w-20 opacity-80" viewBox="0 0 80 40" aria-hidden="true">
            <ellipse cx="40" cy="28" rx="32" ry="14" fill="white" />
            <ellipse cx="26" cy="24" rx="16" ry="12" fill="white" />
            <ellipse cx="54" cy="22" rx="18" ry="13" fill="white" />
          </svg>

          {/* Awan kanan */}
          <svg className="pointer-events-none absolute top-6 right-4 w-14 opacity-65" viewBox="0 0 60 30" aria-hidden="true">
            <ellipse cx="30" cy="22" rx="22" ry="10" fill="white" />
            <ellipse cx="20" cy="18" rx="12" ry="9" fill="white" />
            <ellipse cx="40" cy="16" rx="13" ry="9" fill="white" />
          </svg>

          {/* Pensil terbang kiri bawah */}
          <svg className="pointer-events-none absolute bottom-14 left-5 w-9 opacity-90" viewBox="0 0 24 80" aria-hidden="true" style={{transform:'rotate(-30deg)'}}>
            <rect x="7" y="10" width="10" height="48" rx="2" fill="#FCD34D" />
            <rect x="7" y="8" width="10" height="6" rx="1.5" fill="#F87171" />
            <rect x="7" y="14" width="10" height="3" fill="#D1D5DB" />
            <polygon points="7,58 17,58 12,70" fill="#FBBF24" />
            <polygon points="9,64 15,64 12,70" fill="#78350F" />
          </svg>

          {/* Buku kanan bawah */}
          <svg className="pointer-events-none absolute bottom-12 right-6 w-11 opacity-85" viewBox="0 0 48 40" aria-hidden="true" style={{transform:'rotate(10deg)'}}>
            <path d="M4 8 Q24 4 24 4 Q24 4 44 8 L44 36 Q24 32 24 32 Q24 32 4 36 Z" fill="#60A5FA" />
            <line x1="24" y1="4" x2="24" y2="32" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="8" y1="14" x2="22" y2="12" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="8" y1="20" x2="22" y2="18" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="26" y1="12" x2="40" y2="14" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="26" y1="18" x2="40" y2="20" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
          </svg>

          {/* Kertas terbang atas kanan */}
          <svg className="pointer-events-none absolute top-12 right-12 w-8 opacity-80" viewBox="0 0 32 32" aria-hidden="true" style={{transform:'rotate(15deg)'}}>
            <path d="M2 2 L30 14 L16 18 L12 30 Z" fill="white" fillOpacity="0.9" />
            <line x1="2" y1="2" x2="16" y2="18" stroke="rgba(45,148,218,0.4)" strokeWidth="1" />
          </svg>

          {/* Ilustrasi utama */}
          <div className="relative z-10 flex justify-center">
            <div className="relative h-40 w-60">
              <img src={buildingIllustration} alt="" aria-hidden="true"
                className="absolute bottom-0 left-0 h-32 w-auto object-contain" />
              <img src={heroStudents} alt="" aria-hidden="true"
                className="absolute -top-2 right-0 h-40 w-auto object-contain drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* ── Form card ── */}
        {/* Mobile: card putih dengan -mt-6 rounded-t-3xl overlap ke gradient */}
        {/* Desktop: centered full height */}
        <div className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl bg-white px-6 pt-8 pb-10 lg:mt-0 lg:rounded-none lg:justify-center lg:px-12 lg:py-16">

          {/* Desktop logo (mobile logo ada di panel kiri) */}
          <div className="mb-8 hidden lg:block">
            <img src={logo} alt="JACOS" className="h-10 w-auto" />
          </div>

          {/* Headline */}
          <div className="mb-8">
            <p className="text-[13px] font-semibold text-primary-300">{t('auth.signInToAccount')}</p>
            <h1 className="mt-1 font-heading text-[28px] font-extrabold leading-tight text-[#0f172a] lg:text-[32px]">
              {t('auth.welcomeBack')}
            </h1>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {location.state?.resetSuccess && (
              <p className="rounded-xl bg-success-500/10 px-4 py-3 text-sm text-success-500">
                {t('auth.resetPasswordSuccess')}
              </p>
            )}
            {error && (
              <p className="rounded-xl bg-danger-500/10 px-4 py-3 text-sm text-danger-500">{error}</p>
            )}

            {/* Email field — underline style */}
            <div>
              <label htmlFor="email" className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
                {t('auth.emailOrUsername')}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b-2 border-border bg-transparent pb-2 text-[15px] text-text-primary placeholder:text-text-secondary/60 focus:border-primary-300 focus:outline-none transition-colors"
                placeholder="nama@jacos.sch.id"
              />
            </div>

            {/* Password field — underline style */}
            <div>
              <label htmlFor="password" className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-text-secondary">
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
                  className="w-full border-0 border-b-2 border-border bg-transparent pb-2 pr-9 text-[15px] text-text-primary placeholder:text-text-secondary/60 focus:border-primary-300 focus:outline-none transition-colors"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-300 to-primary-400 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-primary-300/25 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? t('common.processing') : t('auth.signInButton')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-6 text-right">
            <Link to="/forgot-password" className="text-[13px] font-medium text-text-secondary hover:text-primary-300">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {/* No account */}
          <p className="mt-8 text-center text-[13px] text-text-secondary">
            {t('auth.noAccount')}
          </p>
        </div>
      </div>
    </div>
  )
}
