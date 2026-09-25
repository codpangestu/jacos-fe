import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarRange, CalendarX2, Receipt, UserCog } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import CommandHero from '../../components/dashboard/CommandHero'
import ActionTileCard from '../../components/dashboard/ActionTileCard'
import AttendanceReminderCard from '../../components/dashboard/AttendanceReminderCard'
import NotificationsCard from '../../components/dashboard/NotificationsCard'
import ClassStatusCard from '../../components/dashboard/ClassStatusCard'
import GaugeCard from '../../components/dashboard/GaugeCard'
import PickupMonitorCard from '../../components/dashboard/PickupMonitorCard'
import AgendaHighlightCard from '../../components/dashboard/AgendaHighlightCard'
import ModulePlaceholderCard from '../../components/dashboard/ModulePlaceholderCard'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet, apiPost } from '../../lib/api'
import { formatCurrency, formatDate, formatDateLong, todayInputValue } from '../../lib/format'
import { getUser, ROLE_LABEL } from '../../lib/auth'

const menuGroups = NAV_MENU_GROUPS.admin

/**
 * Dashboard Admin — disusun ulang mengikuti frame Figma
 * "🖥️ JACOS Admin - Modern Command Center" (node 33:567).
 *
 * Susunan: hero + 3 kartu aksi → 3 kolom tengah (notifikasi / pengingat
 * absensi / kalender) → 3 modul bawah (status rombel / highlight pengumuman /
 * gauge + monitoring penjemputan).
 *
 * Yang TIDAK diadopsi dari Figma beserta alasannya:
 * - "Top Navigation Bar" horizontal → fungsinya sudah ada di topbar
 *   DashboardLayout; CTA "Buat Pengumuman" dipindah ke CommandHero.
 * - Kartu "Konsultasi Wali Santri" → tidak ada endpoint-nya; kartu birunya
 *   dialihkan untuk pengumuman terbaru (data nyata).
 * - "Guru Pengganti" & "Kalender & Agenda" → belum ada endpoint backend-nya,
 *   dirender sebagai placeholder eksplisit (tanpa angka contoh).
 *
 * Status error sengaja dibedakan dari nilai 0: kalau query gagal, komponen
 * menerima isLoading=true sehingga menampilkan "-", bukan "0 siswa" yang bisa
 * salah dibaca sebagai kondisi nyata.
 */
