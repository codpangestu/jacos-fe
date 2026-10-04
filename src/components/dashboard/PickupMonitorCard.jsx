import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Pencil } from 'lucide-react'

/**
 * "Monitoring Penjemputan Card" — frame Figma 418x145, r20, padding 16,
 * VERTICAL gap 10. Header 36px (judul + subjudul + link Edit), baris aksi
 * bawah 34px (deskripsi 2 baris + 2 tombol, gap 6).
 *
 * Tombol "Broadcast WA" ada di Figma dan tetap dirender supaya bentuknya plek,
 * tapi dalam keadaan disabled: backend belum punya integrasi WhatsApp sama
 * sekali, jadi tombol yang bisa ditekan tanpa mengirim apa pun akan menyesatkan.
 * Tombol "Buka Log Gerbang" (indigo #5B61F6) berfungsi ke /admin/pickup-logs.
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
    <div className="flex flex-col gap-[10px] rounded-[20px] border border-border bg-bg-surface p-4">
      {/* Header */}
      <div className="flex h-9 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-[3px]">
          <h3 className="truncate font-body text-[12.5px] font-bold leading-[15px] text-[#1e1b4b] dark:text-text-primary">
            {t('dashboard.pickupMonitorTitle')}
          </h3>
          <p className="truncate font-heading text-[9.5px] leading-[12px] text-[#94a1b2]">
            {cutoffTime
              ? t('dashboard.pickupMonitorSubtitle', { time: cutoffTime, count: waiting })
              : t('dashboard.pickupMonitorCountOnly', { count: waiting })}
          </p>
        </div>
        {settingsTo && (
          <Link
            to={settingsTo}
            title={t('navMenu.dismissalCutoff')}
            className="flex shrink-0 items-center gap-1 font-heading text-[10px] font-medium leading-[12px] text-[#94a1b2] no-underline hover:text-text-primary"
          >
            <Pencil size={11} />
            {t('common.edit')}
          </Link>
        )}
      </div>

      {/* Bottom action row */}
      <div className="flex flex-1 items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-[1px]">
          {isLoading ? (
            <p className="font-heading text-[9.5px] leading-[12px] text-[#94a1b2]">
              {t('common.loading')}
            </p>
          ) : isError ? (
            /* Gagal memuat HARUS dibedakan dari "tidak ada yang menunggu" — daftar
               kosong karena error akan terbaca sebagai "semua sudah dijemput". */
            <p className="flex items-start gap-1 font-heading text-[9.5px] font-bold leading-[12px] text-danger-fg">
              <AlertTriangle size={11} className="mt-px shrink-0" />
              {t('dashboard.pickupMonitorError')}
            </p>
          ) : waiting === 0 ? (
            <p className="font-heading text-[9.5px] leading-[12px] text-[#94a1b2]">
              {t('dashboard.pickupMonitorAllClear')}
            </p>
          ) : (
            <>
              <p className="font-heading text-[9.5px] leading-[12px] text-[#94a1b2]">
                {t('dashboard.pickupMonitorWaiting', { count: waiting })}
              </p>
              <p className="truncate font-heading text-[9.5px] font-semibold leading-[12px] text-text-primary">
                {students.slice(0, 3).map((s) => s.name).join(', ')}
                {waiting > 3 ? ` +${waiting - 3}` : ''}
              </p>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-[6px]">
          <button
            type="button"
            disabled
            title={t('dashboard.moduleUnavailable')}
            className="flex h-[25px] cursor-not-allowed items-center rounded-lg bg-bg-page px-2.5 font-heading text-[10px] font-bold leading-[13px] text-[#1e1b4b] opacity-60 dark:text-text-primary"
          >
            {t('dashboard.pickupMonitorBroadcast')}
          </button>
          {logTo && (
            <Link
              to={logTo}
              className="flex h-[25px] items-center rounded-lg bg-[#5b61f6] px-2.5 font-heading text-[10px] font-bold leading-[13px] text-white no-underline transition-opacity hover:opacity-90"
            >
              {t('dashboard.pickupMonitorCta')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
