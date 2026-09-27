import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

/**
 * Blok hero — frame Figma "Hero & Feature Cards Row" (1216x204).
 *
 * Ukuran yang disalin persis dari Figma:
 * - Headline Block 521px, VERTICAL gap 6
 *   - baris sapaan: "Hi, {nama}!" Inter 700 28/34 + badge role pill #5B61F6
 *   - headline Inter 700 25/30
 *   - subjudul Inter 400 12/15 #64748b
 * - Blok kanan 661px, HORIZONTAL gap 16 → chip "+" 105x22 + 3 kartu
 *
 * Font di Figma untuk blok ini adalah Inter (bukan Plus Jakarta Sans), jadi
 * dipakai `font-body` supaya plek. Chip "+" di Figma (105x22 #F5F3FB dengan
 * kotak 28x19 #5B61F6) tidak punya perilaku yang jelas di desain, jadi
 * dirender sebagai elemen dekoratif non-interaktif (aria-hidden).
 */
export default function CommandHero({ name, roleBadge, headline, subtitle, children }) {
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
    <section className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
      {/* Headline Block */}
      <div className="flex max-w-[521px] flex-col gap-[6px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body text-[28px] font-bold leading-[34px] text-text-primary">
            {t(greetingKey)}, {name}!
          </span>
          {roleBadge && (
            <span className="rounded-full bg-[#5b61f6] px-[6px] py-[1px] font-body text-[10px] font-bold leading-[12px] text-white">
              {roleBadge}
            </span>
          )}
        </div>
        <p className="font-body text-[25px] font-bold leading-[30px] text-text-primary">{headline}</p>
        <p className="font-body text-[12px] leading-[15px] text-text-secondary">{subtitle}</p>
      </div>

      {/* Feature cards row */}
      <div className="flex items-stretch gap-4">
        <span
          aria-hidden="true"
          className="hidden h-[22px] w-[105px] shrink-0 items-center self-center rounded-3xl bg-[#f5f3fb] pl-[3px] sm:flex"
        >
          <span className="flex h-[19px] w-[28px] items-center justify-center rounded-lg bg-[#5b61f6] text-white">
            <Plus size={13} />
          </span>
        </span>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>
      </div>
    </section>
  )
}
