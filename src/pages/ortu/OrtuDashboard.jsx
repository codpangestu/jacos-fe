import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  QrCode,
  Receipt,
  Repeat,
  UserRound,
  Wallet,
} from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, storageUrl } from '../../lib/api'
import { getUser } from '../../lib/auth'
import { setActiveChildId } from '../../lib/activeChild'
import {
  formatCurrency,
  formatDate,
  formatDateLong,
  formatTime,
  todayInputValue,
  weekdaysShort,
} from '../../lib/format'

const UNPAID = ['belum_bayar', 'terlambat']

function greetingKey() {
  const h = new Date().getHours()
  if (h < 11) return 'ortu.greetingMorning'
  if (h < 15) return 'ortu.greetingAfternoon'
  if (h < 19) return 'ortu.greetingEvening'
  return 'ortu.greetingNight'
}

/* ── Status attendance → warna dot ── */
const STATUS_DOT = {
  hadir: 'bg-success-500',
  izin: 'bg-accent-500',
  sakit: 'bg-primary-300',
  alpa: 'bg-danger-500',
}

/* ── Avatar anak: foto atau inisial, ring menyesuaikan konteks ── */
function Avatar({ child, size = 'md', onDark = false }) {
  const initials = child.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  const dims = size === 'sm' ? 'h-9 w-9 text-[11px]' : 'h-14 w-14 text-base'
  const ring = onDark ? 'ring-2 ring-white/25' : 'ring-2 ring-bg-surface'

  if (child.photo_path) {
    return (
      <img
        src={storageUrl(child.photo_path)}
        alt={child.name}
        className={`${dims} ${ring} shrink-0 rounded-full object-cover`}
      />
    )
  }

  const tone =
    child.gender === 'female'
      ? onDark
        ? 'bg-white/15 text-white'
        : 'bg-primary-300/15 text-primary-300'
      : onDark
        ? 'bg-white/15 text-white'
        : 'bg-primary-300/15 text-primary-300'

  return (
    <span
      className={`${dims} ${ring} flex shrink-0 items-center justify-center rounded-full font-bold ${tone}`}
    >
      {initials}
    </span>
  )
}

/* ── Week strip 7 hari terakhir ── */
function WeekStrip({ attendances }) {
  const weekdays = weekdaysShort()
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() - (6 - i))
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const match = attendances.find((a) => a.date === iso)
    return {
      label: weekdays[d.getDay()],
      day: d.getDate(),
      status: match?.status ?? null,
      isToday: i === 6,
    }
  })

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              d.isToday ? 'text-primary-300' : 'text-text-secondary'
            }`}
          >
            {d.label}
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold ${
              d.isToday
                ? 'bg-primary-300 text-white'
                : d.status === 'hadir'
                  ? 'bg-success-500/10 text-success-500'
                  : d.status === 'izin'
                    ? 'bg-accent-500/10 text-accent-500'
                    : d.status === 'sakit'
                      ? 'bg-primary-300/10 text-primary-300'
                      : d.status === 'alpa'
                        ? 'bg-danger-500/10 text-danger-500'
                        : 'border border-border bg-bg-page/60 text-text-secondary'
            }`}
          >
            {d.day}
          </div>
          {d.status && !d.isToday ? (
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[d.status] ?? 'bg-border'}`} />
          ) : (
            <span className="h-1.5 w-1.5" />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Quick action (menu cepat di bawah hero) ── */
function QuickAction({ icon: Icon, label, to, bg, fg }) {
  return (
    <Link to={to} className="group flex flex-col items-center gap-1.5 py-1 no-underline">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-active:scale-90 ${bg}`}
      >
        <Icon size={19} className={fg} />
      </span>
      <span className="line-clamp-2 w-full px-0.5 text-center text-[10.5px] font-semibold leading-[1.3] text-text-secondary">
        {label}
      </span>
    </Link>
  )
}

