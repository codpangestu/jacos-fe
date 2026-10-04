import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Bottom tab bar untuk role Orang Tua (dark pill #181A20).
 * Dirender fixed di bawah layar — hanya untuk halaman utama.
 *
 * Props:
 *   tabs  — array dari MOBILE_TABS['orang_tua']
 */
export function OrtuBottomTabBar({ tabs }) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] pointer-events-none"
      aria-label="Navigasi utama"
    >
      <div
        className="pointer-events-auto px-4 pt-1"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <ul className="flex h-14 items-center justify-around rounded-[28px] bg-[#181A20] px-2 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.30)]">
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
                  className="flex w-full flex-col items-center gap-0.5 py-0.5 no-underline outline-none"
                >
                  {active ? (
                    <>
                      <span className="flex h-[26px] w-9 items-center justify-center rounded-[12px] bg-[#037EFE]">
                        <Icon size={15} strokeWidth={2} className="text-white" />
                      </span>
                      <span className="text-[9px] font-bold leading-[11px] text-[#E0E7FF]">
                        {t(tab.label)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Icon size={17} strokeWidth={1.4} className="text-[#9CA3AF]" />
                      <span className="text-[9px] font-medium leading-[11px] text-[#9CA3AF]">
                        {t(tab.label)}
                      </span>
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/**
 * Bottom tab bar untuk role Staff (elevated bubble).
 */
export function StaffBottomTabBar({ tabs }) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px] pointer-events-none"
      aria-label="Navigasi utama"
    >
      <div className="pointer-events-auto rounded-t-[24px] border-t border-border bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
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
                    <>
                      <span className="absolute -top-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary-300 shadow-[0_4px_16px_rgba(45,148,218,0.50)] ring-4 ring-white">
                        <Icon size={24} strokeWidth={2.2} className="text-white" />
                      </span>
                      <span className="mt-8 text-[11px] font-bold text-primary-300">
                        {t(tab.label)}
                      </span>
                    </>
                  ) : (
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
  )
}
