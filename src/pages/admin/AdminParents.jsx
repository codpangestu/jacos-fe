import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPost } from '../../lib/api'

const EMPTY_FORM = { name: '', email: '', student_ids: [], relationship: '' }

export default function AdminParents() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [created, setCreated] = useState(null)
  const [linking, setLinking] = useState(null)
  const [linkStudentId, setLinkStudentId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'parents', page],
    queryFn: () => apiGet('/api/admin/parents', { page }),
  })

  const { data: studentsData } = useQuery({
    queryKey: ['admin', 'students', 'all'],
    queryFn: () => apiGet('/api/admin/students'),
  })
  const students = studentsData?.data ?? []

  const createMutation = useMutation({
    mutationFn: () => apiPost('/api/admin/parents', form),
    onSuccess: (data) => {
      setShowForm(false)
      setCreated({ ...data, email: form.email })
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin', 'parents'] })
    },
  })

  const linkMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/parents/${linking.id}/children`, { student_id: linkStudentId }),
    onSuccess: () => {
      setLinking(null)
      setLinkStudentId('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'parents'] })
    },
  })

  function toggleStudent(id) {
    setForm((f) => ({
      ...f,
      student_ids: f.student_ids.includes(id) ? f.student_ids.filter((s) => s !== id) : [...f.student_ids, id],
    }))
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('parents.title')}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('parents.add')}
        </button>
      </div>

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
          { key: 'name', label: t('parents.name') },
          { key: 'email', label: t('parents.email') },
          { key: 'children', label: t('parents.children'), render: (row) => row.children?.map((c) => c.name).join(', ') || '-' },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => setLinking(row)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('parents.linkChild')}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t('parents.add')}
        size="lg"
        footer={
          <button
            type="button"
            disabled={createMutation.isPending || form.student_ids.length === 0}
            onClick={() => createMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField label={t('parents.name')} htmlFor="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <FormField
          label={t('parents.email')}
          htmlFor="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <FormField
          label={t('parents.relationship')}
          htmlFor="relationship"
          placeholder={t('parents.relationshipPlaceholder')}
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('parents.selectChildren')}</label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-bg-page">
                <input type="checkbox" checked={form.student_ids.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                {s.name} <span className="text-xs text-text-secondary">({s.classroom?.name ?? '-'})</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!created}
        onClose={() => setCreated(null)}
        title={t('staff.createdTitle')}
        footer={
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400"
          >
            {t('staff.close')}
          </button>
        }
      >
        <p className="text-sm text-text-secondary">{t('staff.temporaryPasswordNote')}</p>
        <div className="space-y-1 rounded-xl bg-bg-page p-4 text-sm">
          <p>
            <span className="text-text-secondary">{t('parents.email')}: </span>
            <span className="font-mono font-semibold text-text-primary">{created?.email}</span>
          </p>
          <p>
            <span className="text-text-secondary">Password: </span>
            <span className="font-mono font-semibold text-text-primary">{created?.temporary_password}</span>
          </p>
        </div>
      </Modal>

      <Modal
        open={!!linking}
        onClose={() => setLinking(null)}
        title={t('parents.linkChildTo', { name: linking?.name })}
        footer={
          <button
            type="button"
            disabled={!linkStudentId || linkMutation.isPending}
            onClick={() => linkMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField as="select" label={t('students.title')} htmlFor="student_id" value={linkStudentId} onChange={(e) => setLinkStudentId(e.target.value)}>
          <option value="">-</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </FormField>
      </Modal>
    </DashboardLayout>
  )
}
