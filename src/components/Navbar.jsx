import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/guide/logo baru.svg'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-100 transition-[padding] duration-350 ease-in-out ${
        scrolled ? 'px-6 py-2 max-sm:px-3 max-sm:py-2' : 'px-5 py-2.5 max-sm:px-3'
      }`}
    >
      <div
        className={`mx-auto flex h-13 max-w-360 items-center rounded-[14px] border px-5 transition-[background-color,border-color,box-shadow] duration-350 ease-in-out max-sm:px-3.5 ${
          scrolled
            ? 'border-[rgba(51,166,242,0.22)] bg-[rgba(10,38,71,0.68)] shadow-[0_8px_32px_rgba(10,38,71,0.30),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[22px]'
            : 'border-white/65 bg-white/80 shadow-[0_2px_16px_rgba(51,166,242,0.12)] backdrop-blur-[14px]'
        }`}
      >
        {/* Brand */}
        <Link to="/" className="mr-3.5 flex shrink-0 items-center no-underline">
          <img src={logo} alt="Jakarta Cosmopolite Islamic School" className="block h-9.5 w-auto" />
        </Link>

        {/* Divider */}
        <span
          aria-hidden="true"
          className={`mr-4.5 h-5 w-px shrink-0 transition-colors duration-350 max-sm:hidden ${
            scrolled ? 'bg-white/14' : 'bg-[rgba(15,23,42,0.15)]'
          }`}
        />

        {/* Nav links */}
        <nav aria-label="Main navigation" className="flex items-center gap-0.5 max-sm:hidden">
          {[
            { to: '/', label: t('homepage.navHome'), internal: true },
            { to: '#admission', label: t('homepage.navAdmission') },
            { to: '#about', label: t('homepage.navAbout') },
            { to: '#contact', label: t('homepage.navContact') },
          ].map((item) => {
            const className = `whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium no-underline transition-colors ${
              scrolled
                ? 'text-white/82 hover:bg-white/9 hover:text-white'
                : 'text-text-primary hover:bg-[rgba(45,148,218,0.10)] hover:text-primary-300'
            }`
            return item.internal ? (
              <Link key={item.label} to={item.to} className={className}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.to} className={className}>
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Spacer */}
        <span className="flex-1" />

        <LanguageSwitcher className="mr-1.5 max-sm:hidden" />

        {/* CTA */}
        <Link
          to="/login"
          className={`shrink-0 whitespace-nowrap rounded-[10px] px-4 py-1.75 text-sm font-medium no-underline transition-colors ${
            scrolled
              ? 'text-white/82 hover:bg-white/9 hover:text-white'
              : 'text-text-primary hover:bg-[rgba(45,148,218,0.08)] hover:text-primary-300'
          }`}
        >
          {t('homepage.signIn')}
        </Link>
        <Link
          to="/login"
          className={`ml-1.5 shrink-0 whitespace-nowrap rounded-[10px] border-[1.5px] px-4.5 py-1.75 text-sm font-semibold no-underline transition-colors ${
            scrolled
              ? 'border-white/32 bg-transparent text-white/92 hover:border-white/60 hover:bg-white/12 hover:text-white'
              : 'border-primary-300 bg-transparent text-primary-400 hover:bg-primary-300 hover:text-white'
          }`}
        >
          {t('homepage.getStarted')}
        </Link>
      </div>
    </header>
  )
}
