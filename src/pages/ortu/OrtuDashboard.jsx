import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, QrCode, Receipt } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ListCard from '../../components/dashboard/ListCard'
import HighlightCard from '../../components/dashboard/HighlightCard'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { formatCurrency, formatDate, formatDateLong, formatTime, todayInputValue } from '../../lib/format'

export default function OrtuDashboard() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const today = todayInputValue()
  const month = today.slice(0, 7)

  const { data: attendanceData } = useQuery({
    queryKey: ['ortu', 'attendance', activeChild?.id, month],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/attendance`, { month }),
    enabled: !!activeChild,
  })
  const attendances = attendanceData?.attendances ?? []
  const hadirCount = attendances.filter((a) => a.status === 'hadir').length

  const { data: pickupLogsData } = useQuery({
    queryKey: ['ortu', 'pickup-logs', activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickup-logs`),
    enabled: !!activeChild,
  })
  const todayLog = (pickupLogsData?.data ?? []).find((log) => log.checked_out_at?.startsWith(today))

  const { data: invoicesData } = useQuery({
    queryKey: ['ortu', 'invoices', activeChild?.id, 'belum_bayar'],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/invoices`, { status: 'belum_bayar' }),
    enabled: !!activeChild,
  })
  const activeInvoice = (invoicesData?.invoices ?? [])[0]

  const { data: announcementsData } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiGet('/api/announcements'),
  })
  const announcements = announcementsData?.announcements ?? []

  if (!activeChild) return null

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.dashboardTitle')} pageSubtitle={formatDateLong(new Date().toISOString())} showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarCheck}
          label={t('ortu.attendanceThisMonth')}
          value={t('dashboard.recordedOf', { recorded: hadirCount, total: attendances.length })}
          tone="primary"
        />
        <StatCard
          icon={QrCode}
          label={t('ortu.pickupStatusToday')}
          value={todayLog ? t('ortu.pickedUpAt', { time: formatTime(todayLog.checked_out_at) }) : t('ortu.notPickedUpYet')}
          tone={todayLog ? 'success' : 'danger'}
        />
        <StatCard
          icon={Receipt}
          label={t('ortu.activeInvoice')}
          value={activeInvoice ? formatCurrency(activeInvoice.amount) : t('ortu.noActiveInvoice')}
          tone={activeInvoice ? 'accent' : 'navy'}
        />
      </div>

      <ListCard
        title={t('ortu.recentAttendance')}
        viewAllTo="/ortu/attendance"
        items={attendances
          .slice(-5)
          .reverse()
          .map((a) => ({
            initials: t(`status.${a.status}`).slice(0, 2).toUpperCase(),
            primary: formatDate(a.date),
            secondary: t(`status.${a.status}`),
          }))}
      />

      {activeInvoice && (
        <HighlightCard
          title={t('ortu.invoiceDueSoonTitle')}
          description={t('ortu.invoiceDueSoonDescription', {
            invoiceNumber: activeInvoice.invoice_number,
            amount: formatCurrency(activeInvoice.amount),
            date: formatDate(activeInvoice.due_date),
          })}
          ctaLabel={t('ortu.payNow')}
          ctaTo={`/ortu/invoices/${activeInvoice.id}`}
        />
      )}

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
