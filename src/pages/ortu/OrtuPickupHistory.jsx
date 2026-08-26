import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

export default function OrtuPickupHistory() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'pickup-logs', activeChild?.id, page],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickup-logs`, { page }),
    enabled: !!activeChild,
  })

  if (!activeChild) return null

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.pickupHistoryTitle')} showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

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
          { key: 'pickup', label: t('pickup.pickupPerson'), render: (row) => row.authorized_pickup?.name },
          { key: 'relationship', label: t('ortu.pickupRelationship'), render: (row) => row.authorized_pickup?.relationship },
          { key: 'method', label: t('pickup.method'), render: (row) => <StatusBadge code={row.method} /> },
          { key: 'verified_by', label: t('pickup.verifiedBy'), render: (row) => row.verified_by?.name },
          { key: 'time', label: t('pickup.time'), render: (row) => formatDateTime(row.checked_out_at) },
          { key: 'note', label: t('common.note'), render: (row) => row.note || '-' },
        ]}
      />
    </DashboardLayout>
  )
}
