import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarCheck, CheckCircle2, QrCode, Receipt, UserRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/dashboard/StatCard'
import ListCard from '../../components/dashboard/ListCard'
import HighlightCard from '../../components/dashboard/HighlightCard'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import ChildOverviewCard from '../../components/ortu/ChildOverviewCard'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { formatCurrency, formatDate, formatDateLong, formatTime, todayInputValue } from '../../lib/format'

const UNPAID_STATUSES = ['belum_bayar', 'terlambat']

function greetingKey() {
  const hour = new Date().getHours()
  if (hour < 11) return 'ortu.greetingMorning'
  if (hour < 15) return 'ortu.greetingAfternoon'
  if (hour < 19) return 'ortu.greetingEvening'
  return 'ortu.greetingNight'
}

export default function OrtuDashboard() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const today = todayInputValue()
  const month = today.slice(0, 7)
  const parentName = getUser()?.name ?? t('nav.defaultUserName')
  const unpaidChildren = children.filter((c) => c.invoice && UNPAID_STATUSES.includes(c.invoice.status))

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

  const { data: pickupsData } = useQuery({
    queryKey: ['ortu', 'pickups', activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickups`),
    enabled: !!activeChild,
  })
  const activePickups = (pickupsData?.pickups ?? []).filter((p) => p.status === 'active')

  if (!activeChild) return null

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS.orang_tua}
      pageTitle={t(greetingKey(), { name: parentName })}
      pageSubtitle={formatDateLong(new Date().toISOString())}
      showSearch={false}
      rightRail={
        <>
          <ListCard
            title={t('ortu.authorizedPickupsTitle')}
            viewAllTo="/ortu/pickups"
            items={activePickups.map((p) => ({
              initials: p.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join(''),
              primary: p.name,
              secondary: p.relationship,
              trailing: <UserRound size={16} className="shrink-0 text-text-secondary" />,
            }))}
          />

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
        </>
      }
    >
      {children.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {children.map((c) => (
            <ChildOverviewCard key={c.id} child={c} />
          ))}
        </div>
      )}

      {unpaidChildren.length > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl bg-danger-500/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger-500" />
          <div className="min-w-0 flex-1 text-sm text-text-primary">
            <p className="font-semibold">{t('ortu.unpaidBannerTitle', { count: unpaidChildren.length })}</p>
            <p className="mt-1 text-text-secondary">
              {unpaidChildren.map((c) => `${c.name.split(' ')[0]} · ${formatCurrency(c.invoice.amount)}`).join(', ')}
            </p>
            <a href="/ortu/invoices" className="mt-2.5 inline-block rounded-lg bg-danger-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-danger-500/90">
              {t('ortu.unpaidBannerCta')}
            </a>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl bg-success-500/10 p-4">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-500" />
          <div className="min-w-0 flex-1 text-sm text-text-primary">
            <p className="font-semibold">{t('ortu.allPaidTitle')}</p>
            <p className="mt-1 text-text-secondary">{t('ortu.allPaidDescription')}</p>
          </div>
        </div>
      )}

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
    </DashboardLayout>
  )
}