/* ── Judul seksi + aksi opsional ── */
function SectionHead({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-heading text-[15px] font-bold text-text-primary">{title}</h2>
      {action}
    </div>
  )
}

function ActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary-300 no-underline hover:text-primary-400"
    >
      {children}
      <ChevronRight size={13} />
    </Link>
  )
}

/* ── Chip penjemput sah ── */
function PickupChip({ person }) {
  const initials = person.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-border bg-bg-surface px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-300/12 text-xs font-bold text-primary-300">
        {initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-text-primary">{person.name}</p>
        <p className="truncate text-[11px] text-text-secondary">{person.relationship}</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT — semua query & interaksi tidak diubah
══════════════════════════════════════════════════════ */
export default function OrtuDashboard() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const today = todayInputValue()
  const month = today.slice(0, 7)
  const parentName = getUser()?.name ?? t('nav.defaultUserName')
  const firstName = parentName.split(' ')[0]
  const unpaidChildren = children.filter((c) => c.invoice && UNPAID.includes(c.invoice.status))
  const unpaidTotal = unpaidChildren.reduce((sum, c) => sum + Number(c.invoice.amount ?? 0), 0)

  /* ── Queries (logic unchanged) ── */
  const { data: attendanceData } = useQuery({
    queryKey: ['ortu', 'attendance', activeChild?.id, month],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/attendance`, { month }),
    enabled: !!activeChild,
  })
  const attendances = attendanceData?.attendances ?? []
  const hadirCount = attendances.filter((a) => a.status === 'hadir').length
  const attendPct = attendances.length > 0 ? Math.round((hadirCount / attendances.length) * 100) : 0
  const counts = {
    hadir: hadirCount,
    izin: attendances.filter((a) => a.status === 'izin').length,
    sakit: attendances.filter((a) => a.status === 'sakit').length,
    alpa: attendances.filter((a) => a.status === 'alpa').length,
  }

  const { data: pickupLogsData } = useQuery({
    queryKey: ['ortu', 'pickup-logs', activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickup-logs`),
    enabled: !!activeChild,
  })
  const todayLog = (pickupLogsData?.data ?? []).find((l) => l.checked_out_at?.startsWith(today))

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

  /* Status SPP anak aktif (meniru logika badge versi lama) */
  const sppStatus = activeChild.invoice && UNPAID.includes(activeChild.invoice.status)
    ? activeChild.invoice.status
    : 'lunas'
  const sppDot =
    sppStatus === 'terlambat'
      ? 'bg-accent-500'
      : sppStatus === 'belum_bayar'
        ? 'bg-danger-500'
        : 'bg-success-500'

  return (
    <ResponsiveShell
      pageTitle={t(greetingKey(), { name: firstName })}
      pageSubtitle={formatDateLong(today)}
      headerVariant="greeting"
      showSearch={false}
    >
      {/* ═══════════════════════════════════════════════
          HERO — anak aktif + status hari ini
      ═══════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-900) 105%)' }}
      >
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/8 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3.5">
            <Avatar child={activeChild} onDark />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
                {t('ortu.activeChildLabel')}
              </p>
              <h2 className="truncate font-heading text-lg font-extrabold leading-snug">
                {activeChild.name}
              </h2>
              <p className="truncate text-xs text-white/70">{activeChild.classroom?.name}</p>
            </div>
            {children.length > 1 && (
              <Link
                to="/ortu/select-child"
                className="flex shrink-0 items-center gap-1 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-bold text-white no-underline backdrop-blur transition-colors hover:bg-white/20"
              >
                <Repeat size={13} />
                {t('ortu.switchChild')}
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {/* Kehadiran */}
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-2 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                {t('ortu.attendanceLabel')}
              </p>
              <p className="font-heading text-lg font-extrabold leading-none">
                {attendances.length > 0 ? `${attendPct}%` : '—'}
              </p>
              <span className="mt-1 h-1 w-full max-w-[56px] overflow-hidden rounded-full bg-white/20">
                <span
                  className="block h-full rounded-full bg-white transition-all"
                  style={{ width: attendances.length > 0 ? `${attendPct}%` : '0%' }}
                />
              </span>
            </div>

            {/* Jemput hari ini */}
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-2 py-2.5">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${todayLog ? 'bg-success-500' : 'bg-white/50'}`}
                />
                {t('ortu.pickupLabel')}
              </p>
              <p className="max-w-full truncate text-[13px] font-bold leading-tight">
                {todayLog ? formatTime(todayLog.checked_out_at) : t('ortu.notPickedUpYet')}
              </p>
              <span className="mt-1 h-1 w-full max-w-[56px] rounded-full bg-white/10" />
            </div>

            {/* SPP */}
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-2 py-2.5">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                <span className={`h-1.5 w-1.5 rounded-full ${sppDot}`} />
                {t('ortu.sppLabel')}
              </p>
              <p className="max-w-full truncate text-[13px] font-bold leading-tight">
                {t(`status.${sppStatus}`)}
              </p>
              <span className="mt-1 h-1 w-full max-w-[56px] rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          QUICK ACTIONS
      ═══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-bg-surface px-2 py-1">
        <div className="grid grid-cols-5">
          {[
            {
              icon: CalendarCheck,
              label: t('navMenu.attendanceHistory'),
              to: '/ortu/attendance',
              bg: 'bg-primary-300/12',
              fg: 'text-primary-300',
            },
            {
              icon: QrCode,
              label: t('navMenu.managePickups'),
              to: '/ortu/pickups',
              bg: 'bg-success-500/12',
              fg: 'text-success-500',
            },
            {
              icon: Receipt,
              label: t('navMenu.billList'),
              to: '/ortu/invoices',
              bg: 'bg-accent-500/12',
              fg: 'text-accent-500',
            },
            {
              icon: Wallet,
              label: t('navMenu.paymentHistory'),
              to: '/ortu/payments/history',
              bg: 'bg-primary-100/15',
              fg: 'text-primary-300',
            },
            {
              icon: UserRound,
              label: t('navMenu.childProfile'),
              to: '/ortu/profile-anak',
              bg: 'bg-text-primary/6',
              fg: 'text-text-secondary',
            },
          ].map((item) => (
            <QuickAction key={item.to} {...item} />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          PAYMENT ALERT / ALL-CLEAR
      ═══════════════════════════════════════════════ */}
      {unpaidChildren.length > 0 ? (
        <Link
          to="/ortu/invoices"
          className="flex items-center gap-3 rounded-2xl border border-accent-500/25 bg-accent-500/10 px-4 py-3 no-underline"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500/15">
            <AlertTriangle size={18} className="text-accent-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-text-primary">
              {t('ortu.unpaidBannerTitle', { count: unpaidChildren.length })}
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-accent-500">
              {formatCurrency(unpaidTotal)}
            </p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-text-secondary" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-success-500/25 bg-success-500/10 px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-500/15">
            <CheckCircle2 size={18} className="text-success-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-text-primary">{t('ortu.allPaidTitle')}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{t('ortu.allPaidDescription')}</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          KEHADIRAN BULAN INI
      ═══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-bg-surface p-4">
        <SectionHead
          title={t('ortu.attendanceThisMonth')}
          action={<ActionLink to="/ortu/attendance">{t('common.viewAll')}</ActionLink>}
        />

        <div className="mt-4 grid grid-cols-4 gap-2">
          {['hadir', 'izin', 'sakit', 'alpa'].map((code) => (
            <div
              key={code}
              className="flex flex-col items-center gap-1 rounded-xl bg-bg-page py-2.5"
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[code]}`} />
              <span className="text-sm font-bold text-text-primary">{counts[code]}</span>
              <span className="text-[10.5px] font-medium text-text-secondary">
                {t(`status.${code}`)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <WeekStrip attendances={attendances} />
        </div>

        {attendances.length > 0 ? (
          <div className="mt-4 space-y-2">
            {attendances
              .slice(-3)
              .reverse()
              .map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl bg-bg-page px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[a.status] ?? 'bg-border'}`} />
                    <span className="text-xs font-semibold text-text-primary">
                      {formatDate(a.date)}
                    </span>
                  </div>
                  <StatusBadge code={a.status} />
                </div>
              ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-bg-page py-4 text-center text-xs text-text-secondary">
            {t('common.noData')}
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          ANAK SAYA — hanya relevan saat >1 anak
      ═══════════════════════════════════════════════ */}
      {children.length > 1 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
          <div className="flex items-center justify-between px-4 pt-4 pb-1">
            <h2 className="font-heading text-[15px] font-bold text-text-primary">
              {t('navMenu.myChild')}
            </h2>
            <span className="rounded-full bg-primary-300/10 px-2.5 py-0.5 text-[11px] font-bold text-primary-300">
              {children.length}
            </span>
          </div>
          <div className="mt-1 divide-y divide-border">
            {children.map((c) => {
              const invoiceUnpaid = c.invoice && UNPAID.includes(c.invoice.status)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveChildId(c.id)
                    window.location.href = '/ortu/profile-anak'
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-page active:bg-bg-page"
                >
                  <Avatar child={c} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-text-primary">{c.name}</p>
                    <p className="truncate text-xs text-text-secondary">{c.classroom?.name ?? '-'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {c.today_status && <StatusBadge code={c.today_status} />}
                    {invoiceUnpaid && (
                      <span className="rounded-full bg-accent-500/12 px-2 py-0.5 text-[10px] font-bold text-accent-500">
                        {t('ortu.sppLabel')}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-text-secondary" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PENJEMPUT SAH
      ═══════════════════════════════════════════════ */}
      {activePickups.length > 0 && (
        <div className="space-y-3">
          <SectionHead
            title={t('ortu.authorizedPickupsTitle')}
            action={<ActionLink to="/ortu/pickups">{t('navMenu.managePickups')}</ActionLink>}
          />
          <div className="grid grid-cols-2 gap-2.5">
            {activePickups.slice(0, 4).map((p) => (
              <PickupChip key={p.id} person={p} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TAGIHAN AKTIF
      ═══════════════════════════════════════════════ */}
      {activeInvoice && (
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                {t('ortu.activeInvoice')}
              </p>
              <StatusBadge code={activeInvoice.status} />
            </div>
            <p className="mt-2 font-heading text-[26px] font-extrabold tracking-tight text-text-primary">
              {formatCurrency(activeInvoice.amount)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              #{activeInvoice.invoice_number} · {t('finance.dueDate')}:{' '}
              {formatDate(activeInvoice.due_date)}
            </p>
          </div>
          <Link
            to={`/ortu/invoices/${activeInvoice.id}`}
            className="flex items-center justify-center gap-1.5 bg-primary-300 px-4 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-primary-400"
          >
            {t('ortu.payNow')}
            <ChevronRight size={16} />
          </Link>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          PENGUMUMAN
      ═══════════════════════════════════════════════ */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <SectionHead title={t('announcements.dashboardTitle')} />
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
            <div className="divide-y divide-border">
              {announcements.slice(0, 3).map((a, i) => (
                <div key={a.id ?? i} className="flex gap-3 px-4 py-3.5">
                  <div className="mt-1.5 flex flex-col items-center">
                    <span
                      className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-primary-300' : 'bg-border'}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-[13px] font-semibold text-text-primary">
                        {a.title}
                      </p>
                      {a.created_at && (
                        <span className="shrink-0 text-[11px] text-text-secondary">
                          {formatDate(a.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                      {a.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ResponsiveShell>
  )
}
