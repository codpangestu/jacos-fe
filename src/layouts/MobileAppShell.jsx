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
 *   "greeting" — tidak ada topbar terpisah, greeting menyatu di konten atas
 *                dengan background gradient (seperti referensi)
 *   "title"    — topbar minimalis sticky (back button + judul + actions)
 */
export default function MobileAppShell({
  tabs,
  pageTitle,
  pageSubtitle,
  headerVariant = 'title',
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

        {/* ══════════════════════════════════════════════════
            TOPBAR — hanya untuk headerVariant="title"
            (halaman dalam, bukan dashboard)
        ══════════════════════════════════════════════════ */}
        {headerVariant === 'title' && (
          <header
            className="sticky top-0 z-20 shrink-0 bg-bg-surface"
            style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
          >
            <div className="flex items-center gap-3 px-4 pb-3 pt-1">
              {/* Back */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label={t('common.back')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-page text-text-secondary transition-colors hover:bg-border active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-[15px] font-bold leading-tight text-text-primary">
                  {pageTitle}
                </p>
                {pageSubtitle && (
                  <p className="truncate text-[11px] text-text-secondary">{pageSubtitle}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-page text-text-secondary transition-colors hover:bg-border active:scale-95"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <NotificationBell />
              </div>
            </div>
            <div className="h-px bg-border" />
          </header>
        )}

        {/* ══════════════════════════════════════════════════
            GREETING HEADER — hanya untuk headerVariant="greeting"
            Menyatu dengan konten, tidak ada border/card terpisah
        ══════════════════════════════════════════════════ */}
        {headerVariant === 'greeting' && (
          <div
            className="shrink-0 bg-gradient-to-b from-primary-400 to-primary-300 px-5 pb-8"
            style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
          >
            {/* Single row: avatar kiri, teks tengah, actions kanan */}
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-[14px] font-bold text-white ring-2 ring-white/30">
                  {initials}
                </div>
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-primary-300 bg-success-500" />
              </div>

              {/* Teks: tanggal kecil + greeting */}
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-medium text-white/70">
                  {pageSubtitle ?? new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className="truncate font-heading text-[20px] font-bold leading-snug text-white">
                  {pageTitle}
                </h1>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isDark ? t('nav.lightMode') : t('nav.darkMode')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:scale-95"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <NotificationBell className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            CONTENT
            greeting: -mt-5 + rounded-t-3xl agar card pertama
            overlap gradient header → efek "floating card"
        ══════════════════════════════════════════════════ */}
        <main
          className={`flex-1 space-y-4 px-4 pb-28 ${
            headerVariant === 'greeting'
              ? '-mt-5 rounded-t-3xl bg-bg-page pt-5'
              : 'pt-4'
          }`}
        >
          {children}
        </main>

        {/* ══════════════════════════════════════════════════
            BOTTOM TAB BAR
        ══════════════════════════════════════════════════ */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] bg-bg-surface"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -1px 0 0 var(--color-border)',
          }}
        >
          <ul className="flex items-stretch justify-between px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active =
                location.pathname === tab.to ||
                location.pathname.startsWith(`${tab.to}/`)

              /* Central elevated button */
              if (tab.central) {
                return (
                  <li key={tab.key} className="flex flex-1 items-start justify-center">
                    <Link
                      to={tab.to}
                      aria-label={t(tab.label)}
                      className="-mt-5 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-400 text-white no-underline shadow-lg shadow-primary-300/35 ring-4 ring-bg-surface transition-transform active:scale-95"
                    >
                      <Icon size={22} />
                    </Link>
                  </li>
                )
              }

              return (
                <li key={tab.key} className="flex flex-1 justify-center">
                  <Link
                    to={tab.to}
                    className={`flex flex-col items-center gap-1 px-2 py-2.5 text-[10.5px] font-medium no-underline transition-colors ${
                      active ? 'text-primary-300' : 'text-text-secondary'
                    }`}
                  >
                    <span
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                        active ? 'bg-primary-300/12' : ''
                      }`}
                    >
                      <Icon size={19} />
                      {active && (
                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary-300" />
                      )}
                    </span>
                    <span className="max-w-[64px] truncate">{t(tab.label)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}
