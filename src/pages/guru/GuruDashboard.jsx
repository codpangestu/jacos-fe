import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, QrCode, School, UserCheck } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ProgressCard from '../../components/dashboard/ProgressCard'
import TableCard from '../../components/dashboard/TableCard'
import ListCard from '../../components/dashboard/ListCard'
import HighlightCard from '../../components/dashboard/HighlightCard'
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
  const classroom = classroomsData?.classrooms?.[0]

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['guru', 'attendance', classroom?.id, today],
    queryFn: () => apiGet(`/api/classrooms/${classroom.id}/attendance`, { date: today }),
    enabled: !!classroom,
  })

  const { data: notPickedUpData } = useQuery({
    queryKey: ['pickup', 'not-picked-up'],
    queryFn: () => apiGet('/api/students/not-picked-up'),
    enabled: !!classroom,
  })

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsData?.announcements ?? []

  const students = attendanceData?.students ?? []
  const totalStudents = students.length
  const recorded = students.filter((s) => s.status).length
  const isHoliday = attendanceData?.is_holiday

  const distribution = ['hadir', 'izin', 'sakit', 'alpa'].map((code) => ({
    label: t(`status.${code}`),
    value: students.filter((s) => s.status === code).length,
    color: STATUS_COLOR[code],
  }))

  const notPickedUp = (notPickedUpData?.students ?? []).filter((s) => s.classroom_id === classroom?.id)

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS.guru}
      pageTitle={t('dashboard.title')}
      pageSubtitle={formatDateLong(new Date().toISOString())}
    >
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

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-bg-surface p-4 text-sm text-text-secondary">
        <CalendarCheck size={16} />
        <span>{t('dashboard.leaveReminder')}</span>
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
