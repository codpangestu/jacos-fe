import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { QrCode, School, UserCheck } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ProgressCard from '../../components/dashboard/ProgressCard'
import TableCard from '../../components/dashboard/TableCard'
import ListCard from '../../components/dashboard/ListCard'
import HighlightCard from '../../components/dashboard/HighlightCard'
import FormField from '../../components/ui/FormField'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet } from '../../lib/api'
import { todayInputValue, formatDateLong } from '../../lib/format'

const STATUS_COLOR = {
  hadir: 'var(--color-success-500)',
  izin: 'var(--color-accent-500)',
  sakit: 'var(--color-primary-100)',
  alpa: 'var(--color-danger-500)',
}

export default function GuruDashboard() {
  const { t } = useTranslation()
  const today = todayInputValue()

  const { data: classroomsData } = useQuery({
    queryKey: ['guru', 'classrooms'],
    queryFn: () => apiGet('/api/guru/classrooms'),
  })
  const classrooms = classroomsData?.classrooms ?? []
  const [selectedClassroomId, setSelectedClassroomId] = useState(null)
  const classroomId = selectedClassroomId ?? classrooms[0]?.id ?? null
  const classroom = classrooms.find((c) => c.id === classroomId)

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['guru', 'attendance', classroomId, today],
    queryFn: () => apiGet(`/api/classrooms/${classroomId}/attendance`, { date: today }),
    enabled: !!classroomId,
  })

  const { data: notPickedUpData } = useQuery({
    queryKey: ['pickup', 'not-picked-up', classroomId],
    queryFn: () => apiGet('/api/students/not-picked-up', { classroom_id: classroomId }),
    enabled: !!classroomId,
  })

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsData?.announcements ?? []

  const { data: pendingStudentLeaveData } = useQuery({
    queryKey: ['guru', 'student-leave-requests', 'pending'],
    queryFn: () => apiGet('/api/guru/student-leave-requests', { status: 'pending' }),
  })
  const pendingStudentLeaveCount = pendingStudentLeaveData?.total ?? 0

  const students = attendanceData?.students ?? []
  const totalStudents = students.length
  const recorded = students.filter((s) => s.status).length
  const isHoliday = attendanceData?.is_holiday

  const distribution = ['hadir', 'izin', 'sakit', 'alpa'].map((code) => ({
    label: t(`status.${code}`),
    value: students.filter((s) => s.status === code).length,
    color: STATUS_COLOR[code],
  }))

  const notPickedUp = notPickedUpData?.students ?? []

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS.guru}
      pageTitle={t('dashboard.title')}
      pageSubtitle={formatDateLong(today)}
    >
      {classrooms.length > 1 && (
        <FormField
          as="select"
          label={t('attendance.classroom')}
          htmlFor="classroom"
          value={classroomId ?? ''}
          onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
          className="w-56"
        >
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FormField>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={School}
          label={t('dashboard.myClassroom')}
          value={classroom ? `${classroom.name} — ${t('dashboard.studentsCount', { count: totalStudents })}` : '-'}
          tone="primary"
        />
        <StatCard
          icon={UserCheck}
          label={t('dashboard.attendanceToday')}
          value={isHoliday ? t('dashboard.holiday') : t('dashboard.recordedOf', { recorded, total: totalStudents })}
          tone={recorded === totalStudents && totalStudents > 0 ? 'success' : 'accent'}
        />
        <StatCard
          icon={QrCode}
          label={t('dashboard.notPickedUp')}
          value={t('dashboard.studentsCount', { count: notPickedUp.length })}
          tone="danger"
        />
      </div>

      {!isHoliday && recorded === 0 && !attendanceLoading && classroom && (
        <HighlightCard
          title={t('dashboard.notRecordedTitle')}
          description={t('dashboard.notRecordedDescription', { classroom: classroom.name })}
          ctaLabel={t('dashboard.recordAttendanceNow')}
          ctaTo="/guru/attendance"
        />
      )}

      {pendingStudentLeaveCount > 0 && (
        <HighlightCard
          title={t('studentLeave.pendingTitle')}
          description={t('studentLeave.pendingDescription', { count: pendingStudentLeaveCount })}
          ctaLabel={t('studentLeave.reviewNow')}
          ctaTo="/guru/student-leave-requests"
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressCard title={t('dashboard.attendanceDistribution')} items={distribution} />
        <TableCard
          title={t('dashboard.notPickedUpInMyClass')}
          viewAllTo="/guru/pickup/verify"
          columns={[
            { key: 'name', label: t('dashboard.name') },
            { key: 'status', label: t('common.status') },
          ]}
          rows={notPickedUp.map((s) => ({
            ...s,
            status: { label: t('dashboard.notPickedUp'), tone: 'danger' },
          }))}
        />
      </div>

      {announcements.length > 0 && (
        <ListCard
          title={t('announcements.dashboardTitle')}
          items={announcements.map((a) => ({
            initials: a.title.slice(0, 2).toUpperCase(),
            primary: a.title,
            secondary: a.body,
          }))}
        />
      )}
    </DashboardLayout>
  )
}
