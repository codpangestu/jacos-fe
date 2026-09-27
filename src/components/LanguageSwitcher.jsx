import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { setLanguage } from '../i18n'

/**
 * FR-FE-5.3 — language switcher ID/EN, persist ke localStorage via lib/i18n.
 *
 * `variant="figma"` mengikuti kontrol "Switch Bahasa Button" di frame Figma
 * (globe + label + badge bahasa aktif). Figma hanya menampilkan satu badge
 * ("ID") sebagai status; di sini kedua bahasa tetap bisa diklik supaya
 * fungsinya tidak hilang — badge aktif disorot, yang lain jadi tombol biasa.
 */
export default function LanguageSwitcher({ className = '', variant = 'default' }) {
  const { t, i18n } = useTranslation()

  if (variant === 'figma') {
    return (
      <div
        className={`flex h-8 shrink-0 items-center gap-1.5 rounded-[10px] bg-[#eef1f7] pr-2 pl-2.5 dark:bg-white/10 ${className}`}
      >
        <Globe size={14} className="shrink-0 text-text-secondary" />
        <span className="text-[11px] font-semibold text-text-primary">{t('nav.language')}</span>
        <div className="flex items-center gap-0.5">
          {['id', 'en'].map((lang) => {
            const active = i18n.language === lang
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={active}
                className={`h-[15px] cursor-pointer rounded-[4px] px-1.5 text-[8.5px] font-bold uppercase transition-colors ${
                  active ? 'bg-[#2982f2] text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {lang}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center rounded-full bg-bg-page p-1 ${className}`}>
      {['id', 'en'].map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
            i18n.language === lang
              ? 'bg-bg-surface text-primary-300 shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  )
}
