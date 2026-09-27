import { Link } from 'react-router-dom'
import { Handshake } from 'lucide-react'

/**
 * Kartu highlight biru — frame Figma "Alert Agenda / Konsultasi Wali Santri"
 * (192x302, r24, bg #2082F5, padding 20).
 *
 * Struktur persis Figma: pill putih 56x28 r999 berisi ikon, judul Inter 700
 * 14/17 putih (2 baris), deskripsi Inter 400 9.5/11 putih, CTA pill r999
 * #0F1220. Emoji 🤝 diganti ikon lucide sesuai konvensi ikon project.
 *
 * Isinya tetap kosong: modul "Evaluasi & Konsultasi Wali Santri" (jumlah
 * undangan, kehadiran) tidak punya endpoint backend, jadi kartunya dirender
 * dengan judul + keterangan kosong dan CTA-nya disembunyikan — tidak ada
 * halaman tujuan yang bisa dibuka.
 *
 * Warna biru #2082F5 dipakai apa adanya sesuai permintaan; putih di atasnya
 * terukur 3.77:1 (di bawah ambang AA 4.5:1 untuk teks 9.5-14px).
 */
export default function AgendaHighlightCard({ title, emptyMessage, ctaLabel, ctaTo }) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-[#2082f5] p-5">
      <span className="flex h-7 w-14 items-center justify-center rounded-full bg-white text-[#2082f5]">
        <Handshake size={18} />
      </span>

      <h3 className="mt-5 font-body text-[14px] font-bold leading-[17px] text-white">{title}</h3>
      <p className="mt-2 font-body text-[9.5px] leading-[11px] text-white">{emptyMessage}</p>

      {ctaTo && ctaLabel && (
        <Link
          to={ctaTo}
          className="mt-auto flex h-[29px] w-fit items-center rounded-full bg-[#0f1220] px-[14px] font-body text-[10.5px] font-bold leading-[13px] text-white no-underline transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
