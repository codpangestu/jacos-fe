import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import FormField from '../../components/ui/FormField'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPost } from '../../lib/api'
import { todayInputValue } from '../../lib/format'

export default function AdminAttendanceSubmissionStatus() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayInputValue())
  const [reminded, setReminded] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'attendance', 'submission-status', date],
    queryFn: () => apiGet('/api/admin/attendance/submission-status', { date }),
  })
  const classrooms = data?.classrooms ?? []

  const remindMutation = useMutation({
    mutationFn: (classroomId) => apiPost(`/api/admin/classrooms/${classroomId}/attendance/remind`),
    onSuccess: (_data, classroomId) => {
      setReminded((prev) => ({ ...prev, [classroomId]: true }))
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', 'submission-status'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('attendance.submissionStatusTitle')} showSearch={false}>
      <p className="rounded-xl bg-primary-300/10 px-4 py-3 text-sm text-text-secondary">
        {t('attendance.submissionStatusHint')}
      </p>

      <FormField
        label={t('attendance.selectDate')}
        htmlFor="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-48"
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => {
            const canRemind = c.status === 'not_started' || c.status === 'partial'
            return (
              <div key={c.classroom_id} className="rounded-2xl border border-border bg-bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-sm font-bold text-text-primary">{c.classroom_name}</p>
                  <StatusBadge code={c.status} />
                </div>
                <p className="mt-1 text-xs text-text-secondary">{c.homeroom_teacher ?? '-'}</p>
                {c.status !== 'holiday' && c.status !== 'no_students' && (
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {t('attendance.markedOf', { marked: c.marked, total: c.total_students })}
                  </p>
                )}
                {canRemind && (
                  <button
                    type="button"
                    disabled={!c.homeroom_teacher_id || remindMutation.isPending}
                    title={!c.homeroom_teacher_id ? t('attendance.noHomeroomTeacher') : undefined}
                    onClick={() => remindMutation.mutate(c.classroom_id)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <BellRing size={14} />
                    {reminded[c.classroom_id] ? t('attendance.remindSuccess') : t('attendance.remindTeacher')}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
