import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, Car, CreditCard } from 'lucide-react'
import { setActiveChildId } from '../../lib/activeChild'
import { storageUrl } from '../../lib/api'

const UNPAID_STATUSES = ['belum_bayar', 'terlambat']

/** Status "hari ini" ringkas ala kartu anak di homepage (bukan StatusBadge penuh). */
function childTodayState(child) {
  if (child.today_status === 'hadir' && !child.picked_up_at) return 'at_school'
  if (child.picked_up_at) return 'at_home'
  if (['izin', 'sakit', 'alpa'].includes(child.today_status)) return child.today_status
  return 'unknown'
}

const STATE_STYLE = {
  at_school: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  at_home: 'border-transparent bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/70',
  izin: 'border-accent-500/20 bg-accent-500/10 text-accent-500',
  sakit: 'border-primary-300/20 bg-primary-300/10 text-primary-300',
  alpa: 'border-danger-500/20 bg-danger-500/10 text-danger-500',
  unknown: 'border-transparent bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/70',
}

/**
 * Kartu ringkasan per anak (bukan cuma yang lagi aktif) di homepage Dashboard
 * Ortu — avatar+status hari ini di header, 3 tombol aksi cepat berwarna.
 */
export default function ChildOverviewCard({ child }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function goTo(path) {
    setActiveChildId(child.id)
    navigate(path)
  }

  const initials = child.name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  const invoiceUnpaid = child.invoice && UNPAID_STATUSES.includes(child.invoice.status)
  const state = childTodayState(child)
  const stateLabel =
    state === 'at_school'
      ? t('ortu.statusAtSchool')
      : state === 'at_home'
        ? t('ortu.statusAtHome')
        : state === 'unknown'
          ? t('ortu.statusNotRecordedShort')
          : t(`status.${state}`)

  return (
    <div className="flex flex-col gap-2.5 rounded-[20px] border border-border bg-bg-surface p-3.5 shadow-sm">
      <button
        type="button"
        onClick={() => goTo('/ortu/profile-anak')}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {child.photo_path ? (
            <img
              src={storageUrl(child.photo_path)}
              alt={child.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                child.gender === 'female' ? 'bg-pink-50 text-pink-500' : 'bg-primary-300/15 text-primary-300'
              }`}
            >
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-text-primary">{child.name}</p>
            <p className="truncate text-[11px] text-text-secondary">
              {child.classroom?.name ?? '-'}
              {child.nis ? ` • ${t('students.nis')} ${child.nis}` : ''}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold whitespace-nowrap ${STATE_STYLE[state]}`}>
          {stateLabel}
        </span>
      </button>

      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={() => goTo('/ortu/attendance')}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 py-1.5"
        >
          <CalendarCheck size={12} className="text-emerald-600" />
          <span className="text-[11px] font-semibold text-emerald-600">{t('ortu.actionAttendance')}</span>
        </button>
        <button
          type="button"
          onClick={() => goTo('/ortu/pickups')}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-orange-50 py-1.5"
        >
          <Car size={12} className="text-orange-600" />
          <span className="text-[11px] font-semibold text-orange-700">{t('ortu.actionPickup')}</span>
        </button>
        {invoiceUnpaid && (
          <button
            type="button"
            onClick={() => goTo(`/ortu/invoices/${child.invoice.id}`)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-purple-50 py-1.5"
          >
            <CreditCard size={12} className="text-purple-600" />
            <span className="text-[11px] font-semibold text-purple-700">{t('ortu.actionPay')}</span>
          </button>
        )}
      </div>
    </div>
  )
}
