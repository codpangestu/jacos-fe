import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CarFront, Settings2 } from 'lucide-react'

/**
 * "Monitoring Penjemputan Santri" (frame Figma "Bottom Row Modules").
 *
 * Data: GET /api/students/not-picked-up (siswa aktif yang belum punya log
 * jemput hari ini, dan tidak berstatus izin/sakit/alpa) + jam cut-off dari
 * GET /api/admin/settings/dismissal-cutoff.
 *
 * Tombol "Broadcast WA" di Figma tidak diimplementasikan: tidak ada integrasi
 * WhatsApp di backend, dan tombol broadcast yang tidak mengirim apa pun lebih
 * berbahaya daripada tidak ada tombol. Diganti tautan ke log gerbang.
 */
export default function PickupMonitorCard({
  cutoffTime,
  students = [],
  logTo,
  settingsTo,
  isLoading = false,
  isError = false,
}) {
  const { t } = useTranslation()
  const waiting = students.length

  return (
    <div className="flex flex-1 flex-col rounded-[20px] border border-border bg-bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-sm font-bold text-text-primary">
            {t('dashboard.pickupMonitorTitle')}
          </h3>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            {cutoffTime
              ? t('dashboard.pickupMonitorSubtitle', { time: cutoffTime, count: waiting })
              : t('dashboard.pickupMonitorCountOnly', { count: waiting })}
          </p>
        </div>
        {settingsTo && (
          <Link
            to={settingsTo}
            className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-text-secondary no-underline hover:text-text-primary"
            title={t('navMenu.dismissalCutoff')}
          >
            <Settings2 size={12} />
            {t('dashboard.pickupMonitorSettings')}
          </Link>
        )}
      </div>

      <div className="mt-3 flex-1">
        {isLoading && <p className="text-[11px] text-text-secondary">{t('common.loading')}</p>}

        {/* Query gagal HARUS dibedakan dari "tidak ada yang menunggu": daftar kosong
            karena error akan terbaca sebagai "semua sudah dijemput" — false
            all-clear di modul keselamatan anak. */}
        {!isLoading && isError && (
          <p className="flex items-start gap-1.5 text-[11px] font-semibold text-danger-fg">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            {t('dashboard.pickupMonitorError')}
          </p>
        )}

        {!isLoading && !isError && waiting === 0 && (
          <p className="flex items-center gap-1.5 text-[11px] text-text-secondary">
            <CarFront size={13} className="shrink-0" />
            {t('dashboard.pickupMonitorAllClear')}
          </p>
        )}

        {!isLoading && !isError && waiting > 0 && (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {students.slice(0, 4).map((s) => (
                <li
                  key={s.id}
                  className="rounded-md bg-bg-page px-2 py-1 text-[11px] text-text-primary"
                >
                  {s.name}
                  {s.classroom?.name ? (
                    <span className="text-text-secondary"> · {s.classroom.name}</span>
                  ) : null}
                </li>
              ))}
              {waiting > 4 && (
                <li className="rounded-md bg-bg-page px-2 py-1 text-[11px] text-text-secondary">
                  +{waiting - 4}
                </li>
              )}
            </ul>
            <p className="mt-2 text-[11px] text-text-secondary">
              {t('dashboard.pickupMonitorWaiting')}
            </p>
          </>
        )}
      </div>

      {logTo && (
        <Link
          to={logTo}
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-[10px] bg-[#5b61f6] px-3.5 py-2 text-xs font-semibold text-white no-underline transition-opacity hover:opacity-90"
        >
          {t('dashboard.pickupMonitorCta')}
        </Link>
      )}
    </div>
  )
}
