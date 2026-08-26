import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import AttendanceStatusPicker from '../../components/AttendanceStatusPicker'
import { apiGet, apiPatch } from '../../lib/api'
import { todayInputValue } from '../../lib/format'

export default function GuruAttendanceHistory() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayInputValue())
  const [editing, setEditing] = useState(null)

  const { data: classroomsData } = useQuery({
    queryKey: ['guru', 'classrooms'],
    queryFn: () => apiGet('/api/guru/classrooms'),
  })
  const classrooms = classroomsData?.classrooms ?? []
  const [selectedClassroomId, setSelectedClassroomId] = useState(null)
  const classroomId = selectedClassroomId ?? classrooms[0]?.id ?? null

  const { data, isLoading } = useQuery({
    queryKey: ['guru', 'attendance', classroomId, date],
    queryFn: () => apiGet(`/api/classrooms/${classroomId}/attendance`, { date }),
    enabled: !!classroomId,
  })

  const editMutation = useMutation({
    mutationFn: ({ student_id, status, note }) =>
      apiPatch(`/api/classrooms/${classroomId}/attendance`, { student_id, date, status, note: note || null }),
    onSuccess: () => {
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['guru', 'attendance'] })
    },
  })

  const students = (data?.students ?? []).filter((s) => s.status)

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.guru} pageTitle={t('attendance.historyTitle')} showSearch={false}>
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-bg-surface p-4">
        {classrooms.length > 1 && (
          <FormField
            as="select"
            label={t('attendance.classroom')}
            htmlFor="classroom"
            value={classroomId ?? ''}
            onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
            className="w-48"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormField>
        )}
        <FormField
          label={t('attendance.selectDate')}
          htmlFor="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-48"
        />
      </div>

      <DataTable
        loading={isLoading}
        rows={students}
        rowKey={(row) => row.student_id}
        columns={[
          { key: 'name', label: t('dashboard.name') },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          { key: 'note', label: t('common.note'), render: (row) => row.note || '-' },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                disabled={!row.editable}
                title={!row.editable ? t('attendance.editNotAllowed') : undefined}
                onClick={() => setEditing(row)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Pencil size={13} />
                {t('common.edit')}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t('attendance.editRecord')}
        description={editing?.name}
        footer={
          <button
            type="button"
            disabled={editMutation.isPending}
            onClick={() =>
              editMutation.mutate({ student_id: editing.student_id, status: editing.status, note: editing.note })
            }
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {editMutation.isPending ? t('common.processing') : t('common.save')}
          </button>
        }
      >
        {editing && (
          <>
            <AttendanceStatusPicker
              value={editing.status}
              onChange={(status) => setEditing({ ...editing, status })}
            />
            <textarea
              value={editing.note ?? ''}
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
              placeholder={t('attendance.notePlaceholder')}
              rows={3}
              className="w-full rounded-lg border border-border bg-bg-page px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:outline-none"
            />
          </>
        )}
      </Modal>
    </DashboardLayout>
  )
}
