import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Receipt, Wallet } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import StatCard from '../../components/dashboard/StatCard'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/format'

const UNPAID_STATUSES = ['belum_bayar', 'terlambat']

export default function OrtuInvoices() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeChild, children } = useOrtuChildren()
  const [status, setStatus] = useState('')

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
  const paidThisYear = allInvoices.filter((i) => i.status === 'lunas' && i.period?.startsWith(String(new Date().getFullYear()))).length

  if (!activeChild) return null

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.invoicesTitle')} showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Wallet} label={t('ortu.outstandingBalance')} value={formatCurrency(outstanding)} tone={outstanding ? 'danger' : 'success'} />
        <StatCard icon={Receipt} label={t('ortu.invoicesPaidThisYear')} value={paidThisYear} tone="primary" />
      </div>

      {unpaid.length === 0 ? (
        <div className="flex items-start gap-2.5 rounded-2xl bg-success-500/10 p-4 text-sm text-text-primary">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success-500" />
          {t('ortu.allPaidTitle')}
        </div>
      ) : (
        <div className="flex items-start gap-2.5 rounded-2xl bg-danger-500/10 p-4 text-sm text-text-primary">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger-500" />
          {t('ortu.unpaidBannerTitle', { count: unpaid.length })}
        </div>
      )}

      <FilterBar
        filters={[
          {
            key: 'status',
            type: 'select',
            label: t('common.status'),
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: t('common.all') },
              { value: 'belum_bayar', label: t('status.belum_bayar') },
              { value: 'lunas', label: t('status.lunas') },
              { value: 'terlambat', label: t('status.terlambat') },
              { value: 'dibatalkan', label: t('status.dibatalkan') },
            ],
          },
        ]}
      />

      <DataTable
        loading={isLoading}
        rows={data?.invoices ?? []}
        rowKey={(row) => row.id}
        columns={[
          { key: 'invoice_number', label: t('finance.invoiceNumber') },
          { key: 'period', label: t('finance.period') },
          { key: 'amount', label: t('finance.amount'), render: (row) => formatCurrency(row.amount) },
          { key: 'due_date', label: t('finance.dueDate'), render: (row) => formatDate(row.due_date) },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => navigate(`/ortu/invoices/${row.id}`)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('common.view')}
              </button>
            ),
          },
        ]}
      />
    </DashboardLayout>
  )
}
