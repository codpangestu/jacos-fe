import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import FormField from '../../components/ui/FormField'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPostForm } from '../../lib/api'
import { formatDate, todayInputValue } from '../../lib/format'
import { getUser } from '../../lib/auth'

const EMPTY_FORM = { type: 'sakit', start_date: todayInputValue(), end_date: todayInputValue(), reason: '', attachment: null }

export default function LeaveRequests() {
  const { t } = useTranslation()
  const user = getUser()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['leave-requests', 'mine', page],
    queryFn: () => apiGet('/api/staff/leave-requests', { page }),
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v)
      })
      return apiPostForm('/api/staff/leave-requests', body)
    },
    onSuccess: () => {
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS[user?.role] ?? []} pageTitle={t('leave.title')} showSearch={false}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitMutation.mutate()
        }}
        className="space-y-4 rounded-2xl border border-border bg-bg-surface p-5"
      >
        {submitMutation.isSuccess && (
          <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
            {t('leave.submitSuccess')}
          </p>
        )}
        {submitMutation.isError && (
          <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
            {submitMutation.error.message}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            as="select"
            label={t('leave.type')}
            htmlFor="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="sakit">{t('leave.typeSick')}</option>
            <option value="izin">{t('leave.typePermission')}</option>
            <option value="tahunan">{t('leave.typeAnnual')}</option>
            <option value="lainnya">{t('leave.typeOther')}</option>
          </FormField>
          <FormField
            label={t('leave.attachment')}
            htmlFor="attachment"
            type="file"
            onChange={(e) => setForm({ ...form, attachment: e.target.files[0] ?? null })}
          />
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

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="rounded-xl bg-primary-300 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
        >
          {submitMutation.isPending ? t('common.processing') : t('leave.submit')}
        </button>
      </form>

      <h2 className="font-heading text-base font-bold text-text-primary">{t('leave.historyTitle')}</h2>
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
          { key: 'type', label: t('leave.type'), render: (row) => t(`status.${row.type}`, row.type) },
          { key: 'start_date', label: t('leave.startDate'), render: (row) => formatDate(row.start_date) },
          { key: 'end_date', label: t('leave.endDate'), render: (row) => formatDate(row.end_date) },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          { key: 'review_note', label: t('leave.reviewNote'), render: (row) => row.review_note || '-' },
        ]}
      />
    </DashboardLayout>
  )
}
