import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ChevronRight, Plus } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import MobileCardList from '../../components/ui/MobileCardList'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, apiPostForm } from '../../lib/api'
import { formatDate } from '../../lib/format'

// Harus sinkron dengan Complaint::CATEGORIES di backend — dipakai hanya untuk
// isi dropdown; validasi sebenarnya tetap di server.
const CATEGORIES = ['akademik', 'keuangan', 'sarana', 'disiplin', 'lainnya']

export default function OrtuComplaints() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { children, activeChild } = useOrtuChildren()

  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)

  const emptyForm = () => ({ student_id: '', category: 'akademik', subject: '', body: '', attachment: null })
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'complaints', page],
    queryFn: () => apiGet('/api/ortu/complaints', { page }),
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v)
      })
      return apiPostForm('/api/ortu/complaints', body)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ortu', 'complaints'] })
      setForm(emptyForm())
      setFormOpen(false)
      // Langsung ke tiketnya — nomor tiket + status "Baru" adalah konfirmasi
      // paling jelas bahwa pengaduan benar-benar masuk.
      navigate(`/ortu/complaints/${result.complaint.id}`)
    },
  })

  function openForm() {
    // Anak yang sedang aktif dipakai sebagai default, tapi tetap boleh diubah
    // atau dikosongkan (pengaduan umum tidak terkait anak tertentu).
    setForm({ ...emptyForm(), student_id: activeChild?.id ?? '' })
    submitMutation.reset()
    setFormOpen(true)
  }

  return (
    <ResponsiveShell pageTitle={t('complaints.myTitle')} headerVariant="title" showSearch={false}>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-5">
        <p className="text-sm text-text-secondary">{t('complaints.formHint')}</p>
        <button
          type="button"
          onClick={openForm}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('complaints.newComplaint')}
        </button>
      </div>

      <MobileCardList
        loading={isLoading}
        rows={data?.data ?? []}
        emptyMessage={t('complaints.emptyMine')}
        onRowClick={(row) => navigate(`/ortu/complaints/${row.id}`)}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        renderRow={(row) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{row.subject}</p>
              <p className="mt-0.5 font-mono text-[11px] text-text-secondary">
                {row.ticket_no ?? `#${row.id}`}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge code={row.status} />
                <span className="text-[11px] text-text-secondary">
                  {t(`complaints.categories.${row.category}`, row.category)}
                </span>
                {row.student?.name && (
                  <span className="text-[11px] text-text-secondary">· {row.student.name}</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-text-secondary">{formatDate(row.created_at)}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {row.is_overdue && (
                <span
                  title={t('complaints.overdue')}
                  className="flex items-center gap-1 rounded-lg bg-danger-500/12 px-2 py-1 text-[11px] font-semibold text-danger-fg"
                >
                  <AlertTriangle size={12} />
                  {t('complaints.overdue')}
                </span>
              )}
              <ChevronRight size={16} className="text-text-secondary" />
            </div>
          </div>
        )}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t('complaints.newComplaint')}
        description={t('complaints.formHint')}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitMutation.mutate()
          }}
          className="space-y-4"
        >
          {submitMutation.isError && (
            <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
              {submitMutation.error.message}
            </p>
          )}

          <FormField
            as="select"
            label={t('complaints.childLabel')}
            htmlFor="student_id"
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          >
            <option value="">{t('complaints.childGeneral')}</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormField>

          <FormField
            as="select"
            label={t('complaints.category')}
            htmlFor="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`complaints.categories.${c}`, c)}
              </option>
            ))}
          </FormField>

          <FormField
            label={t('complaints.subject')}
            htmlFor="subject"
            required
            maxLength={150}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />

          <FormField
            as="textarea"
            label={t('complaints.body')}
            htmlFor="body"
            required
            rows={5}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          <div>
            <FormField
              label={t('complaints.attachment')}
              htmlFor="attachment"
              type="file"
              onChange={(e) => setForm({ ...form, attachment: e.target.files[0] ?? null })}
            />
            <p className="mt-1 text-xs text-text-secondary">{t('complaints.attachmentHint')}</p>
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {submitMutation.isPending ? t('common.processing') : t('complaints.submit')}
          </button>
        </form>
      </Modal>
    </ResponsiveShell>
  )
}
