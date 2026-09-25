import { Link } from 'react-router-dom'

// Kartu aksi di sisi kanan hero (frame Figma "Hero & Feature Cards Row").
// Figma memakai ilustrasi bitmap 111x97; di sini diganti ikon lucide di dalam
// chip berwarna supaya konsisten dengan konvensi ikon project (lucide-react
// saja, tanpa emoji/ilustrasi raster baru).
// Varian `dark:` di sini perlu karena token *-fg yang ada hanya mencakup 5 tone
// brand (primary/accent/success/danger/neutral), sedangkan biru & indigo Figma
// belum jadi token. Terukur: indigo di atas tint-nya sendiri hanya 2.66:1 di
// dark (gagal ambang 3:1 elemen non-teks), biru 3.21:1 (mepet) — jadi keduanya
// dinaikkan ke shade yang lebih terang. Saat migrasi token, dua nilai ini harus
// diserap jadi token `*-fg` supaya varian dark: bisa dihapus dari sini.
const TONE_STYLES = {
  blue: 'bg-[#2082f5]/10 text-[#2082f5] dark:text-[#35aefc]',
  indigo: 'bg-[#5b61f6]/10 text-[#5b61f6] dark:text-[#9a97f5]',
  amber: 'bg-accent-500/12 text-accent-fg',
  neutral: 'bg-bg-page text-text-secondary',
}

/**
 * @param {boolean} unavailable - modul belum punya endpoint backend. Dirender
 *   sebagai kartu dashed non-link, bukan tombol yang menuntun ke halaman kosong.
 */
export default function ActionTileCard({
  icon: Icon,
  title,
  meta,
  to,
  tone = 'blue',
  unavailable = false,
}) {
  const body = (
    <>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          unavailable ? TONE_STYLES.neutral : TONE_STYLES[tone]
        }`}
      >
        <Icon size={20} />
      </span>
      <div className="mt-auto pt-4">
        <p className="font-heading text-sm font-bold text-text-primary">{title}</p>
        <p className="mt-1 text-xs text-text-secondary">{meta}</p>
      </div>
    </>
  )

  const base = 'flex min-h-[170px] flex-col rounded-3xl p-4'

  if (unavailable || !to) {
    return (
      <div className={`${base} border border-dashed border-border bg-bg-surface/60`}>{body}</div>
    )
  }

  return (
    <Link
      to={to}
      className={`${base} border border-border bg-bg-surface no-underline transition-shadow hover:shadow-md`}
    >
      {body}
    </Link>
  )
}
