import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import ExportButton from '../../components/ui/ExportButton'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet } from '../../lib/api'
import { todayInputValue } from '../../lib/format'

export default function AdminAttendanceReport() {
  const { t } = useTranslation()
  const [classroomId, setClassroomId] = useState('')
  const [date, setDate] = useState(todayInputValue())

  const { data: classroomsData } = useQuery({
    queryKey: ['admin', 'classrooms'],
    queryFn: () => apiGet('/api/admin/classrooms'),
  })
  const classrooms = classroomsData ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'attendance', classroomId, date],
    queryFn: () => apiGet(`/api/classrooms/${classroomId}/attendance`, { date }),
    enabled: !!classroomId,
  })

  const students = data?.students ?? []

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('attendance.reportTitle')}>
      <FilterBar
        filters={[
          {
            key: 'classroom',
            type: 'select',
            label: t('attendance.classroom'),
            value: classroomId,
            onChange: setClassroomId,
            options: [{ value: '', label: t('common.all') }, ...classrooms.map((c) => ({ value: c.id, label: c.name }))],
          },
          { key: 'date', type: 'date', label: t('common.date'), value: date, onChange: setDate },
        ]}
        trailing={<ExportButton />}
      />

      {!classroomId ? (
        <p className="rounded-2xl border border-border bg-bg-surface p-8 text-center text-sm text-text-secondary">
          {t('attendance.selectClassroom')}
        </p>
      ) : (
        <DataTable
          loading={isLoading}
          rows={students}
          rowKey={(row) => row.student_id}
          columns={[
            { key: 'name', label: t('dashboard.name') },
            {
              key: 'status',
              label: t('common.status'),
              render: (row) => (row.status ? <StatusBadge code={row.status} /> : '-'),
            },
            { key: 'note', label: t('common.note'), render: (row) => row.note || '-' },
          ]}
        />
      )}
    </DashboardLayout>
  )
}
