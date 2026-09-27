import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useDarkMode from '../hooks/useDarkMode'
import logo from '../assets/guide/logo baru.svg'
import { logout as apiLogout } from '../lib/api'
import { clearUser, getUser, ROLE_LABEL, ROLE_PORTAL_LABEL } from '../lib/auth'
import LanguageSwitcher from '../components/LanguageSwitcher'
import NotificationBell from '../components/NotificationBell'
import OrganicWaveSidebar from '../components/OrganicWaveSidebar'
import { NAV_TOP_TABS } from '../config/navigation'

// ── Warna sidebar — Figma "Left Organic Curve Sidebar (Expanded)" ─────────
// Node 83:768, file FTR1cd10409XotFDmBFy0m. Dua stop gradient diambil apa
// adanya dari SVG node 83:777 (<linearGradient> x1/y1 0,0 → x2/y2 295.082,
// 938.664 dengan userSpaceOnUse).
//
// Kontras yang DICATAT, bukan diperbaiki sendiri (sesuai konvensi "bentuk plek
// Figma adalah permintaan eksplisit", frontend/context.md §Konvensi): teks
// putih di atas #2082F5 = 4.31:1, dan di atas item aktif putih 18% = 3.4:1 —
// keduanya di bawah AA 4.5:1 untuk teks 13.5px. Setara utang kontras
// AgendaHighlightCard (3.77:1) yang sudah tercatat.
const SIDEBAR_BLUE_FROM = '#2082F5'
const SIDEBAR_BLUE_TO = '#1466CA'

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

  // Label pill putih di puncak panel biru. Diambil dari label GRUP yang sedang
  // aktif — bukan judul halaman — supaya pill-nya tidak menampilkan teks yang
  // sama persis dengan item nav aktif di bawahnya. Halaman di luar menu
  // (mis. detail siswa) jatuh ke pageTitle dari halamannya.
  const activeGroup = menuGroups.find((group) =>
    group.items.some((item) => item.to === location.pathname),
  )
  const sidebarSection = activeGroup ? t(activeGroup.label) : pageTitle

  // Subtitle di header — Figma menulis "Admin Portal". Dipetakan per role
  // supaya guru/staff/orang tua tidak ikut tertulis "Admin".
  const portalLabel = ROLE_PORTAL_LABEL[storedUser?.role] ?? user.role

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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-bg-sidebar)] transition-all duration-200 lg:relative lg:flex lg:h-full lg:translate-x-0 lg:shrink-0
          ${collapsed ? 'lg:hidden' : 'lg:translate-x-0'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header — Figma node 83:770 (blok 214x39 di x=20,y=25): logo 38x40,
            wordmark Plus Jakarta Sans 16/700 #0c2b4c, subtitle Inter 10.5
            #64748b, tombol collapse 32x33 #f1f5f9 dengan chevron 6x12 #475569.
            Blok ini duduk DI ATAS panel biru, jadi latarnya tetap ikut tema
            (#f1f5f9 adalah nilai light-mode; di dark dipakai putih transparan). */}
        <div className="flex h-[82px] shrink-0 items-center pl-5 pr-[22px]">
          <Link to="/admin/dashboard" className="flex min-w-0 items-center gap-[10px] no-underline">
            <img src={logo} alt="JACOS" className="h-10 w-[38px] shrink-0 object-contain" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-heading text-[16px] font-bold leading-[20px] text-[#0c2b4c] dark:text-[var(--color-sidebar-text)]">
                JACOS
              </span>
              <span className="truncate text-[10.5px] font-normal leading-[13px] text-[#64748b] dark:text-[var(--color-sidebar-text-muted)]">
                {portalLabel}
              </span>
            </span>
          </Link>
          <button
            onClick={() => {
              setCollapsed(true)
              localStorage.setItem('sidebar_collapsed', 'true')
            }}
            className="ml-auto hidden h-[33px] w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-[#f1f5f9] text-[#475569] transition-colors hover:bg-[#e6ebf2] dark:bg-white/10 dark:text-[var(--color-sidebar-text)] dark:hover:bg-white/15 lg:flex"
            aria-label={t('nav.toggleSidebar')}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        </div>

        {/* ── Panel biru — Figma node 83:777 ──
            FULL-BLEED (x=0..256, mulai y=82), bukan kartu ber-margin. Bentuk
            dari path SVG-nya: sudut kiri siku, lalu lengkung organik di
            kanan-atas dari x=176 ke x=256 setinggi 86 (border-radius 80x86
            menghasilkan titik ujung yang sama dengan kurva kubik Figma).
            Radius kanan-bawah di Figma (24x26) TIDAK dipakai: di frame aslinya
            panel overflow ke bawah (82+951 > tinggi frame 988) sehingga lengkung
            itu tidak pernah terlihat, dan di sini panel full-height.
            Sudut gradient 162.5° dihitung dari vektor Figma (0,0)→(295.08,938.66). */}
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{
            background: `linear-gradient(162.5deg, ${SIDEBAR_BLUE_FROM} 0%, ${SIDEBAR_BLUE_TO} 100%)`,
            borderTopRightRadius: '80px 86px',
          }}
        >
          {/* Pill putih — Figma 83:779: 168x40 radius 20 (stadium), di x=22
              (RATA KIRI, bukan di tengah), teks 23px dari tepi kiri dalam,
              Plus Jakarta Sans 13/700 #2082f5. */}
          <div className="shrink-0 pl-[22px] pr-[18px] pt-8">
            <span
              title={pageTitle}
              className="flex h-10 w-[168px] items-center rounded-full bg-white pl-[23px] font-heading text-[13px] font-bold leading-4 text-[#2082f5]"
            >
              <span className="truncate">{sidebarSection}</span>
            </span>
          </div>

          {/* Nav menu — pitch baris Figma 47.5px (baris 41 + gap 6.5), teks
              mulai di x=64 (22 margin + 13 padding + ikon 20 + gap 9). */}
          <nav className="mt-[25px] min-h-0 flex-1 overflow-y-auto pl-[22px] pr-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {menuGroups.map((group) => {
              const isOpen = openGroups[group.label] ?? false
              const hasActive = group.items.some((item) => location.pathname === item.to)
              const GroupIcon = group.items[0]?.icon
              // Grup dengan 1 item dirender sebagai flat link langsung (tanpa collapsible)
              const isFlat = group.items.length === 1

              return (
                <div key={group.label} className="mb-[6.5px]">

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
                          className={`flex h-[41px] items-center gap-[9px] rounded-[12.35px] pl-[13px] pr-3 text-left no-underline transition-colors
                            ${active
                              ? 'bg-white/[0.18] font-bold text-white'
                              : 'font-normal text-white hover:bg-white/[0.08]'
                            }`}
                        >
                          <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                          {!collapsed && (
                            <span className="flex-1 truncate text-[13.5px]">{t(item.label)}</span>
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
                          className={`flex h-[41px] w-full cursor-pointer items-center gap-[9px] rounded-[12.35px] pl-[13px] pr-3 text-left transition-colors
                            ${hasActive
                              ? 'font-bold text-white'
                              : 'font-normal text-white hover:bg-white/[0.08]'
                            }`}
                        >
                          {GroupIcon && <GroupIcon size={20} strokeWidth={1.8} className="shrink-0" />}
                          <span className="flex-1 truncate text-[13.5px]">{t(group.label)}</span>
                          <ChevronDown
                            size={14}
                            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                          />
                        </button>
                      ) : (
                        <div className="my-2 flex justify-center">
                          <span className="h-px w-6 bg-white/25" />
                        </div>
                      )}

                      {/* ── Sub-items dengan tree line ── */}
                      {(isOpen || collapsed) && (
                        <ul className="mt-[6.5px] flex flex-col gap-[6.5px]">
                          {group.items.map((item) => {
                            const active = location.pathname === item.to
                            const Icon = item.icon
                            return (
                              <li key={item.to} className={collapsed ? '' : 'relative ml-[22px]'}>
                                {!collapsed && (
                                  <span className="absolute left-0 top-0 h-full w-px bg-white/25" />
                                )}
                                <Link
                                  to={item.to}
                                  title={collapsed ? t(item.label) : undefined}
                                  className={`flex h-[41px] items-center gap-[9px] rounded-[12.35px] text-left no-underline transition-colors
                                    ${collapsed ? 'px-3' : 'pl-[13px] pr-3'}
                                    ${active
                                      ? 'bg-white/[0.18] font-bold text-white'
                                      : 'font-normal text-white hover:bg-white/[0.08]'
                                    }`}
                                >
                                  <Icon size={20} strokeWidth={1.8} className="shrink-0" />
                                  {!collapsed && (
                                    <>
                                      <span className="flex-1 truncate text-[13.5px]">{t(item.label)}</span>
                                      {active && <ChevronRight size={14} className="shrink-0 opacity-80" />}
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

          {/* Sidebar alert card (pending approvals, etc.) — kartu gradient
              lamanya ketabrakan warnanya dengan panel biru ini, jadi diganti
              kartu putih solid: kontras teksnya tinggi dan sejalan dengan
              bahasa visual "putih di atas biru" panel ini. */}
          {sidebarAlert && !collapsed && (
            <div className="mr-[18px] ml-[22px] mt-3 shrink-0 rounded-2xl bg-white p-4">
              <p className="text-sm font-semibold text-[#1263CB]">{sidebarAlert.title}</p>
              <p className="mt-1 text-xs text-[#1263CB]/80">{sidebarAlert.description}</p>
              <Link
                to={sidebarAlert.ctaTo}
                className="mt-3 inline-block rounded-lg bg-[#1263CB] px-3 py-1.5 text-xs font-semibold text-white no-underline"
              >
                {sidebarAlert.ctaLabel}
              </Link>
            </div>
          )}

          {/* Footer — Figma node 83:973: divider 216px putih 25% di x=20,
              ikon Pengaturan 18x18 di x=25 lalu teks di x=54 (Inter 14/400),
              jarak antar baris 44px. */}
          <div className="mt-auto shrink-0 px-5 pt-[26px]">
            <span className="block h-px bg-white/25" />
            <div className="mt-2 flex flex-col pb-4">
              <Link
                to="/account/profile"
                className="flex h-11 items-center gap-[11px] pl-[5px] text-sm font-normal text-white no-underline transition-colors hover:text-white/80"
              >
                <Settings size={18} strokeWidth={1.8} className="shrink-0" />
                {!collapsed && <span>{t('nav.settings')}</span>}
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-11 w-full cursor-pointer items-center gap-[11px] border-0 bg-transparent pl-[5px] text-left text-sm font-normal text-white transition-colors hover:text-white/80"
              >
                <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
                {!collapsed && <span>{t('nav.logout')}</span>}
              </button>
            </div>
          </div>
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
