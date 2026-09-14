import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import DataTable from '../../components/ui/DataTable'
import MobileCardList from '../../components/ui/MobileCardList'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { getUser } from '../../lib/auth'

const MOBILE_ROLES = ['orang_tua', 'staff']

export default function AnnouncementHistory() {
  const { t } = useTranslation()
  const user = getUser()
  const isMobileRole = MOBILE_ROLES.includes(user?.role)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['announcements', 'history', page],
    queryFn: () => apiGet('/api/announcements/history', { page }),
  })

  const rows = data?.data ?? []

  const renderExpiry = (row) =>
    row.expires_at ? (
      <StatusBadge code={row.is_expired ? 'expired' : 'active'} label={row.is_expired ? t('status.expired') : t('announcements.validUntil', { date: formatDate(row.expires_at) })} />
    ) : (
      <span className="text-xs text-text-secondary">{t('announcements.noExpiry')}</span>
    )

  return (
    <ResponsiveShell pageTitle={t('announcements.historyTitle')} headerVariant="title" showSearch={false}>
      {isMobileRole ? (
        <MobileCardList
          loading={isLoading}
          rows={rows}
          pagination={{
            currentPage: data?.current_page ?? 1,
            lastPage: data?.last_page ?? 1,
            total: data?.total,
            onPageChange: setPage,
          }}
          emptyMessage={t('announcements.noAnnouncements')}
          renderRow={(row) => (
            <div className={row.is_expired ? 'opacity-60' : ''}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
                  <Megaphone size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{row.title}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{row.body}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-text-secondary">{formatDate(row.created_at)}</span>
                    {renderExpiry(row)}
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      ) : (
        <DataTable
          loading={isLoading}
          rows={rows}
          pagination={{
            currentPage: data?.current_page ?? 1,
            lastPage: data?.last_page ?? 1,
            total: data?.total,
            onPageChange: setPage,
          }}
          emptyMessage={t('announcements.noAnnouncements')}
          columns={[
            { key: 'title', label: t('announcements.announcementTitle') },
            { key: 'body', label: t('announcements.body'), render: (row) => <span className="line-clamp-2">{row.body}</span> },
            { key: 'created_at', label: t('announcements.createdAt'), render: (row) => formatDate(row.created_at) },
            { key: 'expires_at', label: t('announcements.expiresAt'), render: (row) => renderExpiry(row) },
          ]}
        />
      )}
    </ResponsiveShell>
  )
}
