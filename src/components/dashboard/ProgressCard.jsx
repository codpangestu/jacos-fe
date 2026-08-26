export default function ProgressCard({ title, items }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <h3 className="font-heading text-sm font-bold text-text-primary">{title}</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-[13px] text-text-secondary">{item.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-[13px] font-semibold text-text-primary">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
