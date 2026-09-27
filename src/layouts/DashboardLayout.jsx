import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useDarkMode from '../hooks/useDarkMode'
import logo from '../assets/guide/logo baru.svg'
import { logout as apiLogout } from '../lib/api'
import { clearUser, getUser, ROLE_LABEL } from '../lib/auth'
import LanguageSwitcher from '../components/LanguageSwitcher'
import NotificationBell from '../components/NotificationBell'
import OrganicWaveSidebar from '../components/OrganicWaveSidebar'
import { NAV_TOP_TABS } from '../config/navigation'

export default function DashboardLayout({
  menuGroups,
  sidebarAlert,
  pageTitle,
  pageSubtitle,
  showSearch = true,
  rightRail,
  children,
}) {
  const { t } = useTranslation()
  const { isDark, toggle } = useDarkMode()
  const location = useLocation()
  const navigate = useNavigate()
  // Default EXPANDED (240px). Rail ikon-only (OrganicWaveSidebar) hanya muncul
  // kalau user sendiri yang menekan collapse — sebelumnya `!== 'false'` bikin
  // rail jadi state awal, jadi sidebar 240px praktis tidak pernah terlihat.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)
  const storedUser = getUser()
  const user = {
    name: storedUser?.name ?? t('nav.defaultUserName'),
    role: ROLE_LABEL[storedUser?.role] ?? '-',
    initials: (storedUser?.name ?? 'U')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join(''),
  }

  const topTabs = NAV_TOP_TABS[storedUser?.role] ?? []

  // Track which groups are open. Default: grup yang punya active item terbuka,
  // sisanya tertutup supaya sidebar tidak terlalu panjang.
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {}
    menuGroups.forEach((group) => {
      const hasActive = group.items.some((item) => item.to === location.pathname)
      initial[group.label] = hasActive
    })
    // Jika tidak ada yang aktif (pertama kali masuk), buka grup pertama saja
    const anyOpen = Object.values(initial).some(Boolean)
    if (!anyOpen && menuGroups.length > 0) {
      initial[menuGroups[0].label] = true
    }
    return initial
  })

  function toggleGroup(label) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  useEffect(() => {
    if (!storedUser) navigate('/login', { replace: true })
  }, [storedUser, navigate])

  // Judul halaman + tanggal tidak lagi dirender di bar atas (mengikuti frame
  // Figma, yang tidak menaruh judul halaman di sana). Keduanya dipindah ke judul
  // tab browser supaya konteks halaman tidak hilang total — ini satu-satunya
  // tempat `pageSubtitle` masih terpakai sekarang.
  useEffect(() => {
    if (!pageTitle) return
    document.title = pageSubtitle
      ? `${pageTitle} — ${pageSubtitle} · JACOS`
      : `${pageTitle} · JACOS`
  }, [pageTitle, pageSubtitle])

  async function handleLogout() {
    try {
      await apiLogout()
    } finally {
      clearUser()
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page text-text-primary">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <button
          aria-label={t('nav.closeMenu')}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* ══════════════════════════════════════════════
          SIDEBAR (Figma Left Organic Wave Sidebar)
      ══════════════════════════════════════════════ */}
      {/* Desktop Compact: Figma Left Organic Wave Sidebar */}
      {collapsed && (
        <div className="hidden lg:flex lg:h-full lg:shrink-0 border-r border-[var(--color-sidebar-border)] bg-[var(--color-bg-sidebar)]">
          <OrganicWaveSidebar
            menuGroups={menuGroups}
            onExpand={() => {
              setCollapsed(false)
              localStorage.setItem('sidebar_collapsed', 'false')
            }}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Expanded Sidebar (Desktop when opened) & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 lg:relative lg:flex lg:h-full lg:translate-x-0 lg:shrink-0
          border-[var(--color-sidebar-border)] bg-[var(--color-bg-sidebar)] w-64
          ${collapsed ? 'lg:hidden' : 'lg:translate-x-0'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar header: logo + collapse toggle */}
        <div className="flex h-18 items-center justify-between border-b border-[var(--color-sidebar-border)] px-4">
          <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-2.5 no-underline">
            <img src={logo} alt="JACOS" className="h-8 w-8 shrink-0 object-contain" />
            <span className="truncate font-heading text-sm font-bold text-[var(--color-sidebar-text)]">
              JACOS
            </span>
          </Link>
          <button
            onClick={() => {
              setCollapsed(true)
              localStorage.setItem('sidebar_collapsed', 'true')
            }}
            className="hidden shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[var(--color-sidebar-hover-bg)] lg:block
              text-[var(--color-sidebar-text-muted)]"
            aria-label={t('nav.toggleSidebar')}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* Nav menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuGroups.map((group) => {
            const isOpen = openGroups[group.label] ?? false
            const hasActive = group.items.some((item) => location.pathname === item.to)
            const GroupIcon = group.items[0]?.icon
            // Grup dengan 1 item dirender sebagai flat link langsung (tanpa collapsible)
            const isFlat = group.items.length === 1

            return (
              <div key={group.label} className="mb-0.5">

                {isFlat ? (
                  /* ── Flat single-item: langsung jadi link, tidak ada sub-tree ── */
                  (() => {
                    const item = group.items[0]
                    const active = location.pathname === item.to
                    const Icon = item.icon
                    return (
                      <Link
                        to={item.to}
                        title={collapsed ? t(item.label) : undefined}
                        className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-left no-underline transition-colors
                          ${active
                            ? 'text-[var(--color-sidebar-text)] font-semibold'
                            : 'text-[var(--color-sidebar-text-muted)] font-medium hover:text-[var(--color-sidebar-text)]'
                          }`}
                      >
                        <Icon size={17} className="shrink-0" />
                        {!collapsed && (
                          <span className="flex-1 truncate text-[13px]">{t(item.label)}</span>
                        )}
                      </Link>
                    )
                  })()
                ) : (
                  <>
                    {/* ── Group header collapsible ── */}
                    {!collapsed ? (
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors
                          ${hasActive
                            ? 'text-[var(--color-sidebar-text)]'
                            : 'text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)]'
                          } ${isOpen && hasActive ? 'bg-[var(--color-sidebar-hover-bg)]' : ''}`}
                      >
                        {GroupIcon && (
                          <GroupIcon
                            size={17}
                            className={`shrink-0 ${hasActive ? 'text-[var(--color-sidebar-active-text)]' : ''}`}
                          />
                        )}
                        <span className={`flex-1 truncate text-[13px] ${hasActive ? 'font-semibold' : 'font-medium'}`}>
                          {t(group.label)}
                        </span>
                        <ChevronDown
                          size={13}
                          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </button>
                    ) : (
                      <div className="my-2 flex justify-center">
                        <span className="h-px w-6 bg-[var(--color-sidebar-border)]" />
                      </div>
                    )}

                    {/* ── Sub-items dengan tree line ── */}
                    {(isOpen || collapsed) && (
                      <ul className="mt-0.5 flex flex-col">
                        {group.items.map((item) => {
                          const active = location.pathname === item.to
                          const Icon = item.icon
                          return (
                            <li key={item.to} className={collapsed ? '' : 'relative ml-[22px]'}>
                              {!collapsed && (
                                <span className="absolute left-0 top-0 h-full w-px bg-[var(--color-sidebar-border)]" />
                              )}
                              <Link
                                to={item.to}
                                title={collapsed ? t(item.label) : undefined}
                                className={`flex items-center gap-3 rounded-[8px] py-2 text-left no-underline transition-colors
                                  ${collapsed ? 'px-3' : 'pl-4 pr-2'}
                                  ${active
                                    ? 'text-[var(--color-sidebar-text)] font-semibold'
                                    : 'text-[var(--color-sidebar-text-muted)] font-normal hover:text-[var(--color-sidebar-text)]'
                                  }`}
                              >
                                <Icon size={17} className="shrink-0" />
                                {!collapsed && (
                                  <>
                                    <span className="flex-1 truncate text-[13px]">{t(item.label)}</span>
                                    {active && <ChevronRight size={13} className="shrink-0 opacity-50" />}
                                  </>
                                )}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sidebar alert card (pending approvals, etc.) */}
        {sidebarAlert && !collapsed && (
          <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-900 p-4 text-white">
            <p className="text-sm font-semibold">{sidebarAlert.title}</p>
            <p className="mt-1 text-xs text-white/80">{sidebarAlert.description}</p>
            <Link
              to={sidebarAlert.ctaTo}
              className="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary-300 no-underline"
            >
              {sidebarAlert.ctaLabel}
            </Link>
          </div>
        )}

        {/* Sidebar footer: settings + logout */}
        <div className="border-t border-[var(--color-sidebar-border)] p-3">
          <Link
            to="/account/profile"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium no-underline transition-colors
              text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)]`}
          >
            <Settings size={18} />
            {!collapsed && <span>{t('nav.settings')}</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors
              text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)]`}
          >
            <LogOut size={18} />
            {!collapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════
          MAIN COLUMN
      ══════════════════════════════════════════════ */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">

        {/* ── Topbar — "Top Navigation Bar" dari frame Figma ──
            Susunan: tab lintas-seksi + search box (kiri), lalu theme switcher,
            bell, settings, bahasa, dan CTA (kanan).

            Dua catatan penyimpangan kecil yang disengaja:
            1. Figma menaruh bar ini tanpa garis pemisah di atas kanvas; di sini
               tetap ada border-b + sticky, karena bar yang tidak sticky akan
               hilang saat user scroll di halaman tabel/list yang panjang.
            2. Figma tidak punya avatar/user menu di bar atas, dan itu tidak
               bikin kehilangan akses: Profil & Keluar ada di footer sidebar. */}
        <header
          aria-label={pageTitle}
          className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg-surface px-4 lg:px-8"
        >

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-text-secondary hover:bg-primary-300/10 lg:hidden"
            aria-label={t('nav.openMenu')}
          >
            <Menu size={20} />
          </button>

          {/* Tabs lintas-seksi */}
          {topTabs.length > 0 && (
            <nav className="hidden items-center gap-6 lg:flex">
              {topTabs.map((tab) => {
                const active = location.pathname === tab.to
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex h-16 items-center text-[13.5px] font-medium no-underline transition-colors ${
                      active
                        ? 'text-[#1e1b4b] dark:text-text-primary'
                        : 'text-[#475569] hover:text-text-primary dark:text-text-secondary'
                    }`}
                  >
                    {t(tab.label)}
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#5b61f6]" />
                    )}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Search box */}
          {showSearch && (
            <div className="ml-2 hidden h-[34px] w-[230px] shrink-0 items-center gap-2 rounded-[10px] border border-border bg-bg-surface px-3 lg:flex">
              <Search size={14} className="shrink-0 text-text-secondary" />
              <input
                type="text"
                placeholder={t('dashboard.searchPlaceholder')}
                className="w-full bg-transparent text-[11.5px] text-text-primary placeholder:text-[#94a3b8] focus:outline-none"
              />
            </div>
          )}

          {/* Kontrol kanan */}
          <div className="ml-auto flex shrink-0 items-center gap-3.5">
            {/* Theme switcher — pill Light/Dark */}
            <div className="flex items-center gap-0.5 rounded-full bg-[#eef1f7] p-[3px] dark:bg-white/10">
              <button
                onClick={() => isDark && toggle()}
                aria-label={t('nav.lightMode')}
                aria-pressed={!isDark}
                className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-[7px] px-2.5 text-[11px] font-semibold transition-colors ${
                  !isDark ? 'bg-[#2082f5] text-white' : 'text-[#475569] dark:text-text-secondary'
                }`}
              >
                <Sun size={12} />
                <span className="max-sm:hidden">{t('nav.lightMode')}</span>
              </button>
              <button
                onClick={() => !isDark && toggle()}
                aria-label={t('nav.darkMode')}
                aria-pressed={isDark}
                className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-[7px] px-2.5 text-[11px] font-semibold transition-colors ${
                  isDark ? 'bg-[#2082f5] text-white' : 'text-[#475569]'
                }`}
              >
                <Moon size={12} />
                <span className="max-sm:hidden">{t('nav.darkMode')}</span>
              </button>
            </div>

            <NotificationBell />

            <Link
              to="/account/profile"
              aria-label={t('nav.settings')}
              title={t('nav.settings')}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary no-underline transition-colors hover:bg-primary-300/10 hover:text-text-primary"
            >
              <Settings size={16} />
            </Link>

            <LanguageSwitcher variant="figma" className="max-md:hidden" />

            {storedUser?.role === 'admin' && (
              <Link
                to="/admin/announcements"
                className="flex h-8 items-center rounded-[10px] bg-[#0f1220] px-4 text-[11.5px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
              >
                {t('dashboard.newAnnouncement')} +
              </Link>
            )}
          </div>
        </header>

        {/* ── Content area ── */}
        <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-6">
          <main className="min-w-0 flex-1 space-y-6">{children}</main>
          {rightRail && (
            <aside className="w-full shrink-0 space-y-6 lg:sticky lg:top-24 lg:w-80 lg:self-start">{rightRail}</aside>
          )}
        </div>
      </div>
    </div>
  )
}
