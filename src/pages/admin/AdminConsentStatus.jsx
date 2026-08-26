import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import { apiGet } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

export default function AdminConsentStatus() {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'consents'],
    queryFn: () => apiGet('/api/admin/consents'),
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('consentStatus.title')} showSearch={false}>
      <DataTable
        loading={isLoading}
        rows={data?.consents ?? []}
        columns={[
          { key: 'student', label: t('consentStatus.student'), render: (row) => row.student?.name },
          { key: 'parent', label: t('consentStatus.parent'), render: (row) => row.parent?.name },
          { key: 'consented_at', label: t('consentStatus.consentedAt'), render: (row) => formatDateTime(row.consented_at) },
          {
            key: 'status',
            label: t('common.status'),
            render: (row) =>
              row.withdrawn_at ? (
                <span className="rounded-full bg-danger-500/12 px-2.5 py-1 text-xs font-semibold text-danger-500">
                  {t('consentStatus.statusWithdrawn')}
                </span>
              ) : (
                <span className="rounded-full bg-success-500/12 px-2.5 py-1 text-xs font-semibold text-success-500">
                  {t('consentStatus.statusActive')}
                </span>
              ),
          },
        ]}
      />
    </DashboardLayout>
  )
}