export default function AdminDashboard() {
  const { t } = useTranslation()
  const today = todayInputValue()
  const storedUser = getUser()
  const userName = storedUser?.name ?? t('nav.defaultUserName')
  const roleLabel = ROLE_LABEL[storedUser?.role] ?? '-'
  const queryClient = useQueryClient()

  const [reminded, setReminded] = useState({})

  // ── Query ────────────────────────────────────────────────────────────────

  const attendanceQuery = useQuery({
    queryKey: ['admin', 'attendance', 'today-summary', today],
    queryFn: () => apiGet('/api/admin/reports/attendance/today-summary', { date: today }),
  })
  const attendanceSummary = attendanceQuery.data

  const submissionQuery = useQuery({
    queryKey: ['admin', 'attendance', 'submission-status', today],
    queryFn: () => apiGet('/api/admin/attendance/submission-status', { date: today }),
  })
  const incompleteClasses = (submissionQuery.data?.classrooms ?? []).filter(
    (c) => c.status === 'not_started' || c.status === 'partial',
  )

  const pickupQuery = useQuery({
    queryKey: ['pickup', 'not-picked-up'],
    queryFn: () => apiGet('/api/students/not-picked-up'),
  })
  const notPickedUp = pickupQuery.data?.students ?? []

  const leaveQuery = useQuery({
    queryKey: ['admin', 'leave-requests', 'pending'],
    queryFn: () => apiGet('/api/staff/leave-requests', { status: 'pending' }),
  })
  const pendingLeaves = leaveQuery.data?.data ?? []

  const financeQuery = useQuery({
    queryKey: ['admin', 'finance', 'dashboard'],
    queryFn: () => apiGet('/api/admin/finance/dashboard'),
  })
  const financeData = financeQuery.data

  const announcementsQuery = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsQuery.data?.announcements ?? []

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'dashboard'],
    queryFn: () => apiGet('/api/notifications'),
  })
  const notifications = (notificationsQuery.data?.data ?? []).slice(0, 4)
  const unreadCount = notificationsQuery.data?.unread_count ?? 0

  const dismissalQuery = useQuery({
    queryKey: ['admin', 'dismissal-setting'],
    queryFn: () => apiGet('/api/admin/settings/dismissal-cutoff'),
  })

  // Query yang kegagalannya membuat seluruh halaman menampilkan angka palsu.
  const criticalQueries = [attendanceQuery, submissionQuery, financeQuery]
  const hasCriticalError = criticalQueries.some((q) => q.isError)

  // ── Aksi ─────────────────────────────────────────────────────────────────

  const remindMutation = useMutation({
    mutationFn: (classroomId) => apiPost(`/api/admin/classrooms/${classroomId}/attendance/remind`),
    onSuccess: (_data, classroomId) => {
      setReminded((prev) => ({ ...prev, [classroomId]: true }))
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', 'submission-status'] })
    },
  })

  // Backend belum punya endpoint bulk reminder, jadi tombol "kirim ke semua"
  // memanggil endpoint per-rombel yang sama untuk tiap rombel yang punya wali
  // kelas. Hanya rombel tanpa wali yang dilewati (endpoint akan menolaknya).
  const remindAllMutation = useMutation({
    mutationFn: async (classroomIds) => {
      await Promise.all(
        classroomIds.map((id) => apiPost(`/api/admin/classrooms/${id}/attendance/remind`)),
      )
      return classroomIds
    },
    onSuccess: (classroomIds) => {
      setReminded((prev) => {
        const next = { ...prev }
        classroomIds.forEach((id) => {
          next[id] = true
        })
        return next
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', 'submission-status'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => apiPost(`/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => apiPost('/api/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // ── Turunan data ─────────────────────────────────────────────────────────

  const totalStudents = attendanceSummary?.total_students ?? 0
  const hadirCount = attendanceSummary?.hadir ?? 0
  const attendancePct = totalStudents > 0 ? Math.round((hadirCount / totalStudents) * 100) : 0

  const submissionById = new Map(
    (submissionQuery.data?.classrooms ?? []).map((c) => [c.classroom_id, c]),
  )

  const classRows = (attendanceSummary?.by_classroom ?? [])
    .filter((r) => r.total > 0)
    .map((r) => {
      const sub = submissionById.get(r.classroom_id)
      const notMarked = sub ? Math.max(sub.total_students - sub.marked, 0) : null
      return {
        id: r.classroom_id,
        name: r.classroom_name,
        meta: sub?.homeroom_teacher
          ? t('dashboard.classStatusMeta', { teacher: sub.homeroom_teacher, count: r.total })
          : t('dashboard.classStatusNoTeacher', { count: r.total }),
        pct: r.total > 0 ? Math.round((r.hadir / r.total) * 100) : 0,
        trailing:
          notMarked === null
            ? '-'
            : notMarked === 0
              ? t('dashboard.classStatusAll')
              : t('dashboard.classStatusPending', { count: notMarked }),
      }
    })

  const latestAnnouncement = announcements[0]
  const cutoffTime = dismissalQuery.data?.setting?.cutoff_time?.slice(0, 5)

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
    >
      {hasCriticalError && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/8 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger-fg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary">{t('dashboard.loadError')}</p>
            <button
              type="button"
              onClick={() => criticalQueries.forEach((q) => q.refetch())}
              className="mt-2 cursor-pointer rounded-md bg-danger-500/15 px-2.5 py-1 text-xs font-semibold text-danger-fg transition-colors hover:bg-danger-500/25"
            >
              {t('dashboard.retry')}
            </button>
          </div>
        </div>
      )}

      {/* ── 1. Hero + kartu aksi ── */}
      <CommandHero
        name={userName}
        roleBadge={roleLabel}
        headline={t('dashboard.heroHeadline')}
        subtitle={t('dashboard.heroSubtitle')}
        ctaLabel={t('dashboard.newAnnouncement')}
        ctaTo="/admin/announcements"
      >
        <ActionTileCard
          icon={CalendarX2}
          tone="indigo"
          title={t('dashboard.actionLeaveTitle')}
          meta={
            pendingLeaves.length > 0
              ? t('dashboard.actionLeaveMeta', { count: pendingLeaves.length })
              : t('dashboard.actionLeaveMetaEmpty')
          }
          to="/admin/leave-requests"
        />
        <ActionTileCard
          icon={Receipt}
          tone="amber"
          title={t('dashboard.actionInvoiceTitle')}
          meta={t('dashboard.actionInvoiceMeta', { count: financeData?.overdue_count ?? 0 })}
          to="/admin/finance/invoices"
        />
        {/* Modul "Guru Pengganti" ada di Figma tapi belum ada endpoint-nya. */}
        <ActionTileCard
          icon={UserCog}
          title={t('dashboard.actionSubstituteTitle')}
          meta={t('dashboard.moduleUnavailable')}
          unavailable
        />
      </CommandHero>

      {/* ── 2. Kolom tengah ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <NotificationsCard
          items={notifications}
          unread={unreadCount}
          isLoading={notificationsQuery.isPending}
          onMarkAllRead={() => markAllReadMutation.mutate()}
          onItemClick={(id) => markReadMutation.mutate(id)}
          viewAllTo="/admin/announcements"
        />

        <AttendanceReminderCard
          classes={incompleteClasses}
          reminded={reminded}
          onRemind={(id) => remindMutation.mutate(id)}
          onRemindAll={() =>
            remindAllMutation.mutate(
              incompleteClasses.filter((c) => c.homeroom_teacher_id).map((c) => c.classroom_id),
            )
          }
          isPending={remindMutation.isPending}
          isBulkPending={remindAllMutation.isPending}
          viewAllTo="/admin/attendance/submission-status"
        />

        <ModulePlaceholderCard
          title={t('dashboard.calendarTitle')}
          icon={CalendarRange}
          message={t('dashboard.calendarUnavailable')}
          ctaLabel={t('navMenu.academicYears')}
          ctaTo="/admin/academic-years"
        />
      </div>

      {/* ── 3. Baris bawah ── */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ClassStatusCard
            title={t('dashboard.classStatusTitle')}
            rows={classRows}
            viewAllTo="/admin/reports/attendance"
          />
        </div>

        <div className="lg:col-span-2">
          <AgendaHighlightCard
            title={
              latestAnnouncement
                ? latestAnnouncement.title
                : t('dashboard.announcementHighlightTitle')
            }
            description={
              latestAnnouncement ? latestAnnouncement.body : t('dashboard.announcementHighlightEmpty')
            }
            meta={latestAnnouncement ? formatDate(latestAnnouncement.created_at) : undefined}
            ctaLabel={t('dashboard.announcementHighlightCta')}
            ctaTo={latestAnnouncement ? '/admin/announcements' : undefined}
            empty={!latestAnnouncement}
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="grid grid-cols-2 gap-4">
            <GaugeCard
              label={t('dashboard.gaugeAttendanceLabel')}
              value={attendancePct}
              tone="indigo"
              isLoading={attendanceQuery.isPending || attendanceQuery.isError}
              caption={
                totalStudents > 0
                  ? t('dashboard.gaugeAttendanceCaption', {
                      present: hadirCount,
                      total: totalStudents,
                    })
                  : t('dashboard.gaugeNoData')
              }
              ctaLabel={t('dashboard.gaugeAttendanceCta')}
              ctaTo="/admin/reports/attendance"
            />
            <GaugeCard
              label={t('dashboard.gaugeFinanceLabel')}
              value={financeData?.collection_rate ?? 0}
              tone="blue"
              isLoading={financeQuery.isPending || financeQuery.isError}
              caption={
                financeData
                  ? t('dashboard.gaugeFinanceCaption', {
                      count: financeData.overdue_count ?? 0,
                      amount: formatCurrency(financeData.total_outstanding ?? 0),
                    })
                  : t('dashboard.gaugeNoData')
              }
              ctaLabel={t('dashboard.gaugeFinanceCta')}
              ctaTo="/admin/finance/dashboard"
            />
          </div>

          <PickupMonitorCard
            cutoffTime={cutoffTime}
            students={notPickedUp}
            isLoading={pickupQuery.isPending}
            isError={pickupQuery.isError}
            logTo="/admin/pickup-logs"
            settingsTo="/admin/settings/dismissal-cutoff"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
