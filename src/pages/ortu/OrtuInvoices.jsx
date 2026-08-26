import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/format'

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

  if (!activeChild) return null

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.invoicesTitle')} showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

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
