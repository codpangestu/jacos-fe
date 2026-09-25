import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  BellRing,
  CalendarCheck,
  QrCode,
  Receipt,
  UserCheck,
} from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ProgressCard from '../../components/dashboard/ProgressCard'
import TableCard from '../../components/dashboard/TableCard'
import ListCard from '../../components/dashboard/ListCard'
import ActivityTimelineCard from '../../components/dashboard/ActivityTimelineCard'
import HighlightCard from '../../components/dashboard/HighlightCard'
import GreetingBanner from '../../components/dashboard/GreetingBanner'
import QuickActions from '../../components/dashboard/QuickActions'
import AttendanceByClassCard from '../../components/dashboard/AttendanceByClassCard'
import FinanceSummaryCard from '../../components/dashboard/FinanceSummaryCard'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet, apiPost } from '../../lib/api'
import { formatCurrency, formatDateLong, formatDateTime, formatPeriod, todayInputValue } from '../../lib/format'
import { getUser } from '../../lib/auth'

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
  const storedUser = getUser()
  const userName = storedUser?.name ?? 'Admin'
  const queryClient = useQueryClient()

  // Track kelas mana yang sudah dikirim reminder (reset tiap muat halaman)
  const [reminded, setReminded] = useState({})

  // ── Data fetching — 1 request, bukan N+1 ─────────────────────────────────

  const { data: attendanceSummary } = useQuery({
    queryKey: ['admin', 'attendance', 'today-summary', today],
    queryFn: () => apiGet('/api/admin/reports/attendance/today-summary', { date: today }),
  })

  // Submission status — kelas yang belum/belum selesai input absensi hari ini
  const { data: submissionData } = useQuery({
    queryKey: ['admin', 'attendance', 'submission-status', today],
    queryFn: () => apiGet('/api/admin/attendance/submission-status', { date: today }),
  })
  const incompleteClasses = (submissionData?.classrooms ?? []).filter(
    (c) => c.status === 'not_started' || c.status === 'partial',
  )

  const remindMutation = useMutation({
    mutationFn: (classroomId) => apiPost(`/api/admin/classrooms/${classroomId}/attendance/remind`),
    onSuccess: (_data, classroomId) => {
      setReminded((prev) => ({ ...prev, [classroomId]: true }))
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', 'submission-status'] })
    },
  })

  const totalStudents = attendanceSummary?.total_students ?? 0
  const hadirCount    = attendanceSummary?.hadir ?? 0
  const attendancePct = totalStudents > 0 ? Math.round((hadirCount / totalStudents) * 100) : 0

  // Breakdown per kelas dari response agregasi
  const attendanceByClass = (attendanceSummary?.by_classroom ?? [])
    .filter((r) => r.total > 0)
    .map((r) => ({ className: r.classroom_name, hadir: r.hadir, total: r.total }))

  // ── Lainnya ───────────────────────────────────────────────────────────────

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

  // ── Kalkulasi distribusi kehadiran — dari data agregasi ──────────────────

  const distribution = ['hadir', 'izin', 'sakit', 'alpa'].map((code) => ({
    label: t(`status.${code}`),
    value: totalStudents > 0 ? Math.round(((attendanceSummary?.[code] ?? 0) / totalStudents) * 100) : 0,
    color: STATUS_COLOR[code],
  }))

  // ── Delta stat cards ──────────────────────────────────────────────────────
  // Persentase kehadiran hari ini sebagai delta indicator
  const attendanceDelta = totalStudents > 0
    ? { value: `${attendancePct}%`, direction: attendancePct >= 80 ? 'up' : 'down' }
    : undefined

  // ── Quick actions ─────────────────────────────────────────────────────────
  const quickActions = [
    { label: 'Absensi Hari Ini', to: '/admin/reports/attendance', icon: UserCheck },
    { label: 'Approve Cuti', to: '/admin/leave-requests', icon: CalendarCheck, badge: pendingLeaves.length },
    { label: 'Log Penjemputan', to: '/admin/pickup-logs', icon: QrCode },
    { label: 'Invoice', to: '/admin/finance/invoices', icon: Receipt },
  ]

  // ── Finance data ──────────────────────────────────────────────────────────
  const financePeriod = financeData?.period ? formatPeriod(financeData.period) : ''

  return (
    <DashboardLayout
      menuGroups={menuGroups}
      pageTitle={t('dashboard.title')}
      pageSubtitle={formatDateLong(today)}
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
          {/* Pending leave list */}
          {pendingLeaves.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="font-heading text-sm font-bold text-text-primary">
                {t('dashboard.pendingLeaveTitle')}
              </h3>
              <ul className="mt-4 divide-y divide-border">
                {pendingLeaves.slice(0, 5).map((lr) => (
                  <li key={lr.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-xs font-semibold text-primary-fg">
                      {lr.staff?.name?.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{lr.staff?.name}</p>
                      <p className="truncate text-xs text-text-secondary">{t(`status.${lr.type}`, lr.type)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="/admin/leave-requests"
                className="mt-2 block text-xs font-semibold text-primary-fg hover:underline"
              >
                {t('common.viewAll')}
              </a>
            </div>
          )}

          {/* Overdue invoice highlight */}
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

          {/* Finance summary mini */}
          {financeData && (
            <FinanceSummaryCard
              totalBilled={financeData.total_billed ?? financeData.total_invoiced ?? 0}
              totalPaid={financeData.total_paid ?? 0}
              totalOutstanding={financeData.total_outstanding ?? 0}
              overdueCount={financeData.overdue_count ?? 0}
              periodLabel={financePeriod}
            />
          )}

          {/* Activity timeline — selalu ada sebagai fallback right rail */}
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
      {/* ── 1. Greeting banner ── */}
      <GreetingBanner
        name={userName}
        dateLabel={formatDateLong(today)}
        academicYear={financeData?.academic_year ?? undefined}
      />

      {/* ── 2. Quick actions ── */}
      <QuickActions actions={quickActions} />

      {/* ── 3. Alert: kelas yang belum/belum selesai input absensi ── */}
      {incompleteClasses.length > 0 && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/8 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-accent-fg" />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-bold text-text-primary">
                {incompleteClasses.length} Kelas Belum Selesai Input Absensi
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Hari ini, {incompleteClasses.length} rombel belum mengisi absensi lengkap.
                Kirim pengingat ke wali kelas atau cek halaman status pengisian.
              </p>

              {/* Daftar kelas ringkas */}
              <ul className="mt-3 flex flex-wrap gap-2">
                {incompleteClasses.map((c) => (
                  <li
                    key={c.classroom_id}
                    className="flex items-center gap-2 rounded-lg border border-accent-500/20 bg-bg-surface px-3 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary">{c.classroom_name}</p>
                      <p className="text-[11px] text-text-secondary">
                        {c.homeroom_teacher ?? 'Tanpa wali kelas'} ·{' '}
                        {c.status === 'not_started'
                          ? 'Belum diisi'
                          : `${c.marked}/${c.total_students} diisi`}
                      </p>
                    </div>
                    {/* Tombol remind per kelas */}
                    <button
                      type="button"
                      disabled={!c.homeroom_teacher_id || remindMutation.isPending || reminded[c.classroom_id]}
                      title={!c.homeroom_teacher_id ? 'Belum ada wali kelas' : undefined}
                      onClick={() => remindMutation.mutate(c.classroom_id)}
                      className="ml-1 flex shrink-0 items-center gap-1 rounded-md bg-accent-500/15 px-2 py-1 text-[11px] font-semibold text-accent-fg transition-opacity hover:bg-accent-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <BellRing size={11} />
                      {reminded[c.classroom_id] ? 'Terkirim' : 'Ingatkan'}
                    </button>
                  </li>
                ))}
              </ul>

              <a
                href="/admin/attendance/submission-status"
                className="mt-3 inline-block text-xs font-semibold text-accent-fg hover:underline"
              >
                Lihat semua status pengisian →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={UserCheck}
          label={t('dashboard.attendanceToday')}
          value={totalStudents > 0 ? `${hadirCount}/${totalStudents}` : '-'}
          tone="primary"
          delta={attendanceDelta}
        />
        <StatCard
          icon={QrCode}
          label={t('dashboard.notPickedUp')}
          value={t('dashboard.studentsCount', { count: notPickedUp.length })}
          tone="danger"
          delta={
            notPickedUp.length === 0
              ? { value: 'Semua terjemput', direction: 'up' }
              : undefined
          }
        />
        <StatCard
          icon={CalendarCheck}
          label={t('dashboard.pendingLeaveStat')}
          value={t('dashboard.pendingLeaveValue', { count: pendingLeaves.length })}
          tone="accent"
        />
        <StatCard
          icon={Receipt}
          label={t('dashboard.overdueInvoiceStat')}
          value={t('dashboard.overdueInvoiceValue', { count: financeData?.overdue_count ?? 0 })}
          tone="navy"
        />
      </div>

      {/* ── 5. Attendance distribution + not picked up ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressCard
          title={t('dashboard.attendanceDistribution')}
          caption={
            totalStudents > 0
              ? `${hadirCount} dari ${totalStudents} siswa hadir hari ini (${attendancePct}%)`
              : undefined
          }
          items={distribution}
        />
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

      {/* ── 6. Attendance breakdown per kelas ── */}
      {attendanceByClass.length > 0 && (
        <AttendanceByClassCard
          title="Kehadiran per Kelas Hari Ini"
          rows={attendanceByClass}
        />
      )}

      {/* ── 7. Announcements (naik ke main area, lebih visible) ── */}
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
