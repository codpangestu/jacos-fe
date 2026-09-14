import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Moon, Sun } from 'lucide-react'
import useDarkMode from '../hooks/useDarkMode'
import { getUser } from '../lib/auth'
import NotificationBell from '../components/NotificationBell'

/**
 * Shell mobile-first untuk role Orang Tua & Staff.
 * Max-w-[480px] di-center di semua breakpoint.
 *
 * headerVariant:
 *   "greeting" — topbar putih dgn avatar + judul (dipakai StaffDashboard dkk.)
 *   "title"    — topbar minimalis sticky (back button + judul + actions)
 *   "none"     — tidak ada topbar shell sama sekali; halaman menyediakan hero
 *                sendiri (mis. OrtuDashboard, hero biru custom + bell sendiri)
 *
 * fullBleed — kalau true, <main> tidak dikasih padding (px/pt) supaya hero
 * full-bleed halaman bisa nempel ke tepi; section lain di halaman jadi
 * tanggung jawab halaman itu sendiri untuk kasih padding horizontal.
 */

export default function MobileAppShell({
  tabs,
  pageTitle,
  pageSubtitle,
  headerVariant = 'title',
  fullBleed = false,
  children,
}) {
  const { t } = useTranslation()
  const { isDark, toggle } = useDarkMode()
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('')

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col">
        {headerVariant !== 'none' && (
        <header
          className={`sticky top-0 z-20 ${
            headerVariant === 'greeting'
              ? 'overflow-hidden rounded-b-[36px] shadow-lg'
              : 'border-b border-border bg-bg-surface'
          }`}
          style={headerVariant === 'greeting' ? {
            background: 'linear-gradient(135deg, #007BFF 0%, #35AEFC 55%, #B0E0E6 100%)',
          } : {}}
        >
          {headerVariant === 'greeting' ? (
            /* ── Greeting header — referensi style ── */
            <div
              className="relative px-5 pb-7"
              style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
            >
              {/* Dekorasi layer circles — konsentris di kiri */}
              <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full" style={{ background: 'rgba(249, 9, 9, 0.18)' }} />
              <div className="pointer-events-none absolute -left-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full" style={{ background: 'rgba(149, 6, 6, 0.13)' }} />
              <div className="pointer-events-none absolute -left-2 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.09)' }} />

              {/* Content row */}
              <div className="relative flex items-center gap-3.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-[14px] font-bold text-white ring-2 ring-white/30">
                    {initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#35AEFC] bg-success-500" />
                </div>

                {/* Title */}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-white/65">
                    {pageSubtitle}
                  </p>
                  <h1 className="truncate font-heading text-[19px] font-bold leading-snug text-white">
                    {pageTitle}
                  </h1>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={t(isDark ? 'nav.lightMode' : 'nav.darkMode')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:scale-95"
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                  {/* Notification bell — white circle like referensi */}
                  <div className="rounded-full bg-white/15 p-0.5">
                    <NotificationBell />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── Title header ── */
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-bg-page"
                aria-label={t('common.back')}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{pageTitle}</p>
                {pageSubtitle && (
                  <p className="truncate text-xs text-text-secondary">{pageSubtitle}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={toggle}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-page text-text-secondary"
                  aria-label={t(isDark ? 'nav.lightMode' : 'nav.darkMode')}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <NotificationBell />
              </div>
            </div>
          )}
        </header>
        )}

        <main className={`flex-1 pb-24 ${fullBleed ? '' : 'px-4 pt-4'}`}>
          {children}
        </main>

        {/* =========================================
            BOTTOM TAB BAR — active tab bubble elevated
        ========================================= */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Bar putih menyatu ke bawah */}
          <div className="rounded-t-[24px] border-t border-border bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
            <ul className="flex items-end justify-around px-2 pt-3 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active =
                  location.pathname === tab.to ||
                  location.pathname.startsWith(`${tab.to}/`)

                return (
                  <li key={tab.key} className="flex flex-1 justify-center">
                    <Link
                      to={tab.to}
                      aria-label={t(tab.label)}
                      aria-current={active ? 'page' : undefined}
                      className="relative flex flex-col items-center no-underline outline-none"
                    >
                      {active ? (
                        /* ── Elevated bubble ── */
                        <>
                          {/* Circle naik ke atas */}
                          <span className="absolute -top-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary-300 shadow-[0_4px_16px_rgba(45,148,218,0.50)] ring-4 ring-white">
                            <Icon size={24} strokeWidth={2.2} className="text-white" />
                          </span>
                          {/* Spacer agar label turun sejajar */}
                          <span className="mt-8 text-[11px] font-bold text-primary-300">
                            {t(tab.label)}
                          </span>
                        </>
                      ) : (
                        /* ── Inactive tab ── */
                        <span className="flex flex-col items-center gap-1 py-1">
                          <Icon size={20} strokeWidth={1.7} className="text-text-secondary" />
                          <span className="text-[10px] font-medium text-text-secondary">
                            {t(tab.label)}
                          </span>
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}
