import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Moon, Sun } from 'lucide-react'
import useDarkMode from '../hooks/useDarkMode'
import { getUser } from '../lib/auth'
import NotificationBell from '../components/NotificationBell'
import { OrtuBottomTabBar, StaffBottomTabBar } from '../components/BottomTabBar'

/**
 * Shell mobile-first untuk role Orang Tua & Staff.
 * Max-w-[480px] di-center di semua breakpoint.
 *
 * Props:
 *   tabs           — array tab dari MOBILE_TABS[role]
 *   pageTitle      — judul halaman (string)
 *   pageSubtitle   — subjudul (string, opsional)
 *   headerVariant  — "greeting" | "title" | "none"
 *   fullBleed      — true → <main> tanpa padding px/pt
 *   hideTabs       — true → sembunyikan bottom tab bar (halaman sub/detail)
 *   children       — konten halaman
 *
 * Cara pakai bottom bar:
 *   - Halaman utama (Beranda, Bayar, Anak, Akun): biarkan default (hideTabs tidak diset)
 *   - Halaman sub/detail tanpa bottom bar: tambah `hideTabs` di <ResponsiveShell>
 *   - Halaman sub/detail dengan back bar: tambah `hideTabs` di <ResponsiveShell>,
 *     lalu render <BottomBackBar> secara manual di dalam halaman itu
 */
export default function MobileAppShell({
  tabs,
  pageTitle,
  pageSubtitle,
  headerVariant = 'title',
  fullBleed = false,
  hideTabs = false,
  children,
}) {
  const { t } = useTranslation()
  const { isDark, toggle } = useDarkMode()
  const navigate = useNavigate()
  const user = getUser()
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).slice(0, 2).join('')

  // Deteksi role dari rute tab — tidak perlu prop tambahan
  const isOrtu = tabs.some((tab) => tab.to.startsWith('/ortu/'))

  return (
    <div className={`min-h-screen ${fullBleed ? 'bg-[#F3F4F6]' : 'bg-bg-page'}`}>
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col">

        {/* ── HEADER ── */}
        {headerVariant !== 'none' && (
          <header
            className={`sticky top-0 z-20 ${
              headerVariant === 'greeting'
                ? 'overflow-hidden rounded-b-[36px] shadow-lg'
                : 'border-b border-border bg-bg-surface'
            }`}
            style={
              headerVariant === 'greeting'
                ? { background: 'linear-gradient(135deg, #007BFF 0%, #35AEFC 55%, #B0E0E6 100%)' }
                : {}
            }
          >
            {headerVariant === 'greeting' ? (
              <div
                className="relative px-5 pb-7"
                style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
              >
                <div className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
                <div className="pointer-events-none absolute -left-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.13)' }} />
                <div className="pointer-events-none absolute -left-2 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.09)' }} />

                <div className="relative flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 text-[14px] font-bold text-white ring-2 ring-white/30">
                      {initials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#35AEFC] bg-success-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-white/65">{pageSubtitle}</p>
                    <h1 className="truncate font-heading text-[19px] font-bold leading-snug text-white">{pageTitle}</h1>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggle}
                      aria-label={t(isDark ? 'nav.lightMode' : 'nav.darkMode')}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 active:scale-95"
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <div className="rounded-full bg-white/15 p-0.5">
                      <NotificationBell />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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

        {/* ── MAIN CONTENT ── */}
        <main className={`flex-1 ${fullBleed ? '' : 'px-4 pt-20 pb-24'}`}>
          {children}
        </main>

        {/* ── BOTTOM TAB BAR ──
            Dirender hanya kalau hideTabs=false (default).
            Komponen terpisah di src/components/BottomTabBar.jsx.
            Untuk halaman yang butuh back bar, set hideTabs dan render
            <BottomBackBar> secara manual di dalam halaman tersebut.
        ── */}
        {!hideTabs && (
          isOrtu
            ? <OrtuBottomTabBar tabs={tabs} />
            : <StaffBottomTabBar tabs={tabs} />
        )}

      </div>
    </div>
  )
}
