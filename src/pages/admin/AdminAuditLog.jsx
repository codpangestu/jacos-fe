import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import { apiGet } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

export default function AdminAuditLog() {
  const { t } = useTranslation()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-log', from, to, page],
    queryFn: () => apiGet('/api/admin/audit-log', { from: from || undefined, to: to || undefined, page }),
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('auditLog.title')}>
      <FilterBar
        filters={[
          { key: 'from', type: 'date', label: t('common.date') + ' (dari)', value: from, onChange: setFrom },
          { key: 'to', type: 'date', label: t('common.date') + ' (s/d)', value: to, onChange: setTo },
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
          { key: 'user', label: t('auditLog.user'), render: (row) => row.user?.name ?? '-' },
          { key: 'action', label: t('auditLog.action') },
          { key: 'entity_type', label: t('auditLog.entity'), render: (row) => row.entity_type?.split('\\').pop() },
          { key: 'created_at', label: t('auditLog.time'), render: (row) => formatDateTime(row.created_at) },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => setViewing(row)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                <Eye size={13} />
                {t('auditLog.viewDetails')}
              </button>
            ),
          },
        ]}
      />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={t('auditLog.details')} size="lg">
        {viewing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-text-secondary">Before</p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-bg-page p-3 text-xs text-text-primary">
                {JSON.stringify(viewing.before, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-text-secondary">After</p>
              <pre className="max-h-64 overflow-auto rounded-lg bg-bg-page p-3 text-xs text-text-primary">
                {JSON.stringify(viewing.after, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
