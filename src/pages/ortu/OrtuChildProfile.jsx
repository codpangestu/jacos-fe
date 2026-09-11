import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarCheck, ChevronRight, QrCode, Receipt, UserRound } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, storageUrl } from '../../lib/api'
import { formatDate, formatTime, todayInputValue } from '../../lib/format'

const ATTENDANCE_CODES = ['hadir', 'izin', 'sakit', 'alpa']

export default function OrtuChildProfile() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const month = todayInputValue().slice(0, 7)

  const { data: detailData } = useQuery({
    queryKey: ['ortu', 'child', activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}`),
    enabled: !!activeChild,
  })
  const student = detailData?.student

  const { data: attendanceData } = useQuery({
    queryKey: ['ortu', 'attendance', activeChild?.id, month],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/attendance`, { month }),
    enabled: !!activeChild,
  })
  const attendances = attendanceData?.attendances ?? []
  const counts = Object.fromEntries(ATTENDANCE_CODES.map((code) => [code, attendances.filter((a) => a.status === code).length]))
  const rate = attendances.length ? Math.round((counts.hadir / attendances.length) * 100) : null

  const { data: invoicesData } = useQuery({
    queryKey: ['ortu', 'invoices', activeChild?.id, 'all'],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/invoices`),
    enabled: !!activeChild,
  })
  const invoices = invoicesData?.invoices ?? []
  const currentInvoice = invoices.find((i) => i.period === month) ?? invoices[0]
  const latestPaidInvoice = invoices.find((i) => i.status === 'lunas')

  const { data: pickupLogsData } = useQuery({
    queryKey: ['ortu', 'pickup-logs', activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickup-logs`),
    enabled: !!activeChild,
  })
  const lastPickupLog = (pickupLogsData?.data ?? [])[0]
  const lastAttendance = attendances[attendances.length - 1]

  if (!activeChild) return null

  const activity = [
    lastPickupLog && {
      key: 'pickup',
      text: t('ortu.activityPickup', {
        name: activeChild.name,
        pickup: lastPickupLog.authorized_pickup?.name ?? '-',
        relationship: lastPickupLog.authorized_pickup?.relationship ?? '-',
        time: formatTime(lastPickupLog.checked_out_at),
      }),
    },
    lastAttendance && {
      key: 'attendance',
      text: t('ortu.activityAttendance', { status: t(`status.${lastAttendance.status}`), date: formatDate(lastAttendance.date) }),
    },
    latestPaidInvoice && {
      key: 'payment',
      text: t('ortu.activityPayment', { period: latestPaidInvoice.period }),
    },
  ].filter(Boolean)

  return (
    <ResponsiveShell pageTitle={t('ortu.childProfileTitle')} headerVariant="title" showSearch={false}>
      <nav className="flex items-center gap-1.5 text-sm">
        <Link to="/ortu/dashboard" className="font-semibold text-primary-300 hover:underline">
          {t('dashboard.title')}
        </Link>
        <ChevronRight size={14} className="text-text-secondary" />
        <span className="truncate text-text-secondary">{activeChild.name}</span>
      </nav>

      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          {student?.photo_path ? (
            <img src={storageUrl(student.photo_path)} alt={student.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
              <UserRound size={28} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-bold text-text-primary">{student?.name ?? activeChild.name}</h2>
            <p className="text-sm text-text-secondary">
              {student?.nis} · {student?.classroom?.name ?? '-'}
              {student?.classroom?.homeroom_teacher && ` · ${t('ortu.homeroomTeacher')} ${student.classroom.homeroom_teacher.name}`}
            </p>
          </div>
          {student && <StatusBadge code={student.status} />}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to="/ortu/attendance"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-text-primary hover:bg-bg-page"
          >
            <CalendarCheck size={14} />
            {t('navMenu.attendanceHistory')}
          </Link>
          <Link
            to="/ortu/pickups"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-text-primary hover:bg-bg-page"
          >
            <QrCode size={14} />
            {t('navMenu.managePickups')}
          </Link>
          <Link
            to="/ortu/invoices"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-text-primary hover:bg-bg-page"
          >
            <Receipt size={14} />
            {t('navMenu.billList')}
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-2xl border border-border bg-bg-surface p-5">
          <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('students.studentInfo')}</h3>
          <dl className="space-y-2 text-sm">
            <Row label={t('students.nis')} value={student?.nis} />
            <Row label={t('students.classroom')} value={student?.classroom?.name} />
            <Row label={t('ortu.homeroomTeacher')} value={student?.classroom?.homeroom_teacher?.name} />
            <Row label={t('students.birthDate')} value={student?.birth_date ? formatDate(student.birth_date) : null} />
            <Row label={t('students.gender')} value={student?.gender ? t(`status.${student.gender}`) : null} />
            <Row label={t('students.bloodType')} value={student?.blood_type} />
            <Row label={t('students.address')} value={student?.address} />
            <Row label={t('students.emergencyContact')} value={student?.emergency_contact} />
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-bg-surface p-5">
          <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('ortu.thisMonthSummary')}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t('students.attendanceRate')}</span>
            <span className="font-heading text-xl font-extrabold text-text-primary">{rate === null ? '-' : `${rate}%`}</span>
          </div>
          <div className="mt-3 space-y-2">
            {ATTENDANCE_CODES.map((code) => (
              <div key={code} className="flex items-center gap-2.5 text-sm">
                <span className="w-14 shrink-0 text-text-secondary">{t(`status.${code}`)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-page">
                  <div
                    className={`h-full rounded-full ${
                      code === 'hadir' ? 'bg-success-500' : code === 'alpa' ? 'bg-danger-500' : 'bg-accent-500'
                    }`}
                    style={{ width: attendances.length ? `${(counts[code] / attendances.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-medium text-text-primary">{counts[code]}</span>
              </div>
            ))}
          </div>
          <hr className="my-3 border-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t('finance.period')} {month}</span>
            {currentInvoice ? (
              <Link to={`/ortu/invoices/${currentInvoice.id}`} className="flex items-center gap-1 font-semibold text-primary-300 hover:underline">
                <StatusBadge code={currentInvoice.status} />
              </Link>
            ) : (
              <span className="text-text-secondary">{t('ortu.noActiveInvoice')}</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg-surface p-5">
          <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('dashboard.recentActivity')}</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-text-secondary">{t('ortu.noActivity')}</p>
          ) : (
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.key} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                  <span className="text-text-primary">{a.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ResponsiveShell>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-right font-medium text-text-primary">{value || '-'}</dd>
    </div>
  )
}
