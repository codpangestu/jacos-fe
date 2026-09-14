import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import FormField from '../../components/ui/FormField'
import MobileCardList from '../../components/ui/MobileCardList'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, apiPostForm } from '../../lib/api'
import { formatDate, todayInputValue } from '../../lib/format'

export default function OrtuLeaveRequests() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { activeChild, children } = useOrtuChildren()
  const [page, setPage] = useState(1)

  const emptyForm = () => ({
    student_id: activeChild?.id ?? '',
    type: 'sakit',
    start_date: todayInputValue(),
    end_date: todayInputValue(),
    reason: '',
    attachment: null,
  })
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'leave-requests', page],
    queryFn: () => apiGet('/api/ortu/leave-requests', { page }),
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v)
      })
      return apiPostForm('/api/ortu/leave-requests', body)
    },
    onSuccess: () => {
      setForm(emptyForm())
      queryClient.invalidateQueries({ queryKey: ['ortu', 'leave-requests'] })
    },
  })

  if (!activeChild) return null

  return (
    <ResponsiveShell pageTitle={t('studentLeave.title')} headerVariant="title" showSearch={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitMutation.mutate()
        }}
        className="space-y-4 rounded-2xl border border-border bg-bg-surface p-5"
      >
        {submitMutation.isSuccess && (
          <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
            {t('studentLeave.submitSuccess')}
          </p>
        )}
        {submitMutation.isError && (
          <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
            {submitMutation.error.message}
          </p>
        )}

        {children.length > 1 && (
          <FormField
            as="select"
            label={t('studentLeave.childLabel')}
            htmlFor="student_id"
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </FormField>
        )}

        <FormField
          as="select"
          label={t('studentLeave.typeLabel')}
          htmlFor="type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="sakit">{t('status.sakit')}</option>
          <option value="izin">{t('status.izin')}</option>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={t('leave.startDate')}
            htmlFor="start_date"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <FormField
            label={t('leave.endDate')}
            htmlFor="end_date"
            type="date"
            required
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>

        <FormField
          as="textarea"
          label={t('leave.reason')}
          htmlFor="reason"
          required
          rows={3}
          placeholder={t('leave.reasonPlaceholder')}
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />

        <FormField
          label={t('leave.attachment')}
          htmlFor="attachment"
          type="file"
          onChange={(e) => setForm({ ...form, attachment: e.target.files[0] ?? null })}
        />
        <p className="-mt-2 text-xs text-text-secondary">{t('studentLeave.attachmentHint')}</p>

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
        >
          {submitMutation.isPending ? t('common.processing') : t('studentLeave.submit')}
        </button>
      </form>

      <h2 className="font-heading text-base font-bold text-text-primary">{t('studentLeave.historyTitle')}</h2>
      <MobileCardList
        loading={isLoading}
        rows={data?.data ?? []}
        emptyMessage={t('studentLeave.empty')}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        renderRow={(row) => (
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text-primary">
                {t(`status.${row.type}`)} · {row.student?.name}
              </p>
              <StatusBadge code={row.status} />
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              {formatDate(row.start_date)} — {formatDate(row.end_date)}
            </p>
            {row.review_note && (
              <p className="mt-1 text-xs text-text-secondary">{t('studentLeave.reviewNote')}: {row.review_note}</p>
            )}
          </div>
        )}
      />
    </ResponsiveShell>
  )
}
