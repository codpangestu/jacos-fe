import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Paperclip, X } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPatch, storageUrl } from '../../lib/api'
import { formatDate } from '../../lib/format'

export default function GuruStudentLeaveRequests() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [rejecting, setRejecting] = useState(null)
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['guru', 'student-leave-requests', status, page],
    queryFn: () => apiGet('/api/guru/student-leave-requests', { status: status || undefined, page }),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, reviewStatus, review_note }) =>
      apiPatch(`/api/guru/student-leave-requests/${id}/review`, { status: reviewStatus, review_note }),
    onSuccess: () => {
      setRejecting(null)
      setNote('')
      queryClient.invalidateQueries({ queryKey: ['guru', 'student-leave-requests'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.guru} pageTitle={t('studentLeave.teacherTitle')}>
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
              { value: '', label: t('common.all') },
            ],
          },
        ]}
      />

      <DataTable
        loading={isLoading}
        rows={data?.data ?? []}
        emptyMessage={t('studentLeave.teacherEmpty')}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        columns={[
          { key: 'student', label: t('studentLeave.childLabel'), render: (row) => row.student?.name },
          { key: 'type', label: t('studentLeave.typeLabel'), render: (row) => t(`status.${row.type}`) },
          {
            key: 'period',
            label: `${t('leave.startDate')} - ${t('leave.endDate')}`,
            render: (row) => `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`,
          },
          { key: 'reason', label: t('leave.reason') },
          {
            key: 'attachment',
            label: t('leave.attachment'),
            render: (row) =>
              row.attachment_path ? (
                <a
                  href={storageUrl(row.attachment_path)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary-300 hover:underline"
                >
                  <Paperclip size={13} />
                  {t('common.view')}
                </a>
              ) : '-',
          },
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
                    onClick={() => setRejecting(row)}
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
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={t('leave.reject')}
        description={rejecting?.student?.name}
        footer={
          <button
            type="button"
            disabled={!note || reviewMutation.isPending}
            onClick={() => reviewMutation.mutate({ id: rejecting.id, reviewStatus: 'rejected', review_note: note })}
            className="rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:opacity-50"
          >
            {reviewMutation.isPending ? t('common.processing') : t('leave.reject')}
          </button>
        }
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">
            {t('studentLeave.reviewNote')} <span className="text-danger-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-secondary">{t('leave.rejectNoteRequired')}</p>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
