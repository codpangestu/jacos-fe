import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, UserRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet, apiPost, storageUrl } from '../../lib/api'
import { formatDate } from '../../lib/format'

export default function AdminPickupApprovals() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'authorized-pickups', 'pending'],
    queryFn: () => apiGet('/api/admin/authorized-pickups/pending'),
  })
  const pending = data?.pickups ?? []

  const approveMutation = useMutation({
    mutationFn: (id) => apiPost(`/api/admin/authorized-pickups/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'authorized-pickups'] }),
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('pickup.approvalsTitle')} showSearch={false}>
      <p className="rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-text-secondary">{t('pickup.approveHint')}</p>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
      ) : pending.length === 0 ? (
        <p className="rounded-2xl border border-border bg-bg-surface p-10 text-center text-sm text-text-secondary">
          {t('pickup.approvalsEmpty')}
        </p>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-bg-surface">
          {pending.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              {p.photo_path ? (
                <img src={storageUrl(p.photo_path)} alt={p.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
                  <UserRound size={22} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                <p className="text-xs text-text-secondary">
                  {p.relationship} — {t('pickup.student')}: {p.student?.name}
                </p>
                <p className="text-xs text-text-secondary">{formatDate(p.created_at)}</p>
              </div>
              <button
                type="button"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(p.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:bg-success-500/90 disabled:opacity-60"
              >
                <ShieldCheck size={15} />
                {t('pickup.approve')}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
