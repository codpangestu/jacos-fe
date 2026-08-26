import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useDarkMode from '../hooks/useDarkMode'
import logo from '../assets/guide/logo.png'
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
  const storedUser = getUser()
  const user = {
    name: storedUser?.name ?? t('nav.defaultUserName'),
    role: ROLE_LABEL[storedUser?.role] ?? '-',
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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg-page text-text-primary">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label={t('nav.closeMenu')}
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-bg-sidebar transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          collapsed ? 'lg:w-18' : 'lg:w-60'
        } w-60 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar header */}
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-4">
          <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="JACOS" className="h-8 w-8 shrink-0 object-contain" />
            {!collapsed && (
              <span className="truncate font-heading text-sm font-bold text-white">JACOS</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden shrink-0 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:block"
            aria-label={t('nav.toggleSidebar')}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                  {t(group.label)}
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = location.pathname === item.to
                  const Icon = item.icon
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        title={collapsed ? t(item.label) : undefined}
                        className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                          active ? 'bg-primary-300 text-white' : 'text-white/85 hover:bg-white/10'
                        }`}
                      >
                        <Icon size={20} className="shrink-0" />
                        {!collapsed && <span className="truncate">{t(item.label)}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Alert card */}
        {sidebarAlert && !collapsed && (
          <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-900 p-4 text-white">
            <p className="text-sm font-semibold">{sidebarAlert.title}</p>
            <p className="mt-1 text-xs text-white/80">{sidebarAlert.description}</p>
            <Link
              to={sidebarAlert.ctaTo}
              className="mt-3 inline-block rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary-300"
            >
              {sidebarAlert.ctaLabel}
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/10 p-3">
          <Link
            to="/account/profile"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
          >
            <Settings size={20} />
            {!collapsed && <span>{t('nav.settings')}</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
          >
            <LogOut size={20} />
            {!collapsed && <span>{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-18 items-center gap-4 border-b border-border bg-bg-surface px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-text-secondary hover:bg-primary-300/10 lg:hidden"
            aria-label={t('nav.openMenu')}
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate font-heading text-lg font-bold text-text-primary sm:text-xl">
              {pageTitle}
            </h1>
            {pageSubtitle && <p className="truncate text-xs text-text-secondary">{pageSubtitle}</p>}
          </div>

          {showSearch && (
            <div className="ml-4 hidden max-w-80 flex-1 items-center gap-2 rounded-full border border-border bg-bg-page px-4 py-2 lg:flex">
              <Search size={16} className="text-text-secondary" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="max-sm:hidden" />

            <div className="flex items-center rounded-full bg-bg-page p-1">
              <button
                onClick={() => isDark && toggle()}
                className={`rounded-full p-1.5 transition-colors ${!isDark ? 'bg-bg-surface text-accent-500 shadow-sm' : 'text-text-secondary'}`}
                aria-label={t('nav.lightMode')}
              >
                <Sun size={16} />
              </button>
              <button
                onClick={() => !isDark && toggle()}
                className={`rounded-full p-1.5 transition-colors ${isDark ? 'bg-bg-surface text-primary-100 shadow-sm' : 'text-text-secondary'}`}
                aria-label={t('nav.darkMode')}
              >
                <Moon size={16} />
              </button>
            </div>

            <NotificationBell />

            <button className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 hover:bg-primary-300/10">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-300 text-sm font-semibold text-white">
                {user.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-text-primary">{user.name}</span>
                <span className="block text-xs text-text-secondary">{user.role}</span>
              </span>
              <ChevronDown size={16} className="hidden text-text-secondary sm:block" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-6">
          <main className="min-w-0 flex-1 space-y-6">{children}</main>
          {rightRail && <aside className="w-full shrink-0 space-y-6 lg:w-80">{rightRail}</aside>}
        </div>
      </div>
    </div>
  )
}
