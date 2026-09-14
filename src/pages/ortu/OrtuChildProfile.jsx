import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarCheck, ChevronRight, QrCode, Receipt, UserRound, ChevronLeft, TrendingUp, Star } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, storageUrl } from '../../lib/api'
import { formatDate, formatTime, todayInputValue } from '../../lib/format'
import boyVector from '../../assets/picture/boy.svg'
import girlVector from '../../assets/picture/girl.svg'

const ATTENDANCE_CODES = ['hadir', 'izin', 'sakit', 'alpa']

export default function OrtuChildProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeChild } = useOrtuChildren()
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
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div className="relative flex flex-col min-h-screen bg-bg-page overflow-hidden">
        
        {/* ── HERO HEADER ─────────────────────────────────
            Gradient biru kiri terang → kanan gelap
            Blur icon dekoratif di background
            Vektor boy/girl centered, nama + info di bawah
        ──────────────────────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden pb-16"
          style={{
            background: 'linear-gradient(to right, #35AEFC 0%, #007BFF 50%, #003F8A 100%)',
            paddingTop: 'max(1rem, env(safe-area-inset-top))',
            boxShadow: '0 4px 24px rgba(0,63,138,0.30)',
          }}
        >
          {/* Dekorasi: blur circles layer */}
          <div className="pointer-events-none absolute -left-12 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div className="pointer-events-none absolute -left-2 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          {/* Blur icon dekoratif kanan atas */}
          <div className="pointer-events-none absolute right-8 top-8 h-20 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', filter: 'blur(16px)' }} />
          <div className="pointer-events-none absolute right-20 top-20 h-12 w-12 rounded-full" style={{ background: 'rgba(255,255,255,0.20)', filter: 'blur(10px)' }} />

          {/* Top bar: back + title */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-2 pb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.20)' }}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-heading text-[16px] font-bold text-white">
              {t('ortu.childProfileTitle')}
            </h1>
            <div className="h-9 w-9" />
          </div>

          {/* Character vector + nama */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Vector karakter — boy/girl otomatis */}
            <div className="relative h-[190px] w-[190px]">
              {student?.photo_path ? (
                <img
                  src={storageUrl(student.photo_path)}
                  alt={student.name}
                  className="h-full w-full rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <img
                  src={student?.gender === 'female' || activeChild?.gender === 'female' ? girlVector : boyVector}
                  alt={student?.name ?? activeChild.name}
                  className="h-full w-full object-contain drop-shadow-2xl"
                  draggable="false"
                />
              )}
              {/* Badge bintang — di samping kepala, atas kanan */}
              <div className="absolute top-6 -right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-yellow-400 shadow-md">
                <Star size={15} className="fill-white text-white" />
              </div>
            </div>

            {/* Nama & info */}
            <h2 className="mt-3 font-heading text-[22px] font-extrabold text-white drop-shadow-sm">
              {student?.name ?? activeChild.name}
            </h2>
            <p className="mt-1 text-[13px] font-medium text-white/75">
              {student?.classroom?.name ?? activeChild.classroom?.name ?? '-'} • NIS {student?.nis ?? '-'}
            </p>
          </div>
        </div>

        {/* ── WHITE SHEET CONTENT ── */}
        <div className="relative z-10 -mt-8 flex-1 w-full bg-bg-surface rounded-t-[32px] pt-5 px-5 pb-24 flex flex-col gap-5 shadow-[0_-8px_32px_rgba(0,0,0,0.10)]">
          <div className="w-full flex justify-center mb-2">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          {/* KARTU KEHADIRAN */}
          <div className="relative flex flex-col w-full bg-bg-surface rounded-[24px] p-5 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="absolute -bottom-10 -right-8 w-36 h-36 bg-primary-300/10 rounded-full blur-2xl" />
            <div className="flex justify-between items-center w-full mb-3 z-10">
              <h3 className="text-sm font-semibold text-text-secondary">{t('ortu.thisMonthSummary')}</h3>
              <div className="flex items-center gap-1 bg-success-500/10 px-2 py-1 rounded-xl">
                <TrendingUp size={12} className="text-success-500" />
                <span className="text-[11px] font-bold text-success-500">{t('students.attendanceRate')}</span>
              </div>
            </div>
            <div className="flex items-end gap-1 z-10">
              <span className="text-[42px] font-bold text-text-primary leading-none">{rate === null ? '-' : rate}</span>
              {rate !== null && <span className="text-base font-bold text-text-secondary mb-1">%</span>}
            </div>
          </div>

          {/* DUA KOLOM (Aktivitas & Tagihan) */}
          <div className="flex w-full gap-4">
            <div className="relative flex-1 flex flex-col bg-bg-surface rounded-[24px] p-4 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-yellow-400/15 rounded-full blur-xl" />
              <span className="text-[13px] font-semibold text-text-secondary mb-2 z-10">{t('dashboard.recentActivity')}</span>
              <div className="flex items-center gap-1.5 z-10">
                <span className="text-xl font-bold text-text-primary">{activity.length}</span>
                <span className="text-xs font-bold text-success-500">Aktivitas</span>
              </div>
            </div>

            <div className="relative flex-1 flex flex-col bg-bg-surface rounded-[24px] p-4 border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-danger-500/10 rounded-full blur-xl" />
              <span className="text-[13px] font-semibold text-text-secondary mb-2 z-10">{t('finance.period')}</span>
              <div className="flex items-center z-10 mt-1">
                {currentInvoice ? (
                  <StatusBadge code={currentInvoice.status} />
                ) : (
                  <span className="text-sm font-bold text-text-primary">-</span>
                )}
              </div>
            </div>
          </div>

          {/* AKSES CEPAT (List) */}
          <div className="flex flex-col w-full mt-2">
            <div className="flex justify-between items-center w-full mb-3">
              <h3 className="text-base font-bold text-text-primary">Akses Cepat</h3>
            </div>
            <div className="flex flex-col w-full bg-bg-surface rounded-[24px] border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-2">
              <Link to="/ortu/attendance" className="flex items-center w-full p-3 rounded-2xl hover:bg-bg-page transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-300/10 mr-3 shrink-0">
                  <CalendarCheck size={20} className="text-primary-300" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-text-primary">{t('navMenu.attendanceHistory')}</span>
                  <span className="text-xs text-text-secondary">Rekap kehadiran</span>
                </div>
                <ChevronRight size={16} className="text-text-secondary" />
              </Link>
              <div className="w-[calc(100%-24px)] h-px bg-border mx-auto my-0.5" />
              <Link to="/ortu/pickups" className="flex items-center w-full p-3 rounded-2xl hover:bg-bg-page transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-500/10 mr-3 shrink-0">
                  <QrCode size={20} className="text-accent-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-text-primary">{t('navMenu.managePickups')}</span>
                  <span className="text-xs text-text-secondary">QR Penjemputan</span>
                </div>
                <ChevronRight size={16} className="text-text-secondary" />
              </Link>
              <div className="w-[calc(100%-24px)] h-px bg-border mx-auto my-0.5" />
              <Link to="/ortu/invoices" className="flex items-center w-full p-3 rounded-2xl hover:bg-bg-page transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-success-500/10 mr-3 shrink-0">
                  <Receipt size={20} className="text-success-500" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold text-text-primary">{t('navMenu.billList')}</span>
                  <span className="text-xs text-text-secondary">Tagihan SPP</span>
                </div>
                <ChevronRight size={16} className="text-text-secondary" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </ResponsiveShell>
  )
}
