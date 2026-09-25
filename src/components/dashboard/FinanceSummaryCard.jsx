import { TrendingDown, TrendingUp } from 'lucide-react'

/**
 * Mini ringkasan keuangan bulan ini.
 * Props: { totalBilled, totalPaid, totalOutstanding, overdueCount, periodLabel }
 */
export default function FinanceSummaryCard({
  totalBilled = 0,
  totalPaid = 0,
  totalOutstanding = 0,
  overdueCount = 0,
  periodLabel = '',
}) {
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

  function fmt(n) {
    const num = Number(n ?? 0)
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}jt`
    if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`
    return `Rp ${num.toLocaleString('id-ID')}`
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <div className="flex items-start justify-between">
        <h3 className="font-heading text-sm font-bold text-text-primary">Keuangan Bulan Ini</h3>
        {periodLabel && (
          <span className="rounded-full bg-bg-page px-2 py-0.5 text-[11px] text-text-secondary">
            {periodLabel}
          </span>
        )}
      </div>

      {/* Collection rate bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-text-secondary">Tingkat Pembayaran</span>
          <span className="font-bold text-text-primary">{collectionRate}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-success-500 transition-all"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      {/* 3 figures */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary">Tagihan</p>
          <p className="mt-1 text-[13px] font-bold text-text-primary">{fmt(totalBilled)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary flex items-center justify-center gap-1">
            <TrendingUp size={11} className="text-success-500" /> Terbayar
          </p>
          <p className="mt-1 text-[13px] font-bold text-success-500">{fmt(totalPaid)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-text-secondary flex items-center justify-center gap-1">
            <TrendingDown size={11} className="text-danger-500" /> Sisa
          </p>
          <p className="mt-1 text-[13px] font-bold text-danger-500">{fmt(totalOutstanding)}</p>
        </div>
      </div>

      {overdueCount > 0 && (
        <p className="mt-3 rounded-lg bg-danger-500/8 px-3 py-2 text-xs text-danger-fg">
          ⚠ {overdueCount} tagihan melewati jatuh tempo
        </p>
      )}
    </div>
  )
}
