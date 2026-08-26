import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPatch } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/format'

export default function AdminInvoices() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [marking, setMarking] = useState(null)
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invoices', status, page],
    queryFn: () => apiGet('/api/admin/finance/invoices', { status: status || undefined, page }),
  })

  const markPaidMutation = useMutation({
    mutationFn: () => apiPatch(`/api/admin/finance/invoices/${marking.id}/mark-paid`, { note }),
    onSuccess: () => {
      setMarking(null)
      setNote('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('finance.invoicesTitle')}>
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
        rows={data?.data ?? []}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        columns={[
          { key: 'invoice_number', label: t('finance.invoiceNumber') },
          { key: 'student', label: t('pickup.student'), render: (row) => row.student?.name },
          { key: 'period', label: t('finance.period') },
          { key: 'amount', label: t('finance.amount'), render: (row) => formatCurrency(row.amount) },
          { key: 'due_date', label: t('finance.dueDate'), render: (row) => formatDate(row.due_date) },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) =>
              row.status === 'belum_bayar' ? (
                <button
                  type="button"
                  onClick={() => setMarking(row)}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
                >
                  {t('finance.markPaid')}
                </button>
              ) : (
                '-'
              ),
          },
        ]}
      />

      <Modal
        open={!!marking}
        onClose={() => setMarking(null)}
        title={t('finance.markPaidTitle')}
        description={marking?.invoice_number}
        footer={
          <button
            type="button"
            disabled={!note || markPaidMutation.isPending}
            onClick={() => markPaidMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-50"
          >
            {markPaidMutation.isPending ? t('common.processing') : t('common.confirm')}
          </button>
        }
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('finance.markPaidNote')} <span className="text-danger-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('finance.markPaidNotePlaceholder')}
            rows={3}
            className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:outline-none"
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}
