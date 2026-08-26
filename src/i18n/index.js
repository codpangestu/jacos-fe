import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import id from './locales/id.json'
import en from './locales/en.json'

export const LANG_STORAGE_KEY = 'jacos-lang'

function getInitialLanguage() {
  const stored = localStorage.getItem(LANG_STORAGE_KEY)
  return stored === 'en' || stored === 'id' ? stored : 'id'
}

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'id',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang)
  i18n.changeLanguage(lang)
}

export default i18n
