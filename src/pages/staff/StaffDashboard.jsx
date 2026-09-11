import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, Clock, QrCode } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import StatCard from '../../components/dashboard/StatCard'
import ListCard from '../../components/dashboard/ListCard'
import { getUser } from '../../lib/auth'
import { apiGet } from '../../lib/api'
import { formatDateLong, formatTime } from '../../lib/format'

function greetingKey() {
  const hour = new Date().getHours()
  if (hour < 11) return 'ortu.greetingMorning'
  if (hour < 15) return 'ortu.greetingAfternoon'
  if (hour < 19) return 'ortu.greetingEvening'
  return 'ortu.greetingNight'
}

export default function StaffDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['staff', 'attendance', 'today'],
    queryFn: () => apiGet('/api/staff/attendance/today'),
  })

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsData?.announcements ?? []

  const attendance = data?.attendance
  const statusValue = !attendance
    ? t('dashboard.notCheckedIn')
    : attendance.check_out_time
      ? t('dashboard.checkedOutAt', { time: formatTime(attendance.check_out_time) })
      : t('dashboard.checkedInAt', { time: formatTime(attendance.check_in_time) })

  const staffName = getUser()?.name ?? t('nav.defaultUserName')

  return (
    <ResponsiveShell
      pageTitle={t(greetingKey(), { name: staffName })}
      pageSubtitle={formatDateLong(new Date().toISOString())}
      headerVariant="greeting"
      showSearch={false}
    >
      <div className="grid grid-cols-1 gap-3">
        <StatCard
          icon={Clock}
          label={t('dashboard.myAttendanceToday')}
          value={statusValue}
          tone={attendance?.check_in_time ? 'success' : 'accent'}
        />
        <StatCard icon={Camera} label={t('dashboard.leaveQuota')} value={t('dashboard.leaveQuotaUnset')} tone="navy" />
      </div>

      <button
        type="button"
        onClick={() => navigate('/staff/attendance/self')}
        className="w-full rounded-2xl bg-gradient-to-br from-primary-300 to-primary-900 p-6 text-left text-white transition-transform hover:scale-[1.01]"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          <Camera size={16} />
          {t('dashboard.myAttendanceToday')}
        </div>
        <p className="mt-2 text-lg font-bold">{statusValue}</p>
        <span className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-300">
          {t('dashboard.goToSelfAttendance')}
        </span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/staff/pickup/verify')}
        className="w-full rounded-2xl border-2 border-dashed border-primary-300/40 bg-primary-300/5 p-6 text-left transition-colors hover:bg-primary-300/10"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary-300">
          <QrCode size={16} />
          {t('dashboard.pickupShortcutTitle')}
        </div>
        <p className="mt-2 text-sm text-text-secondary">{t('dashboard.pickupShortcutDescription')}</p>
        <span className="mt-4 inline-block rounded-lg bg-primary-300 px-4 py-2 text-sm font-semibold text-white">
          {t('dashboard.pickupShortcutCta')}
        </span>
      </button>

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
    </ResponsiveShell>
  )
}
