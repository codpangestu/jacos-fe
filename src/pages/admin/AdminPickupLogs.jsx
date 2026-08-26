import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet } from '../../lib/api'
import { formatDateTime, todayInputValue } from '../../lib/format'

export default function AdminPickupLogs() {
  const { t } = useTranslation()
  const [date, setDate] = useState(todayInputValue())
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pickup-logs', date, page],
    queryFn: () => apiGet('/api/admin/pickup-logs', { date, page }),
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('pickup.logsTitle')}>
      <FilterBar
        filters={[{ key: 'date', type: 'date', label: t('common.date'), value: date, onChange: setDate }]}
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
          { key: 'student', label: t('pickup.student'), render: (row) => row.student?.name },
          { key: 'pickup', label: t('pickup.pickupPerson'), render: (row) => row.authorized_pickup?.name },
          { key: 'method', label: t('pickup.method'), render: (row) => <StatusBadge code={row.method} /> },
          { key: 'verified_by', label: t('pickup.verifiedBy'), render: (row) => row.verified_by?.name },
          { key: 'time', label: t('pickup.time'), render: (row) => formatDateTime(row.checked_out_at) },
          { key: 'note', label: t('common.note'), render: (row) => row.note || '-' },
        ]}
      />
    </DashboardLayout>
  )
}
