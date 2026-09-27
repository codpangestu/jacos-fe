import { Link } from 'react-router-dom'

/**
 * 3 card shortcut bergambar di area kanan atas dashboard.
 * Setiap card punya ilustrasi, judul, dan subtitle dinamis (badge count, dll.)
 *
 * `cards` = array of { label, subtitle, to, image, imageAlt? }
 */
export default function ActionCards({ cards }) {
  if (!cards?.length) return null

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ label, subtitle, to, image, imageAlt }) => (
        <Link
          key={to}
          to={to}
          className="group flex flex-col items-start rounded-2xl border border-border bg-bg-surface p-4 no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Ilustrasi */}
          <div className="mb-3 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-[#EEF4FF]">
            <img
              src={image}
              alt={imageAlt ?? label}
              className="h-20 w-20 object-contain transition-transform duration-200 group-hover:scale-105"
              draggable="false"
            />
          </div>

          {/* Teks */}
          <p className="text-[13.5px] font-bold leading-tight text-text-primary">{label}</p>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-text-secondary">{subtitle}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
