import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import FormField from '../../components/ui/FormField'
import { apiGet, apiPut } from '../../lib/api'

export default function AdminDismissalSettings() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    cutoff_time: '15:00',
    staff_check_in_deadline: '07:30',
    attendance_edit_tolerance_days: 1,
    pickup_qr_validity_days: '',
    invoice_due_date_days: 10,
  })
  const [success, setSuccess] = useState(false)

  const { data } = useQuery({
    queryKey: ['admin', 'dismissal-setting'],
    queryFn: () => apiGet('/api/admin/settings/dismissal-cutoff'),
  })

  useEffect(() => {
    if (data?.setting) {
      setForm({
        cutoff_time: data.setting.cutoff_time?.slice(0, 5) ?? '15:00',
        staff_check_in_deadline: data.setting.staff_check_in_deadline?.slice(0, 5) ?? '07:30',
        attendance_edit_tolerance_days: data.setting.attendance_edit_tolerance_days ?? 1,
        pickup_qr_validity_days: data.setting.pickup_qr_validity_days ?? '',
        invoice_due_date_days: data.setting.invoice_due_date_days ?? 10,
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: () => apiPut('/api/admin/settings/dismissal-cutoff', form),
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['admin', 'dismissal-setting'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('dismissal.title')} showSearch={false}>
      <div className="max-w-md space-y-5 rounded-2xl border border-border bg-bg-surface p-6">
        {success && (
          <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">{t('dismissal.saveSuccess')}</p>
        )}

        <div>
          <FormField
            label={t('dismissal.cutoffTime')}
            htmlFor="cutoff_time"
            type="time"
            value={form.cutoff_time}
            onChange={(e) => setForm({ ...form, cutoff_time: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-text-secondary">{t('dismissal.cutoffDescription')}</p>
        </div>

        <div>
          <FormField
            label={t('dismissal.staffCheckInDeadline')}
            htmlFor="staff_check_in_deadline"
            type="time"
            value={form.staff_check_in_deadline}
            onChange={(e) => setForm({ ...form, staff_check_in_deadline: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-text-secondary">{t('dismissal.staffCheckInDeadlineDescription')}</p>
        </div>

        <div>
          <FormField
            label={t('dismissal.toleranceDays')}
            htmlFor="attendance_edit_tolerance_days"
            type="number"
            min={0}
            max={30}
            value={form.attendance_edit_tolerance_days}
            onChange={(e) => setForm({ ...form, attendance_edit_tolerance_days: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-text-secondary">{t('dismissal.toleranceDescription')}</p>
        </div>

        <div>
          <FormField
            label={t('dismissal.pickupQrValidityDays')}
            htmlFor="pickup_qr_validity_days"
            type="number"
            min={1}
            max={365}
            placeholder={t('dismissal.pickupQrValidityPlaceholder')}
            value={form.pickup_qr_validity_days}
            onChange={(e) => setForm({ ...form, pickup_qr_validity_days: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-text-secondary">{t('dismissal.pickupQrValidityDescription')}</p>
        </div>

        <div>
          <FormField
            label={t('dismissal.invoiceDueDateDays')}
            htmlFor="invoice_due_date_days"
            type="number"
            min={1}
            max={60}
            value={form.invoice_due_date_days}
            onChange={(e) => setForm({ ...form, invoice_due_date_days: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-text-secondary">{t('dismissal.invoiceDueDateDescription')}</p>
        </div>

        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="rounded-xl bg-primary-300 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
        >
          {saveMutation.isPending ? t('common.processing') : t('common.save')}
        </button>
      </div>
    </DashboardLayout>
  )
}
