import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarCheck, ChevronLeft, ChevronRight, CircleCheck, Stethoscope } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import StatCard from '../../components/dashboard/StatCard'
import ExportButton from '../../components/ui/ExportButton'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet } from '../../lib/api'
import { statusTone } from '../../lib/statusLabels'
import { downloadCsv } from '../../lib/exportCsv'
import { formatDate, todayInputValue, weekdaysShort } from '../../lib/format'

const TONE_DOT = {
  success: 'bg-success-500',
  accent: 'bg-accent-500',
  primary: 'bg-primary-100',
  danger: 'bg-danger-500',
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export default function OrtuAttendance() {
  const { t } = useTranslation()
  const { activeChild, children } = useOrtuChildren()
  const [month, setMonth] = useState(todayInputValue().slice(0, 7))

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'attendance', activeChild?.id, month],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/attendance`, { month }),
    enabled: !!activeChild,
  })
  const attendances = data?.attendances ?? []
  const byDate = Object.fromEntries(attendances.map((a) => [a.date.slice(0, 10), a]))
  const counts = {
    hadir: attendances.filter((a) => a.status === 'hadir').length,
    izinSakit: attendances.filter((a) => a.status === 'izin' || a.status === 'sakit').length,
    alpa: attendances.filter((a) => a.status === 'alpa').length,
  }
  const rate = attendances.length ? Math.round((counts.hadir / attendances.length) * 100) : null

  function exportSummary() {
    downloadCsv(
      `absensi-${activeChild.name}-${month}.csv`,
      [t('common.date'), t('common.status'), t('common.note')],
      attendances.map((a) => [formatDate(a.date), t(`status.${a.status}`), a.note || '-'])
    )
  }

  const [year, monthNum] = month.split('-').map(Number)
  const total = daysInMonth(year, monthNum)
  const firstDow = new Date(year, monthNum - 1, 1).getDay()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]

  function shiftMonth(delta) {
    const d = new Date(year, monthNum - 1 + delta, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  if (!activeChild) return null

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.attendanceHistoryTitle')} showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="flex justify-end">
        <ExportButton onClick={exportSummary} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={CalendarCheck} label={t('students.attendanceRate')} value={rate === null ? '-' : `${rate}%`} tone="primary" />
        <StatCard icon={CircleCheck} label={t('status.hadir')} value={counts.hadir} tone="success" />
        <StatCard icon={Stethoscope} label={`${t('status.izin')}/${t('status.sakit')}`} value={counts.izinSakit} tone="accent" />
        <StatCard icon={AlertTriangle} label={t('status.alpa')} value={counts.alpa} tone="danger" />
      </div>

      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => shiftMonth(-1)} className="rounded-lg p-1.5 hover:bg-bg-page">
            <ChevronLeft size={18} />
          </button>
          <p className="font-heading text-sm font-bold text-text-primary">{month}</p>
          <button type="button" onClick={() => shiftMonth(1)} className="rounded-lg p-1.5 hover:bg-bg-page">
            <ChevronRight size={18} />
          </button>
        </div>

        {isLoading ? (
          <p className="py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-text-secondary">
              {weekdaysShort().map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-7 gap-1.5">
              {cells.map((day, idx) => {
                if (!day) return <div key={`e${idx}`} />
                const dateStr = `${month}-${String(day).padStart(2, '0')}`
                const record = byDate[dateStr]
                return (
                  <div
                    key={dateStr}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-border text-xs text-text-primary"
                    title={record ? t(`status.${record.status}`) : undefined}
                  >
                    <span>{day}</span>
                    {record && <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[statusTone(record.status)]}`} />}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-secondary">
              {['hadir', 'izin', 'sakit', 'alpa'].map((code) => (
                <span key={code} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${TONE_DOT[statusTone(code)]}`} />
                  {t(`status.${code}`)}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
