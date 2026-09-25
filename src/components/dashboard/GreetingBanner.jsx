/**
 * Banner greeting di atas dashboard — menyapa admin dengan nama + konteks hari ini.
 * `academicYear` opsional, ditampilkan kalau ada.
 */
export default function GreetingBanner({ name, dateLabel, academicYear }) {
  const hour = new Date().getHours()
  const greeting =
    hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'

  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-lg font-bold text-text-primary">
          {greeting}, {name} 👋
        </p>
        <p className="mt-0.5 text-sm text-text-secondary">{dateLabel}</p>
      </div>
      {academicYear && (
        <span className="mt-2 self-start rounded-full bg-primary-300/12 px-3 py-1 text-xs font-semibold text-primary-fg sm:mt-0 sm:self-auto">
          {academicYear}
        </span>
      )}
    </div>
  )
}
