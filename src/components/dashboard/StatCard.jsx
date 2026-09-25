// Semua tone pakai tint 12% yang sama di kedua tema, dengan warna ikon dari token
// *-fg yang auto-swap di .dark — jadi tidak ada varian dark: per-komponen yang
// bisa terlupa (itu akar bug sebelumnya). Shade 500 gagal di sini karena ikon
// duduk di atas tint chip-nya sendiri: accent 1.96:1, success 2.06:1, primary
// 2.90:1, sedangkan ambang elemen non-teks 3:1. navy tetap punya pasangan
// tintnya sendiri karena tintnya berbeda arah.
const TONE_STYLES = {
  primary: 'bg-primary-300/12 text-primary-fg',
  accent: 'bg-accent-500/12 text-accent-fg',
  success: 'bg-success-500/12 text-success-fg',
  navy: 'bg-primary-900/8 text-primary-900 dark:bg-white/10 dark:text-white',
  danger: 'bg-danger-500/12 text-danger-fg',
}

export default function StatCard({ icon: Icon, label, value, tone = 'primary', delta }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="flex items-start justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE_STYLES[tone]}`}>
          <Icon size={20} />
        </span>
        {delta && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              delta.direction === 'down'
                ? 'bg-danger-500/10 text-danger-fg'
                : 'bg-success-500/10 text-success-fg'
            }`}
          >
            {delta.direction === 'down' ? '▼' : '▲'} {delta.value}
          </span>
        )}
      </div>
      <p className="mt-4 font-heading text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-[13px] text-text-secondary">{label}</p>
    </div>
  )
}
