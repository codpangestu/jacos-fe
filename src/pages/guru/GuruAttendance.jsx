import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarOff } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import AttendanceStatusPicker from '../../components/AttendanceStatusPicker'
import FormField from '../../components/ui/FormField'
import { apiGet, apiPost } from '../../lib/api'
import { todayInputValue } from '../../lib/format'

export default function GuruAttendance() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayInputValue())
  const [records, setRecords] = useState({})
  const [success, setSuccess] = useState(false)

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
      initial[s.student_id] = { status: s.status ?? '', note: s.note ?? '' }
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
      queryClient.invalidateQueries({ queryKey: ['guru', 'attendance'] })
    },
  })

  function setStatus(studentId, status) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }))
  }

  function setNote(studentId, note) {
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }))
  }

  const isHoliday = data?.is_holiday
  const students = data?.students ?? []

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.guru} pageTitle={t('attendance.inputTitle')} showSearch={false}>
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-bg-surface p-4">
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
          {students.map((s) => {
            const record = records[s.student_id] ?? { status: '', note: '' }
            const showNote = record.status === 'izin' || record.status === 'sakit'
            return (
              <div key={s.student_id} className="rounded-xl border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-text-primary">{s.name}</p>
                  <AttendanceStatusPicker value={record.status} onChange={(status) => setStatus(s.student_id, status)} />
                </div>
                {showNote && (
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

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="rounded-xl bg-primary-300 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-60"
          >
            {saveMutation.isPending ? t('common.processing') : t('attendance.saveAttendance')}
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
