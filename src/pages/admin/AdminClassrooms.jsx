import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPost, apiPut } from '../../lib/api'

const EMPTY_FORM = { name: '', grade_level_id: '', academic_year_id: '', homeroom_teacher_id: '' }

export default function AdminClassrooms() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'classrooms'],
    queryFn: () => apiGet('/api/admin/classrooms'),
  })
  const { data: gradeLevelsData } = useQuery({
    queryKey: ['admin', 'grade-levels'],
    queryFn: () => apiGet('/api/admin/grade-levels'),
  })
  const { data: yearsData } = useQuery({
    queryKey: ['admin', 'academic-years'],
    queryFn: () => apiGet('/api/admin/academic-years'),
  })
  const { data: guruData } = useQuery({
    queryKey: ['admin', 'staff', 'guru'],
    queryFn: () => apiGet('/api/admin/staff', { type: 'guru' }),
  })

  const gradeLevels = gradeLevelsData?.grade_levels ?? []
  const years = yearsData?.academic_years ?? []
  const guruList = guruData?.data ?? []

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? apiPut(`/api/admin/classrooms/${editing.id}`, { name: form.name, homeroom_teacher_id: form.homeroom_teacher_id || null })
        : apiPost('/api/admin/classrooms', form),
    onSuccess: () => {
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'classrooms'] })
    },
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({
      name: row.name,
      grade_level_id: row.grade_level_id,
      academic_year_id: row.academic_year_id,
      homeroom_teacher_id: row.homeroom_teacher_id ?? '',
    })
    setEditing(row)
    setShowForm(true)
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('classrooms.title')}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('classrooms.add')}
        </button>
      </div>

      <DataTable
        loading={isLoading}
        rows={data ?? []}
        columns={[
          { key: 'name', label: t('classrooms.name') },
          { key: 'grade', label: t('classrooms.gradeLevel'), render: (row) => row.grade_level?.name },
          { key: 'year', label: t('classrooms.academicYear'), render: (row) => row.academic_year?.label },
          { key: 'homeroom', label: t('classrooms.homeroomTeacher'), render: (row) => row.homeroom_teacher?.name ?? t('classrooms.noHomeroom') },
          { key: 'students_count', label: t('classrooms.studentsCount') },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('common.edit')}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t('common.edit') : t('classrooms.add')}
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
          label={t('classrooms.name')}
          htmlFor="name"
          required
          placeholder={t('classrooms.namePlaceholder')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <FormField
          as="select"
          label={t('classrooms.gradeLevel')}
          htmlFor="grade_level_id"
          required
          disabled={!!editing}
          value={form.grade_level_id}
          onChange={(e) => setForm({ ...form, grade_level_id: e.target.value })}
        >
          <option value="">-</option>
          {gradeLevels.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </FormField>
        <FormField
          as="select"
          label={t('classrooms.academicYear')}
          htmlFor="academic_year_id"
          required
          disabled={!!editing}
          value={form.academic_year_id}
          onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}
        >
          <option value="">-</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.label}
            </option>
          ))}
        </FormField>
        <FormField
          as="select"
          label={t('classrooms.homeroomTeacher')}
          htmlFor="homeroom_teacher_id"
          value={form.homeroom_teacher_id}
          onChange={(e) => setForm({ ...form, homeroom_teacher_id: e.target.value })}
        >
          <option value="">-</option>
          {guruList.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </FormField>
      </Modal>
    </DashboardLayout>
  )
}
