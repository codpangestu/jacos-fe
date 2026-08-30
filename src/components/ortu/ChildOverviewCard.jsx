import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarCheck, ChevronRight, QrCode, Receipt } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import { setActiveChildId } from '../../lib/activeChild'
import { storageUrl } from '../../lib/api'
import { formatTime } from '../../lib/format'

const UNPAID_STATUSES = ['belum_bayar', 'terlambat']

/**
 * Ported dari jacos-react parent/Dashboard.jsx: kartu ringkasan per anak
 * (bukan cuma anak yang lagi aktif) supaya ortu bisa lihat kondisi semua
 * anaknya sekilas dari Dashboard, lalu langsung aksi tanpa ke layar switcher dulu.
 */
export default function ChildOverviewCard({ child }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function goTo(path) {
    setActiveChildId(child.id)
    navigate(path)
  }

  const initials = child.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  const invoiceUnpaid = child.invoice && UNPAID_STATUSES.includes(child.invoice.status)

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <button
        type="button"
        onClick={() => goTo('/ortu/profile-anak')}
        className="flex w-full items-center gap-3.5 text-left"
      >
        {child.photo_path ? (
          <img src={storageUrl(child.photo_path)} alt={child.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              child.gender === 'female' ? 'bg-accent-500/15 text-accent-500' : 'bg-primary-300/15 text-primary-300'
            }`}
          >
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-text-primary">{child.name}</p>
          <p className="truncate text-sm text-text-secondary">{child.classroom?.name ?? '-'}</p>
        </div>
        <ChevronRight size={16} className="shrink-0 text-text-secondary" />
      </button>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-bg-page p-2.5">
          <p className="text-[10px] leading-tight font-bold uppercase text-text-secondary">{t('ortu.attendanceLabel')}</p>
          <div className="mt-1.5">
            {child.today_status ? <StatusBadge code={child.today_status} /> : <span className="text-xs text-text-secondary">-</span>}
          </div>
        </div>
        <div className="rounded-xl bg-bg-page p-2.5">
          <p className="text-[10px] leading-tight font-bold uppercase text-text-secondary">{t('ortu.pickupLabel')}</p>
          <div className="mt-1.5">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                child.picked_up_at ? 'bg-success-500/12 text-success-500' : 'bg-danger-500/12 text-danger-500'
              }`}
            >
              {child.picked_up_at ? formatTime(child.picked_up_at) : t('ortu.notPickedUpYet')}
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-bg-page p-2.5">
          <p className="text-[10px] leading-tight font-bold uppercase text-text-secondary">{t('ortu.sppLabel')}</p>
          <div className="mt-1.5">
            {child.invoice ? (
              <StatusBadge code={child.invoice.status} />
            ) : (
              <span className="text-xs text-text-secondary">{t('ortu.noActiveInvoice')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => goTo('/ortu/attendance')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-text-primary hover:bg-bg-page"
        >
          <CalendarCheck size={14} />
          {t('ortu.actionAttendance')}
        </button>
        <button
          type="button"
          onClick={() => goTo('/ortu/pickups')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-text-primary hover:bg-bg-page"
        >
          <QrCode size={14} />
          {t('ortu.actionPickup')}
        </button>
        {invoiceUnpaid && (
          <button
            type="button"
            onClick={() => goTo(`/ortu/invoices/${child.invoice.id}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-300 py-2 text-xs font-semibold text-white hover:bg-primary-400"
          >
            <Receipt size={14} />
            {t('ortu.payNow')}
          </button>
        )}
      </div>
    </div>
  )
}
