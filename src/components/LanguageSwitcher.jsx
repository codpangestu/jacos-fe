import { useTranslation } from 'react-i18next'
import { setLanguage } from '../i18n'

/** FR-FE-5.3 — language switcher ID/EN, persist ke localStorage via lib/i18n. */
export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation()

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
