import { useTranslation } from 'react-i18next'
import { CheckCircle2, CreditCard, FileText } from 'lucide-react'
import { formatCurrency, formatDate, formatPeriod, daysUntil } from '../../lib/format'

/** Kartu tagihan gaya "Daftar Tagihan" — beda tampilan untuk belum-bayar/terlambat vs lunas. */
export default function InvoiceCard({ invoice, onPay, onViewReceipt }) {
  const { t } = useTranslation()
  const isPaid = invoice.status === 'lunas'

  if (isPaid) {
    return (
      <div
        className="flex w-full flex-col gap-2.5 rounded-[22px] border border-[#E0E8EF] bg-white p-4"
        style={{ boxShadow: '0px 4px 14px rgba(70, 163, 2, 0.04)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-[#82919F]">#{invoice.invoice_number}</p>
            <p className="truncate text-sm font-bold text-[#1A2A3A]">{formatPeriod(invoice.period)}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#ECF5FD] px-2 py-0.5 text-[10px] font-bold text-[#054E96]">
            <CheckCircle2 size={11} strokeWidth={2.5} />
            {t('status.lunas').toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-[11px] text-[#627283]">
            {invoice.payment_method
              ? t('ortu.paidMeta', { date: formatDate(invoice.paid_at ?? invoice.updated_at), method: invoice.payment_method.replace(/_/g, ' ').toUpperCase() })
              : t('ortu.paidMetaNoMethod', { date: formatDate(invoice.paid_at ?? invoice.updated_at) })}
          </p>
          <p className="shrink-0 text-sm font-bold text-[#1A2A3A]">{formatCurrency(invoice.amount)}</p>
        </div>

        <button
          type="button"
          onClick={() => onViewReceipt(invoice.id)}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-[#E6F2FF] bg-[#F0F5FA] text-[11px] font-bold text-[#123E6A]"
        >
          <FileText size={14} />
          {t('ortu.downloadReceiptOfficial')}
        </button>
      </div>
    )
  }

  const days = daysUntil(invoice.due_date)
  const dueLabel =
    days === null
      ? null
      : days > 0
        ? t('ortu.dueInDays', { count: days })
        : days === 0
          ? t('ortu.dueToday')
          : t('ortu.overdueDays', { count: Math.abs(days) })

  return (
    <div
      className="flex w-full flex-col gap-3 rounded-[22px] border-[1.5px] border-[#FED7AA] bg-white p-4"
      style={{ boxShadow: '0px 6px 20px rgba(234, 88, 12, 0.08)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-[#82919F]">#{invoice.invoice_number}</p>
          <p className="truncate text-sm font-bold text-[#1A2A3A]">{formatPeriod(invoice.period)}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-[#FFEDD5] px-2 py-0.5 text-[10px] font-bold text-[#C2410C]">
          {t(`status.${invoice.status}`).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-1 rounded-xl bg-[#FFFBF6] p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] text-[#627283]">• {formatPeriod(invoice.period)}</p>
          <p className="shrink-0 text-[11px] font-medium text-[#1A2A3A]">{formatCurrency(invoice.amount)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[11px] text-[#C2410C]">
          {t('finance.dueDate')}: {formatDate(invoice.due_date)}{dueLabel ? ` (${dueLabel})` : ''}
        </p>
        <p className="shrink-0 text-base font-bold text-[#1A2A3A]">{formatCurrency(invoice.amount)}</p>
      </div>

      <button
        type="button"
        onClick={() => onPay(invoice.id)}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-[14px] bg-[#0252A3] text-xs font-bold text-white"
        style={{ boxShadow: '0px 4px 12px rgba(2, 82, 163, 0.25)' }}
      >
        <CreditCard size={16} />
        {t('ortu.payNowMidtrans')}
      </button>
    </div>
  )
}
