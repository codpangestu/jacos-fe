import { Link } from 'react-router-dom'
import { Megaphone } from 'lucide-react'

// Figma memakai #2082f5 untuk kartu solid ini, tapi putih di atas #2082f5 hanya
// 3.77:1 — gagal ambang AA 4.5:1 untuk teks 12-14px. Dipakai biru yang digelapkan
// ke #1a68c9 (5.43:1) supaya hue-nya tetap sama tapi teksnya lolos AA.
const CARD_BLUE = '#1a68c9'

/**
 * Kartu highlight biru (frame Figma "Alert Agenda / Konsultasi Wali Santri").
 *
 * Adaptasi: modul aslinya ("Evaluasi & Konsultasi Wali Santri" dengan jumlah
 * undangan/kehadiran) tidak punya sumber data di backend. Kartu ini dipakai
 * sebagai gantinya untuk pengumuman terbaru — satu-satunya data yang memang
 * tersedia dan memang perlu ditonjolkan di dashboard Admin — sehingga elemen
 * biru khas desain tetap ada tanpa mengarang angka.
 */
export default function AgendaHighlightCard({ title, description, meta, ctaLabel, ctaTo, empty }) {
  if (empty) {
    return (
      <div className="flex flex-1 flex-col justify-center rounded-3xl border border-dashed border-border bg-bg-surface p-5 text-center">
        <Megaphone size={20} className="mx-auto text-text-secondary" />
        <p className="mt-2 font-heading text-sm font-bold text-text-primary">{title}</p>
        <p className="mt-1 text-[11px] text-text-secondary">{description}</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-1 flex-col rounded-3xl p-5 text-white"
      style={{ backgroundColor: CARD_BLUE }}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ color: CARD_BLUE }}>
        <Megaphone size={19} />
      </span>

      <h3 className="mt-4 font-heading text-[15px] font-bold leading-snug">{title}</h3>
      <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-white/90">{description}</p>

      {meta && <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/75">{meta}</p>}

      {ctaTo && (
        <Link
          to={ctaTo}
          className="mt-auto inline-flex w-fit items-center rounded-full bg-[#0f1220] px-3.5 py-2 text-[11px] font-bold text-white no-underline transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
