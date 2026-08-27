import { useQueries, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, QrCode, Receipt, UserCheck } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ProgressCard from '../../components/dashboard/ProgressCard'
import TableCard from '../../components/dashboard/TableCard'
import ListCard from '../../components/dashboard/ListCard'
import ActivityTimelineCard from '../../components/dashboard/ActivityTimelineCard'
import HighlightCard from '../../components/dashboard/HighlightCard'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet } from '../../lib/api'
import { formatCurrency, formatDateLong, formatDateTime, todayInputValue } from '../../lib/format'

const menuGroups = NAV_MENU_GROUPS.admin

const STATUS_COLOR = {
  hadir: 'var(--color-success-500)',
  izin: 'var(--color-accent-500)',
  sakit: 'var(--color-primary-100)',
  alpa: 'var(--color-danger-500)',
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const today = todayInputValue()

  const { data: classroomsData } = useQuery({
    queryKey: ['admin', 'classrooms'],
    queryFn: () => apiGet('/api/admin/classrooms'),
  })
  const classrooms = classroomsData ?? []

  const attendanceQueries = useQueries({
    queries: classrooms.map((c) => ({
      queryKey: ['admin', 'attendance', c.id, today],
      queryFn: () => apiGet(`/api/classrooms/${c.id}/attendance`, { date: today }),
      enabled: classrooms.length > 0,
    })),
  })
  const allStudents = attendanceQueries.flatMap((q) => q.data?.students ?? [])
  const totalStudents = allStudents.length
  const hadirCount = allStudents.filter((s) => s.status === 'hadir').length

  const { data: notPickedUpData } = useQuery({
    queryKey: ['pickup', 'not-picked-up'],
    queryFn: () => apiGet('/api/students/not-picked-up'),
  })
  const notPickedUp = notPickedUpData?.students ?? []

  const { data: leaveData } = useQuery({
    queryKey: ['admin', 'leave-requests', 'pending'],
    queryFn: () => apiGet('/api/staff/leave-requests', { status: 'pending' }),
  })
  const pendingLeaves = leaveData?.data ?? []

  const { data: financeData } = useQuery({
    queryKey: ['admin', 'finance', 'dashboard'],
    queryFn: () => apiGet('/api/admin/finance/dashboard'),
  })

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsData?.announcements ?? []

  const { data: auditData } = useQuery({
    queryKey: ['admin', 'audit-log', 'recent'],
    queryFn: () => apiGet('/api/admin/audit-log'),
  })
  const recentActivity = auditData?.data ?? []

  const distribution = ['hadir', 'izin', 'sakit', 'alpa'].map((code) => ({
    label: t(`status.${code}`),
    value: allStudents.filter((s) => s.status === code).length,
    color: STATUS_COLOR[code],
  }))

  return (
    <DashboardLayout
      menuGroups={menuGroups}
      pageTitle={t('dashboard.title')}
      pageSubtitle={formatDateLong(new Date().toISOString())}
      sidebarAlert={
        pendingLeaves.length > 0
          ? {
              title: t('dashboard.pendingLeaveSidebarTitle', { count: pendingLeaves.length }),
              description: t('dashboard.pendingLeaveSidebarDescription'),
              ctaLabel: t('common.viewAll'),
              ctaTo: '/admin/leave-requests',
            }
          : undefined
      }
      rightRail={
        <>
          {pendingLeaves.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="font-heading text-sm font-bold text-text-primary">{t('dashboard.pendingLeaveTitle')}</h3>
              <ul className="mt-4 divide-y divide-border">
                {pendingLeaves.slice(0, 5).map((lr) => (
                  <li key={lr.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-xs font-semibold text-primary-300">
                      {lr.staff?.name?.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{lr.staff?.name}</p>
                      <p className="truncate text-xs text-text-secondary">{t(`status.${lr.type}`, lr.type)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a href="/admin/leave-requests" className="mt-2 block text-xs font-semibold text-primary-300 hover:underline">
                {t('common.viewAll')}
              </a>
            </div>
          )}
          {financeData && financeData.overdue_count > 0 && (
            <HighlightCard
              title={t('dashboard.overdueInvoiceTitle')}
              description={t('dashboard.overdueInvoiceDescription', {
                count: financeData.overdue_count,
                amount: formatCurrency(financeData.total_outstanding),
              })}
              ctaLabel={t('finance.dashboardTitle')}
              ctaTo="/admin/finance/dashboard"
            />
          )}
          <ActivityTimelineCard
            title={t('dashboard.recentActivity')}
            viewAllTo="/admin/audit-log"
            items={recentActivity.slice(0, 5).map((a) => ({
              time: formatDateTime(a.created_at),
              who: a.user?.name ?? '-',
              action: a.action,
            }))}
          />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={UserCheck}
          label={t('dashboard.attendanceToday')}
          value={totalStudents > 0 ? `${hadirCount}/${totalStudents}` : '-'}
          tone="primary"
        />
        <StatCard icon={QrCode} label={t('dashboard.notPickedUp')} value={t('dashboard.studentsCount', { count: notPickedUp.length })} tone="danger" />
        <StatCard icon={CalendarCheck} label={t('dashboard.pendingLeaveStat')} value={t('dashboard.pendingLeaveValue', { count: pendingLeaves.length })} tone="accent" />
        <StatCard icon={Receipt} label={t('dashboard.overdueInvoiceStat')} value={t('dashboard.overdueInvoiceValue', { count: financeData?.overdue_count ?? 0 })} tone="navy" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressCard title={t('dashboard.attendanceDistribution')} items={distribution} />
        <TableCard
          title={t('dashboard.notPickedUpSchoolWide')}
          viewAllTo="/admin/pickup-logs"
          columns={[
            { key: 'name', label: t('dashboard.name') },
            { key: 'classroom', label: t('students.classroom') },
            { key: 'status', label: t('common.status') },
          ]}
          rows={notPickedUp.slice(0, 8).map((s) => ({
            name: s.name,
            classroom: s.classroom?.name,
            status: { label: t('dashboard.notPickedUp'), tone: 'danger' },
          }))}
        />
      </div>

      {announcements.length > 0 && (
        <ListCard
          title={t('announcements.dashboardTitle')}
          viewAllTo="/admin/announcements"
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
