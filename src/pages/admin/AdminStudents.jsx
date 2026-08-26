import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPost, apiPut, apiPatch } from '../../lib/api'

const EMPTY_FORM = { nis: '', name: '', classroom_id: '', birth_date: '', gender: '' }

export default function AdminStudents() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [classroomId, setClassroomId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [statusTarget, setStatusTarget] = useState(null)

  const { data: classroomsData } = useQuery({
    queryKey: ['admin', 'classrooms'],
    queryFn: () => apiGet('/api/admin/classrooms'),
  })
  const classrooms = classroomsData ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', classroomId, status, page],
    queryFn: () => apiGet('/api/admin/students', { classroom_id: classroomId || undefined, status: status || undefined, page }),
  })

  const saveMutation = useMutation({
    mutationFn: () => (editing ? apiPut(`/api/admin/students/${editing.id}`, form) : apiPost('/api/admin/students', form)),
    onSuccess: () => {
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: () => apiPatch(`/api/admin/students/${statusTarget.id}/status`, {
      status: statusTarget.status === 'active' ? 'inactive' : 'active',
    }),
    onSuccess: () => {
      setStatusTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({
      nis: row.nis,
      name: row.name,
      classroom_id: row.classroom_id ?? '',
      birth_date: row.birth_date ?? '',
      gender: row.gender ?? '',
    })
    setEditing(row)
    setShowForm(true)
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('students.title')}>
      <FilterBar
        filters={[
          {
            key: 'classroom',
            type: 'select',
            label: t('students.classroom'),
            value: classroomId,
            onChange: setClassroomId,
            options: [{ value: '', label: t('students.filterClassroom') }, ...classrooms.map((c) => ({ value: c.id, label: c.name }))],
          },
          {
            key: 'status',
            type: 'select',
            label: t('students.status'),
            value: status,
            onChange: setStatus,
            options: [
              { value: '', label: t('students.filterStatus') },
              { value: 'active', label: t('status.active') },
              { value: 'inactive', label: t('status.inactive') },
            ],
          },
        ]}
        trailing={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
          >
            <Plus size={16} />
            {t('students.add')}
          </button>
        }
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
          { key: 'nis', label: t('students.nis') },
          { key: 'name', label: t('students.name') },
          { key: 'classroom', label: t('students.classroom'), render: (row) => row.classroom?.name ?? '-' },
          { key: 'status', label: t('students.status'), render: (row) => <StatusBadge code={row.status} /> },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusTarget(row)}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
                >
                  {t(row.status === 'active' ? 'students.deactivate' : 'students.activate')}
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t('students.edit') : t('students.add')}
        footer={
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField
          label={t('students.nis')}
          htmlFor="nis"
          required
          disabled={!!editing}
          value={form.nis}
          onChange={(e) => setForm({ ...form, nis: e.target.value })}
        />
        <FormField label={t('students.name')} htmlFor="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <FormField
          as="select"
          label={t('students.classroom')}
          htmlFor="classroom_id"
          value={form.classroom_id}
          onChange={(e) => setForm({ ...form, classroom_id: e.target.value })}
        >
          <option value="">-</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FormField>
        <FormField
          label={t('students.birthDate')}
          htmlFor="birth_date"
          type="date"
          value={form.birth_date}
          onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
        />
        <FormField
          as="select"
          label={t('students.gender')}
          htmlFor="gender"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">-</option>
          <option value="male">{t('status.male')}</option>
          <option value="female">{t('status.female')}</option>
        </FormField>
      </Modal>

      <Modal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title={t(statusTarget?.status === 'active' ? 'students.deactivateConfirmTitle' : 'students.activateConfirmTitle')}
        description={statusTarget?.status === 'active' ? t('students.deactivateConfirmDescription') : undefined}
        footer={
          <button
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate()}
            className="rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:opacity-60"
          >
            {statusMutation.isPending ? t('common.processing') : t('common.confirm')}
          </button>
        }
      />
    </DashboardLayout>
  )
}
