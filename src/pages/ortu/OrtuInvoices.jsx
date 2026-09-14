import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Info, Receipt, Repeat } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import InvoiceCard from '../../components/ortu/InvoiceCard'
import Modal from '../../components/ui/Modal'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { formatCurrency, formatDateLong, formatDateTime } from '../../lib/format'

const UNPAID_STATUSES = ['belum_bayar', 'terlambat']
const FILTERS = ['', 'belum_bayar', 'lunas', 'terlambat']

const CHIP_BASE = {
  '': 'border border-[#E0E8EF] bg-white text-[#516375] font-medium',
  belum_bayar: 'border border-[#FDE68A] bg-[#FFFBEB] text-[#B45309] font-bold',
  lunas: 'border border-[#E0E8EF] bg-white text-[#516375] font-medium',
  terlambat: 'border border-[#E0E8EF] bg-white text-[#516375] font-medium',
}
const CHIP_ACTIVE = 'border border-transparent bg-[#0252A3] text-white font-bold'

export default function OrtuInvoices() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeChild, children } = useOrtuChildren()
  const [status, setStatus] = useState('')
  const [viewingId, setViewingId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'invoices', activeChild?.id, status],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/invoices`, { status: status || undefined }),
    enabled: !!activeChild,
  })

  const { data: allData } = useQuery({
    queryKey: ['ortu', 'invoices', activeChild?.id, 'all'],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/invoices`),
    enabled: !!activeChild,
  })
  const allInvoices = allData?.invoices ?? []
  const unpaid = allInvoices.filter((i) => UNPAID_STATUSES.includes(i.status))
  const outstanding = unpaid.reduce((sum, i) => sum + Number(i.amount), 0)
  const paidThisYear = allInvoices.filter((i) => i.status === 'lunas' && i.period?.startsWith(String(new Date().getFullYear())))
  const totalPaidThisYear = paidThisYear.reduce((sum, i) => sum + Number(i.amount), 0)
  const nearestDue = unpaid
    .slice()
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]

  const counts = {
    belum_bayar: allInvoices.filter((i) => i.status === 'belum_bayar').length,
    lunas: allInvoices.filter((i) => i.status === 'lunas').length,
    terlambat: allInvoices.filter((i) => i.status === 'terlambat').length,
  }

  const { data: receipt } = useQuery({
    queryKey: ['ortu', 'invoice', viewingId],
    queryFn: () => apiGet(`/api/ortu/invoices/${viewingId}/receipt`),
    enabled: !!viewingId,
  })

  if (!activeChild) return null

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div
        className="flex min-h-screen w-full flex-col gap-4 overflow-x-hidden bg-gradient-to-br from-[#CAE6F6] via-[#F6E3F2] to-[#DDF0F4] px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
      >
        {/* Top Bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-heading text-[18px] font-bold leading-[22px] text-[#1A2A3A]">
              {t('ortu.financeTopTitle')}
            </h1>
            <Link
              to="/ortu/payments/history"
              className="flex shrink-0 items-center gap-1 rounded-full border border-[#D3DFEB] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[#1F5284] no-underline"
            >
              <Receipt size={13} />
              {t('ortu.receiptHistoryBtn')}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <p className="truncate text-[11px] text-[#627283]">
              {t('ortu.financeSubtitle', { name: activeChild.name })}
            </p>
            {children.length > 1 && (
              <Link
                to="/ortu/select-child"
                className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#1F5284] no-underline"
              >
                <Repeat size={11} />
                {t('ortu.switchChild')}
              </Link>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-stretch gap-2.5">
          <div className="flex flex-1 flex-col gap-1.5 rounded-[20px] border-[1.5px] border-[#FDE68A] bg-[#FFFBEB] p-3.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#D97706]" />
              <p className="truncate text-[11px] font-bold text-[#92400E]">{t('ortu.outstandingBalance')}</p>
            </div>
            <p className="text-lg font-bold leading-[22px] text-[#B45309]">{formatCurrency(outstanding)}</p>
            <p className="text-[10px] text-[#78350F]">{t('ortu.unpaidCountHint', { count: unpaid.length })}</p>
          </div>

          <div
            className="flex flex-1 flex-col gap-1.5 rounded-[20px] border border-[#E0E8EF] bg-white p-3.5"
            style={{ boxShadow: '0px 4px 14px rgba(70, 163, 2, 0.06)' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#165DA3]" />
              <p className="truncate text-[11px] font-bold text-[#163D65]">{t('ortu.invoicesPaidThisYear')}</p>
            </div>
            <p className="text-lg font-bold leading-[22px] text-[#1A2A3A]">{formatCurrency(totalPaidThisYear)}</p>
            <p className="text-[10px] text-[#627283]">{t('ortu.paidCountHint', { count: paidThisYear.length })}</p>
          </div>
        </div>

        {/* Alert Banner */}
        {unpaid.length > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-[18px] border-[1.5px] border-[#FFEDD5] bg-[#FFF7ED] p-3">
            <div className="flex min-w-0 items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-[#EA580C]" />
              <p className="text-[11px] leading-[13px] text-[#9A3412]">
                {nearestDue
                  ? t('ortu.paymentDeadlineAlert', { date: formatDateLong(nearestDue.due_date, { withYear: false }) })
                  : t('ortu.unpaidBannerTitle', { count: unpaid.length })}
              </p>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFEDD5]">
              <Info size={14} className="text-[#EA580C]" />
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-2xl bg-white p-4 text-sm text-[#1A2A3A]">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#165DA3]" />
            {t('ortu.allPaidTitle')}
          </div>
        )}

        {/* Filter Status Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {FILTERS.map((key) => (
            <button
              key={key || 'all'}
              type="button"
              onClick={() => setStatus(key)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] transition-colors ${
                status === key ? CHIP_ACTIVE : CHIP_BASE[key]
              }`}
            >
              {key ? `${t(`status.${key}`)} (${counts[key]})` : t('common.all')}
            </button>
          ))}
        </div>

        {/* Invoice List Section */}
        <div className="flex flex-col gap-3 pb-4">
          <p className="text-sm font-bold text-[#1A2A3A]">{t('ortu.invoicesTitle')}</p>

          {isLoading ? (
            <p className="py-10 text-center text-sm text-[#627283]">{t('common.loading')}</p>
          ) : (data?.invoices ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-[#627283]">{t('common.noData')}</p>
          ) : (
            (data?.invoices ?? []).map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onPay={(id) => navigate(`/ortu/invoices/${id}`)}
                onViewReceipt={(id) => setViewingId(id)}
              />
            ))
          )}
        </div>
      </div>

      <Modal open={!!viewingId} onClose={() => setViewingId(null)} title={t('ortu.receiptTitle')}>
        {receipt && (
          <div className="space-y-3">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('ortu.receiptNumber')}</dt>
                <dd className="font-medium text-text-primary">{receipt.invoice_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('ortu.receiptStudent')}</dt>
                <dd className="font-medium text-text-primary">{receipt.student_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('ortu.receiptPeriod')}</dt>
                <dd className="font-medium text-text-primary">{receipt.period}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('ortu.receiptAmount')}</dt>
                <dd className="font-heading font-bold text-primary-300">{formatCurrency(receipt.amount)}</dd>
              </div>
              {receipt.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-text-secondary">{t('ortu.receiptPaidAt')}</dt>
                  <dd className="font-medium text-text-primary">{formatDateTime(receipt.paid_at)}</dd>
                </div>
              )}
              {receipt.method && (
                <div className="flex justify-between">
                  <dt className="text-text-secondary">{t('ortu.receiptMethod')}</dt>
                  <dd className="font-medium text-text-primary uppercase">{receipt.method.replace(/_/g, ' ')}</dd>
                </div>
              )}
            </dl>
            <p className="rounded-lg bg-bg-page px-3 py-2 text-xs text-text-secondary">{t('ortu.receiptNote')}</p>
          </div>
        )}
      </Modal>
    </ResponsiveShell>
  )
}
