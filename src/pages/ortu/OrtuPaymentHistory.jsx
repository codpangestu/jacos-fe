import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Receipt, Wallet } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import StatCard from '../../components/dashboard/StatCard'
import DataTable from '../../components/ui/DataTable'
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
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.paymentHistoryTitle')} showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={CheckCircle2} label={t('ortu.invoicesPaidThisYear')} value={paidInvoices.length} tone="success" />
        <StatCard icon={Wallet} label={t('ortu.totalPaidThisYear')} value={formatCurrency(totalPaid)} tone="primary" />
      </div>

      <DataTable
        loading={isLoading}
        rows={allPaidInvoices}
        rowKey={(row) => row.id}
        columns={[
          { key: 'invoice_number', label: t('finance.invoiceNumber') },
          { key: 'period', label: t('finance.period') },
          { key: 'amount', label: t('finance.amount'), render: (row) => formatCurrency(row.amount) },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => setViewingId(row.id)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                <Receipt size={13} />
                {t('ortu.downloadReceipt')}
              </button>
            ),
          },
        ]}
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
    </DashboardLayout>
  )
}
