import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Mic,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false)
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

  async function handleLogout() {
    try {
      await apiLogout()
    } finally {
      clearUser()
      navigate('/login')
    }
  }

  return (
    <div className="flex min-h-screen bg-bg-page text-text-primary">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <button
          aria-label={t('nav.closeMenu')}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* ══════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          border-[var(--color-sidebar-border)] bg-[var(--color-bg-sidebar)]
          ${collapsed ? 'lg:w-18' : 'lg:w-64'}
          w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar header: logo + collapse toggle */}
        <div className="flex h-18 items-center justify-between border-b border-[var(--color-sidebar-border)] px-4">
          <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-2.5 no-underline">
            <img src={logo} alt="JACOS" className="h-8 w-8 shrink-0 object-contain" />
            {!collapsed && (
              <span className="truncate font-heading text-sm font-bold text-[var(--color-sidebar-text)]">
                JACOS
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[var(--color-sidebar-hover-bg)] lg:block
              text-[var(--color-sidebar-text-muted)]"
            aria-label={t('nav.toggleSidebar')}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuGroups.map((group) => {
            const isOpen = openGroups[group.label] ?? false
            const hasActive = group.items.some((item) => location.pathname === item.to)
            return (
              <div key={group.label} className="mb-1">
                {/* Group header — clickable to expand/collapse (hidden when sidebar collapsed) */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={`flex w-full items-center justify-between rounded-[8px] px-3 py-1.5 transition-colors
                      ${hasActive
                        ? 'text-[var(--color-sidebar-active-text)]'
                        : 'text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-sidebar-text)]'
                      }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      {t(group.label)}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </button>
                ) : (
                  /* Separator dot when collapsed */
                  <div className="my-2 flex justify-center">
                    <span className="h-px w-6 bg-[var(--color-sidebar-border)]" />
                  </div>
                )}

                {/* Items — visible when open (or always when sidebar collapsed) */}
                {(isOpen || collapsed) && (
                  <ul className="mt-0.5 flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const active = location.pathname === item.to
                      const Icon = item.icon
                      return (
                        <li key={item.to}>
                          <Link
                            to={item.to}
                            title={collapsed ? t(item.label) : undefined}
                            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors no-underline
                              ${active
                                ? 'bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)] shadow-sm'
                                : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)]'
                              }`}
                          >
                            <Icon size={17} className="shrink-0" />
                            {!collapsed && (
                              <span className="flex-1 truncate">{t(item.label)}</span>
                            )}
                            {!collapsed && active && (
                              <ChevronRight size={13} className="shrink-0 opacity-60" />
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
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
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-30 flex h-18 items-center gap-4 border-b border-border bg-bg-surface px-4 lg:px-6">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-text-secondary hover:bg-primary-300/10 lg:hidden"
            aria-label={t('nav.openMenu')}
          >
            <Menu size={20} />
          </button>

          {/* Page title + subtitle */}
          <div className="min-w-0">
            <h1 className="truncate font-heading text-xl font-bold text-text-primary">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="truncate text-xs text-text-secondary">{pageSubtitle}</p>
            )}
          </div>

          {/* Search bar — pill style, centered */}
          {showSearch && (
            <div className="mx-4 hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-border bg-bg-page px-4 py-2 lg:flex">
              <Search size={15} className="shrink-0 text-text-secondary" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
              <Mic size={15} className="shrink-0 text-text-secondary" />
            </div>
          )}

          {/* Right actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LanguageSwitcher className="max-sm:hidden" />

            {/* ── Theme toggle: sun / moon — matches Academix reference ── */}
            <div className="flex items-center gap-0.5 rounded-full bg-bg-page p-1">
              {/* Sun — active when light mode */}
              <button
                onClick={() => isDark && toggle()}
                aria-label={t('nav.lightMode')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  !isDark
                    ? 'bg-white shadow text-accent-500'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Sun size={16} />
              </button>
              {/* Moon — active when dark mode */}
              <button
                onClick={() => !isDark && toggle()}
                aria-label={t('nav.darkMode')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  isDark
                    ? 'bg-bg-surface shadow text-primary-100'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Moon size={16} />
              </button>
            </div>

            <NotificationBell />

            {/* User avatar + name + role */}
            <button className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-primary-300/10">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300 text-sm font-semibold text-white">
                {user.initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-text-primary">
                  {user.name}
                </span>
                <span className="block text-xs leading-tight text-text-secondary">
                  {user.role}
                </span>
              </span>
              <ChevronRight size={14} className="hidden text-text-secondary sm:block" />
            </button>
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
