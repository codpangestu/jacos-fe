import { useTranslation } from 'react-i18next'

const STATUSES = ['hadir', 'izin', 'sakit', 'alpa']

const ACTIVE_CLASS = {
  hadir: 'bg-success-500 text-white',
  izin: 'bg-accent-500 text-white',
  sakit: 'bg-primary-300 text-white',
  alpa: 'bg-danger-500 text-white',
}

/** Toggle group 4 status kehadiran, dipakai layar Input & Riwayat Absensi. */
export default function AttendanceStatusPicker({ value, onChange, disabled }) {
  const { t } = useTranslation()

  return (
    <div className="inline-flex gap-1 rounded-xl bg-bg-page p-1">
      {STATUSES.map((code) => (
        <button
          key={code}
          type="button"
          disabled={disabled}
          onClick={() => onChange(code)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            value === code ? ACTIVE_CLASS[code] : 'text-text-secondary hover:bg-bg-surface'
          }`}
        >
          {t(`status.${code}`)}
        </button>
      ))}
    </div>
  )
}
