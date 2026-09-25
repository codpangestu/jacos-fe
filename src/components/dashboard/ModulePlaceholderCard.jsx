import { Link } from 'react-router-dom'

/**
 * Placeholder untuk modul dashboard yang ada di desain Figma tapi belum punya
 * endpoint backend. Sengaja tidak menampilkan angka contoh — angka dummy di
 * layar operasional lebih berbahaya daripada bagian yang kosong, karena admin
 * bisa mengambil keputusan berdasarkan data yang tidak nyata.
 */
export default function ModulePlaceholderCard({ title, icon: Icon, message, ctaLabel, ctaTo }) {
  return (
    <div className="flex flex-1 flex-col rounded-3xl border border-dashed border-border bg-bg-surface p-5">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon size={17} className="shrink-0 text-text-secondary" />}
        <h3 className="truncate font-heading text-[15px] font-bold text-text-primary">{title}</h3>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
        <p className="max-w-[26ch] text-[11px] leading-relaxed text-text-secondary">{message}</p>
        {ctaTo && ctaLabel && (
          <Link
            to={ctaTo}
            className="text-[11px] font-semibold text-primary-fg no-underline hover:underline"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}
