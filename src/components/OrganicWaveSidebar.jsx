import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, LogOut, PanelLeftOpen, Settings } from 'lucide-react'
import logo from '../assets/guide/logo baru.svg'

// Warna wave diambil dari frame Figma "Left Organic Wave Sidebar" (#2082F5).
// Masih literal karena migrasi token global belum dijalankan — sama seperti
// warna aksen di komponen dashboard lain, sengaja dibiarkan greppable supaya
// gampang dicari saat migrasi. Lihat catatan migrasi di index.css.
const WAVE_BLUE = '#2082f5'

/**
 * Rail navigasi ikon-only 80px — dipakai DashboardLayout saat sidebar
 * dicollapse. Mengikuti bentuk "organic wave" dari Figma: dua SVG wave cap
 * (atas & bawah) mengapit badan ribbon 78px berisi ikon.
 *
 * Item yang tampil = SATU per grup menu (item yang sedang aktif kalau ada,
 * kalau tidak item pertama grup). Versi sebelumnya meratakan semua item semua
 * grup lalu `slice(0, 8)`, sehingga rail menampilkan daftar acak (Data Siswa,
 * Data Ortu, ...) dan membuang item penting seperti Dashboard Keuangan/Audit
 * Log begitu jumlah menu bertambah.
 */
export default function OrganicWaveSidebar({ menuGroups = [], onExpand, user, onLogout }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const railItems = menuGroups
    .map((group) => {
      const active = group.items.find((item) => item.to === location.pathname)
      const item = active ?? group.items[0]
      return item ? { ...item, groupLabel: group.label } : null
    })
    .filter(Boolean)

  return (
    <aside className="relative z-50 flex w-20 shrink-0 select-none flex-col items-center py-4">
      {/* ── Top area: logo + expand toggle (di atas wave) ── */}
      <div className="flex w-full flex-col items-center gap-3 pb-2">
        <Link
          to="/admin/dashboard"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-300/10 p-1 no-underline transition-colors hover:bg-primary-300/20"
          title="JACOS Dashboard"
        >
          <img src={logo} alt="JACOS" className="h-8 w-8 object-contain" />
        </Link>

        {onExpand && (
          <button
            onClick={onExpand}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-primary-300/10 hover:text-text-primary"
            title={t('nav.toggleSidebar')}
            aria-label={t('nav.toggleSidebar')}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>

      {/* ── Organic wave (bentuk SVG dari Figma) ── */}
      <div className="relative my-auto flex w-full flex-col items-start">
        {/* Top wave cap */}
        <svg
          width="80"
          height="90"
          viewBox="0 0 80 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-[90px] w-20 shrink-0"
          aria-hidden="true"
        >
          <path d="M0 0C0 45 78 45 78 90H0V0Z" fill={WAVE_BLUE} />
        </svg>

        {/* Badan wave berisi ikon */}
        <div className="relative flex w-[78px] flex-col items-center gap-3.5 bg-[#2082f5] py-2">
          {railItems.map((item) => {
            const isActive = location.pathname === item.to
            const Icon = item.icon || LayoutDashboard

            return (
              <div
                key={item.to}
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.to}
                  className={`relative flex items-center justify-center no-underline transition-all duration-200 ${
                    isActive
                      ? 'h-11 w-11 scale-105 rounded-[14px] bg-white text-[#2082f5] shadow-[0_3px_8px_rgba(0,25,77,0.18)]'
                      : 'h-10 w-10 rounded-xl text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                  aria-label={t(item.label)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Ikon "Squircle Active App Grid" dari Figma untuk item aktif */}
                  {isActive ? (
                    <div className="grid h-6 w-6 grid-cols-2 gap-1 p-0.5" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#6f6bef]" />
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#9a97f5]" />
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#6f6bef]" />
                      <span className="h-2.5 w-2.5 rounded-[3px] bg-[#c2c0fa]" />
                    </div>
                  ) : (
                    <Icon size={20} strokeWidth={1.9} />
                  )}
                </Link>

                {/* Tooltip melayang — pengganti label yang hilang di mode rail */}
                {hoveredItem === item.to && (
                  <div
                    className="pointer-events-none absolute left-[54px] z-50 flex flex-col whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-white shadow-xl backdrop-blur-sm"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}
                  >
                    <span className="text-xs font-semibold leading-tight">{t(item.label)}</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      {t(item.groupLabel)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom wave cap */}
        <svg
          width="80"
          height="90"
          viewBox="0 0 80 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-[90px] w-20 shrink-0"
          aria-hidden="true"
        >
          <path d="M78 0C78 45 0 45 0 90L0 0Z" fill={WAVE_BLUE} />
        </svg>
      </div>

      {/* ── Bottom area: settings + logout (di bawah wave) ── */}
      <div className="mt-auto flex w-full flex-col items-center gap-2 pt-2">
        <Link
          to="/account/profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary no-underline transition-colors hover:bg-primary-300/10 hover:text-text-primary"
          title={t('nav.settings')}
          aria-label={t('nav.settings')}
        >
          <Settings size={19} />
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-danger-500/10 hover:text-danger-fg"
            title={t('nav.logout')}
            aria-label={t('nav.logout')}
          >
            <LogOut size={19} />
          </button>
        )}

        {user?.initials && (
          <div
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-300 text-xs font-semibold text-white shadow-sm"
            title={user.name}
          >
            {user.initials}
          </div>
        )}
      </div>
    </aside>
  )
}
