import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Receipt, Wallet } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import StatCard from '../../components/dashboard/StatCard'
import MobileCardList from '../../components/ui/MobileCardList'
import Modal from '../../components/ui/Modal'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function OrtuPaymentHistory() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const [viewingId, setViewingId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'invoices', activeChild?.id, 'lunas'],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/invoices`, { status: 'lunas' }),
    enabled: !!activeChild,
  })
  const allPaidInvoices = data?.invoices ?? []
  const paidInvoices = allPaidInvoices.filter((i) => i.period?.startsWith(String(new Date().getFullYear())))
  const totalPaid = paidInvoices.reduce((sum, i) => sum + Number(i.amount), 0)

  const { data: receipt } = useQuery({
    queryKey: ['ortu', 'invoice', viewingId],
    queryFn: () => apiGet(`/api/ortu/invoices/${viewingId}/receipt`),
    enabled: !!viewingId,
  })

  if (!activeChild) return null

  return (
    <ResponsiveShell pageTitle={t('ortu.paymentHistoryTitle')} headerVariant="title" showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={CheckCircle2} label={t('ortu.invoicesPaidThisYear')} value={paidInvoices.length} tone="success" />
        <StatCard icon={Wallet} label={t('ortu.totalPaidThisYear')} value={formatCurrency(totalPaid)} tone="primary" />
      </div>

      <MobileCardList
        loading={isLoading}
        rows={allPaidInvoices}
        rowKey={(row) => row.id}
        onRowClick={(row) => setViewingId(row.id)}
        renderRow={(row) => (
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-500/12 text-success-500">
              <Receipt size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{row.invoice_number}</p>
              <p className="text-xs text-text-secondary">{row.period} · {formatCurrency(row.amount)}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-primary-300">{t('ortu.downloadReceipt')}</span>
          </div>
        )}
      />

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
