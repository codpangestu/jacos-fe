import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

/**
 * Blok hero dashboard Admin (frame Figma "Headline Block"): sapaan + badge role
 * + headline + subjudul, dengan slot `children` di kanan untuk kartu aksi.
 *
 * Catatan adaptasi: Figma menaruh "Top Navigation Bar" horizontal (tab
 * Dashboard/Audit Log/Integrations + search + "Buat Pengumuman") di dalam area
 * konten. Di project ini fungsi itu sudah dipegang topbar DashboardLayout
 * (judul, search, tema, bahasa, notifikasi, avatar), jadi yang dipertahankan
 * hanya CTA "Buat Pengumuman" — dipindah ke sini supaya tidak ada dua bar
 * navigasi bertumpuk.
 */
export default function CommandHero({
  name,
  roleBadge,
  headline,
  subtitle,
  ctaLabel,
  ctaTo,
  children,
}) {
  const { t } = useTranslation()
  const hour = new Date().getHours()
  const greetingKey =
    hour < 11
      ? 'dashboard.greetingMorning'
      : hour < 15
        ? 'dashboard.greetingAfternoon'
        : hour < 19
          ? 'dashboard.greetingEvening'
          : 'dashboard.greetingNight'

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)]">
      <div className="flex flex-col justify-center gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-heading text-[26px] font-bold leading-tight text-text-primary lg:text-[28px]">
            {t(greetingKey)}, {name}!
          </h2>
          {roleBadge && (
            <span className="rounded-full bg-[#5b61f6] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {roleBadge}
            </span>
          )}
        </div>

        <p className="font-heading text-xl font-bold leading-snug text-text-primary lg:text-[25px]">
          {headline}
        </p>
        <p className="max-w-xl text-[13px] leading-relaxed text-text-secondary">{subtitle}</p>

        {ctaTo && (
          <div className="mt-3">
            <Link
              to={ctaTo}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0f1220] px-4 py-2.5 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
            >
              <Plus size={15} />
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
    </section>
  )
}
