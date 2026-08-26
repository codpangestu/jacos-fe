const TONE_STYLES = {
  primary: 'bg-primary-300/12 text-primary-300 dark:bg-primary-300/18',
  accent: 'bg-accent-500/12 text-accent-500 dark:bg-accent-500/18',
  success: 'bg-success-500/12 text-success-500 dark:bg-success-500/18',
  navy: 'bg-primary-900/8 text-primary-900 dark:bg-white/10 dark:text-white',
  danger: 'bg-danger-500/12 text-danger-500 dark:bg-danger-500/18',
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
                ? 'bg-danger-500/10 text-danger-500'
                : 'bg-success-500/10 text-success-500'
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
