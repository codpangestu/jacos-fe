export default function HighlightCard({ title, description, ctaLabel, ctaTo, badges = [] }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-300 to-primary-900 p-5 text-white">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-base font-bold">{title}</h3>
        {ctaTo && (
          <a
            href={ctaTo}
            className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary-300"
          >
            {ctaLabel}
          </a>
        )}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-white/85">{description}</p>
      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium"
            >
              {b.icon && <b.icon size={14} />}
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
