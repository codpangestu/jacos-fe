import { Link } from 'react-router-dom'

/**
 * Kartu aksi di blok kanan hero.
 * Ilustrasi besar langsung di atas card (tanpa kotak background),
 * judul + subtitle di bawahnya rata kiri.
 */
export default function ActionTileCard({
  icon: Icon,
  image,
  imageAlt,
  title,
  meta,
  to,
  tone = 'blue',
  unavailable = false,
}) {
  const base =
    'flex flex-col rounded-3xl bg-white border border-[#e8eaf0] p-4 shadow-sm'

  const body = (
    <>
      {/* Ilustrasi — tanpa background, gambar langsung di card */}
      <div className="mb-3 flex h-[110px] items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? title}
            className="h-full w-full object-contain"
            draggable="false"
          />
        ) : (
          Icon && (
            <span className="text-[#2082f5]">
              <Icon size={48} strokeWidth={1.3} />
            </span>
          )
        )}
      </div>

      {/* Teks */}
      <p className="text-[13px] font-bold leading-tight text-[#171438] dark:text-text-primary">
        {title}
      </p>
      {meta && (
        <p className="mt-0.5 text-[11px] leading-tight text-[#94a1b2]">{meta}</p>
      )}
    </>
  )

  if (unavailable) {
    return (
      <div className={`${base} border-dashed opacity-70`}>{body}</div>
    )
  }

  return (
    <Link
      to={to}
      className={`${base} no-underline transition-all hover:-translate-y-0.5 hover:shadow-md`}
    >
      {body}
    </Link>
  )
}
