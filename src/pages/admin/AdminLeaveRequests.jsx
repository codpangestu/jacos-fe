import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Check, MessageSquareWarning, X } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPatch } from '../../lib/api'
import { formatDate } from '../../lib/format'

export default function AdminLeaveRequests() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [noteAction, setNoteAction] = useState(null) // { row, status: 'rejected' | 'revision_requested' }
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'leave-requests', status, page],
    queryFn: () => apiGet('/api/staff/leave-requests', { status: status || undefined, page }),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, reviewStatus, review_note }) =>
      apiPatch(`/api/admin/leave-requests/${id}/review`, { status: reviewStatus, review_note }),
    onSuccess: () => {
      setNoteAction(null)
      setNote('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'leave-requests'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('leave.adminTitle')}>
      <FilterBar
        filters={[
          {
            key: 'status',
            type: 'select',
            label: t('common.status'),
            value: status,
            onChange: setStatus,
            options: [
              { value: 'pending', label: t('status.pending') },
              { value: 'approved', label: t('status.approved') },
              { value: 'rejected', label: t('status.rejected') },
              { value: 'revision_requested', label: t('status.revision_requested') },
              { value: '', label: t('common.all') },
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
          { key: 'staff', label: t('leave.staff'), render: (row) => row.staff?.name },
          { key: 'type', label: t('leave.type'), render: (row) => t(`status.${row.type}`, row.type) },
          {
            key: 'period',
            label: `${t('leave.startDate')} - ${t('leave.endDate')}`,
            render: (row) => (
              <span className="flex items-center gap-1.5">
                {formatDate(row.start_date)} - {formatDate(row.end_date)}
                {row.is_long_leave && (
                  <span title={t('leave.longLeaveHint')}>
                    <AlertTriangle size={14} className="text-accent-500" />
                  </span>
                )}
              </span>
            ),
          },
          { key: 'reason', label: t('leave.reason') },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) =>
              row.status === 'pending' ? (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => reviewMutation.mutate({ id: row.id, reviewStatus: 'approved', review_note: null })}
                    className="flex items-center gap-1 rounded-lg bg-success-500/12 px-2.5 py-1.5 text-xs font-semibold text-success-500 hover:bg-success-500/20"
                  >
                    <Check size={13} />
                    {t('leave.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteAction({ row, status: 'revision_requested' })}
                    className="flex items-center gap-1 rounded-lg bg-accent-500/12 px-2.5 py-1.5 text-xs font-semibold text-accent-500 hover:bg-accent-500/20"
                  >
                    <MessageSquareWarning size={13} />
                    {t('leave.requestRevision')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteAction({ row, status: 'rejected' })}
                    className="flex items-center gap-1 rounded-lg bg-danger-500/12 px-2.5 py-1.5 text-xs font-semibold text-danger-500 hover:bg-danger-500/20"
                  >
                    <X size={13} />
                    {t('leave.reject')}
                  </button>
                </div>
              ) : (
                '-'
              ),
          },
        ]}
      />

      <Modal
        open={!!noteAction}
        onClose={() => setNoteAction(null)}
        title={noteAction?.status === 'rejected' ? t('leave.reject') : t('leave.requestRevision')}
        description={noteAction?.row?.staff?.name}
        footer={
          <button
            type="button"
            disabled={!note || reviewMutation.isPending}
            onClick={() => reviewMutation.mutate({ id: noteAction.row.id, reviewStatus: noteAction.status, review_note: note })}
            className={`rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              noteAction?.status === 'rejected' ? 'bg-danger-500 hover:bg-danger-500/90' : 'bg-accent-500 hover:bg-accent-500/90'
            }`}
          >
            {reviewMutation.isPending
              ? t('common.processing')
              : noteAction?.status === 'rejected'
                ? t('leave.reject')
                : t('leave.requestRevision')}
          </button>
        }
      >
        <FormFieldNote value={note} onChange={setNote} label={t('leave.reviewNote')} hint={t('leave.rejectNoteRequired')} />
      </Modal>
    </DashboardLayout>
  )
}

function FormFieldNote({ value, onChange, label, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        {label} <span className="text-danger-500">*</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
      />
      <p className="mt-1 text-xs text-text-secondary">{hint}</p>
    </div>
  )
}
