import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { UserRound } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import MobileCardList from '../../components/ui/MobileCardList'
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
    <ResponsiveShell pageTitle={t('ortu.pickupHistoryTitle')} headerVariant="title" showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <MobileCardList
        loading={isLoading}
        rows={data?.data ?? []}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        renderRow={(row) => (
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
              <UserRound size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-text-primary">{row.authorized_pickup?.name}</p>
                <StatusBadge code={row.method} />
              </div>
              <p className="text-xs text-text-secondary">{row.authorized_pickup?.relationship}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {formatDateTime(row.checked_out_at)} · {t('pickup.verifiedBy')}: {row.verified_by?.name ?? '-'}
              </p>
              {row.note && <p className="mt-1 text-xs text-text-secondary">{t('common.note')}: {row.note}</p>}
            </div>
          </div>
        )}
      />
    </ResponsiveShell>
  )
}
