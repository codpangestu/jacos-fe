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

// Blok skeleton pengganti angka stat selama pemuatan pertama, supaya tidak ada
// kedipan "0" yang terbaca seperti nilai yang sah.
const LOADING_BLOCK = (
  <span className="block h-8 w-24 animate-pulse rounded-md bg-border" />
)

export default function GuruDashboard() {
  const { t } = useTranslation()
  const today = todayInputValue()

  const classroomsQuery = useQuery({
    queryKey: ['guru', 'classrooms'],
    queryFn: () => apiGet('/api/guru/classrooms'),
  })
  const classrooms = classroomsQuery.data?.classrooms ?? []
  const [selectedClassroomId, setSelectedClassroomId] = useState(null)
  const classroomId = selectedClassroomId ?? classrooms[0]?.id ?? null
  const classroom = classrooms.find((c) => c.id === classroomId)

  const attendanceQuery = useQuery({
    queryKey: ['guru', 'attendance', classroomId, today],
    queryFn: () => apiGet(`/api/classrooms/${classroomId}/attendance`, { date: today }),
    enabled: !!classroomId,
  })

  const notPickedUpQuery = useQuery({
    queryKey: ['pickup', 'not-picked-up', classroomId],
    queryFn: () => apiGet('/api/students/not-picked-up', { classroom_id: classroomId }),
    enabled: !!classroomId,
  })

  const announcementsQuery = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsQuery.data?.announcements ?? []

  const pendingStudentLeaveQuery = useQuery({
    queryKey: ['guru', 'student-leave-requests', 'pending'],
    queryFn: () => apiGet('/api/guru/student-leave-requests', { status: 'pending' }),
  })
  const pendingStudentLeaveCount = pendingStudentLeaveQuery.data?.total ?? 0

  const attendanceData = attendanceQuery.data
  const notPickedUpData = notPickedUpQuery.data
  const students = attendanceData?.students ?? []
  const totalStudents = students.length
  const recorded = students.filter((s) => s.status).length
  const isHoliday = attendanceData?.is_holiday
  const notPickedUp = notPickedUpData?.students ?? []

  const queries = [
    classroomsQuery,
    attendanceQuery,
    notPickedUpQuery,
    announcementsQuery,
    pendingStudentLeaveQuery,
  ]
  // isLoading react-query hanya true pada pemuatan pertama query yang benar-benar
  // jalan (query yang di-disable tidak dihitung), jadi skeleton ini tidak berkedip
  // saat refetch di belakang layar.
  const isLoading = classroomsQuery.isLoading || attendanceQuery.isLoading || notPickedUpQuery.isLoading
  const isError = queries.some((q) => q.isError)

  function retryAll() {
    queries.forEach((q) => q.refetch())
  }

  // Tanpa ini, request yang gagal tampil sebagai "0 siswa" / "0/0 sudah diinput"
  // yang terbaca seperti data sah. Kalau datanya tidak ada, katakan tidak ada.
  const statValue = (value) => (isLoading ? LOADING_BLOCK : (value ?? '-'))

  const classroomValue = statValue(
    classroom ? `${classroom.name} — ${t('dashboard.studentsCount', { count: totalStudents })}` : null
  )
  const attendanceValue = statValue(
    attendanceData
      ? isHoliday
        ? t('dashboard.holiday')
        : t('dashboard.recordedOf', { recorded, total: totalStudents })
      : null
  )
  const notPickedUpValue = statValue(
    notPickedUpData ? t('dashboard.studentsCount', { count: notPickedUp.length }) : null
  )

  // Persentase dibagi jumlah siswa rombel (bukan jumlah yang sudah diinput) supaya
  // hari yang belum lengkap terlihat belum lengkap, bukan seperti bersih 100%.
  const distribution = ['hadir', 'izin', 'sakit', 'alpa'].map((code) => {
    const count = students.filter((s) => s.status === code).length
    return {
      label: t(`status.${code}`),
      value: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
      color: STATUS_COLOR[code],
    }
  })

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

      {isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-500/10 px-3.5 py-3">
          <p className="text-sm text-danger-fg">{t('dashboard.loadError')}</p>
          <button
            type="button"
            onClick={retryAll}
            className="shrink-0 rounded-lg border border-danger-500/30 px-3 py-1.5 text-xs font-semibold text-danger-fg transition-colors hover:bg-danger-500/10"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={School}
          label={t('dashboard.myClassroom')}
          value={classroomValue}
          tone="primary"
        />
        <StatCard
          icon={UserCheck}
          label={t('dashboard.attendanceToday')}
          value={attendanceValue}
          tone={recorded === totalStudents && totalStudents > 0 ? 'success' : 'accent'}
        />
        <StatCard
          icon={QrCode}
          label={t('dashboard.notPickedUp')}
          value={notPickedUpValue}
          tone="danger"
        />
      </div>

      {!isHoliday && recorded === 0 && attendanceQuery.isSuccess && classroom && (
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
        <ProgressCard
          title={t('dashboard.attendanceDistribution')}
          caption={
            attendanceData
              ? t('dashboard.distributionCaption', { recorded, total: totalStudents })
              : t('dashboard.distributionUnavailable')
          }
          items={attendanceData ? distribution : []}
        />
        <TableCard
          title={t('dashboard.notPickedUpInMyClass')}
          viewAllTo="/guru/pickup/verify"
          columns={[
            { key: 'name', label: t('dashboard.name') },
            { key: 'status', label: t('common.status') },
          ]}
          rows={
            notPickedUpData
              ? notPickedUp.map((s) => ({
                  ...s,
                  status: { label: t('dashboard.notPickedUp'), tone: 'danger' },
                }))
              : []
          }
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
