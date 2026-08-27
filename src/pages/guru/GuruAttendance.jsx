import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarOff, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import AttendanceStatusPicker from '../../components/AttendanceStatusPicker'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPost } from '../../lib/api'
import { todayInputValue } from '../../lib/format'

export default function GuruAttendance() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayInputValue())
  const [records, setRecords] = useState({})
  const [success, setSuccess] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: classroomsData } = useQuery({
    queryKey: ['guru', 'classrooms'],
    queryFn: () => apiGet('/api/guru/classrooms'),
  })
  const classrooms = classroomsData?.classrooms ?? []
  const [selectedClassroomId, setSelectedClassroomId] = useState(null)
  const classroomId = selectedClassroomId ?? classrooms[0]?.id ?? null

  const { data, isLoading } = useQuery({
    queryKey: ['guru', 'attendance', classroomId, date],
    queryFn: () => apiGet(`/api/classrooms/${classroomId}/attendance`, { date }),
    enabled: !!classroomId,
  })

  useEffect(() => {
    if (!data?.students) return
    const initial = {}
    for (const s of data.students) {
      if (s.status) continue // sudah tersimpan — dikunci, koreksi lewat Riwayat Absensi
      initial[s.student_id] = { status: '', note: '' }
    }
    setRecords(initial)
    setSuccess(false)
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPost(`/api/classrooms/${classroomId}/attendance`, {
        date,
        records: Object.entries(records)
          .filter(([, r]) => r.status)
          .map(([student_id, r]) => ({ student_id: Number(student_id), status: r.status, note: r.note || null })),
      }),
    onSuccess: () => {
      setSuccess(true)
      setConfirmOpen(false)
      queryClient.invalidateQueries({ queryKey: ['guru', 'attendance'] })
    },
  })

  function setStatus(studentId, status) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }))
  }

  function setNote(studentId, note) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }))
  }

  function markAllPresent() {
    setRecords((prev) => {
      const next = { ...prev }
      for (const studentId of Object.keys(next)) {
        next[studentId] = { ...next[studentId], status: 'hadir' }
      }
      return next
    })
  }

  const isHoliday = data?.is_holiday
  const students = data?.students ?? []
  const locked = students.filter((s) => s.status)
  const unlocked = students.filter((s) => !s.status)
  const filled = Object.values(records).filter((r) => r.status)
  const flaggedCount = filled.filter((r) => r.status !== 'hadir').length

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.guru} pageTitle={t('attendance.inputTitle')} showSearch={false}>
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-bg-surface p-4">
        <div className="flex flex-wrap items-end gap-3">
          {classrooms.length > 1 && (
            <FormField
              as="select"
              label={t('attendance.classroom')}
              htmlFor="classroom"
              value={classroomId ?? ''}
              onChange={(e) => setSelectedClassroomId(Number(e.target.value))}
              className="w-48"
            >
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FormField>
          )}
          <FormField
            label={t('attendance.selectDate')}
            htmlFor="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </div>
        <Link
          to="/guru/attendance/history"
          className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-page"
        >
          <History size={16} />
          {t('attendance.historyTitle')}
        </Link>
      </div>

      {classrooms.length === 0 && !isLoading && (
        <p className="rounded-2xl border border-border bg-bg-surface p-8 text-center text-sm text-text-secondary">
          {t('attendance.noClassroom')}
        </p>
      )}

      {isHoliday && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-bg-surface p-10 text-center">
          <CalendarOff size={32} className="text-text-secondary" />
          <p className="font-semibold text-text-primary">{t('attendance.holidayTitle')}</p>
          <p className="text-sm text-text-secondary">{t('attendance.holidayDescription')}</p>
        </div>
      )}

      {!isHoliday && !isLoading && students.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-border bg-bg-surface p-4">
          {success && (
            <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
              {t('attendance.saveSuccess')}
            </p>
          )}

          {locked.length > 0 && unlocked.length === 0 && (
            <p className="rounded-lg bg-primary-300/10 px-3 py-2 text-sm text-text-secondary">
              {t('attendance.allSubmittedHint')}
            </p>
          )}

          {unlocked.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={markAllPresent}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('attendance.markAllPresent')}
              </button>
            </div>
          )}

          {students.map((s) => {
            const isLocked = !!s.status
            const record = isLocked ? { status: s.status, note: s.note } : records[s.student_id] ?? { status: '', note: '' }
            const showNote = record.status === 'izin' || record.status === 'sakit'
            return (
              <div key={s.student_id} className={`rounded-xl border border-border p-3 ${isLocked ? 'opacity-70' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{s.name}</p>
                  <AttendanceStatusPicker
                    value={record.status}
                    disabled={isLocked}
                    onChange={(status) => setStatus(s.student_id, status)}
                  />
                </div>
                {isLocked && (
                  <p className="mt-1 text-xs text-text-secondary">{t('attendance.alreadyRecorded')}</p>
                )}
                {!isLocked && showNote && (
                  <textarea
                    value={record.note}
                    onChange={(e) => setNote(s.student_id, e.target.value)}
                    placeholder={t('attendance.notePlaceholder')}
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-border bg-bg-page px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:outline-none"
                  />
                )}
              </div>
            )
          })}

          {unlocked.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={filled.length === 0}
              className="rounded-xl bg-primary-300 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('attendance.saveAttendance')}
            </button>
          )}
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('attendance.submitConfirmTitle')}
        description={t('attendance.submitConfirmBody', { count: filled.length, notified: flaggedCount })}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-xl border border-border px-5 py-2 text-sm font-semibold text-text-primary hover:bg-bg-page"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
            >
              {saveMutation.isPending ? t('common.processing') : t('attendance.submitAndNotify')}
            </button>
          </>
        }
      />
    </DashboardLayout>
  )
}
