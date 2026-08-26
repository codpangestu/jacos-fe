import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPost, apiDelete } from '../../lib/api'
import { formatDate } from '../../lib/format'

const EMPTY_FORM = { label: '', start_date: '', end_date: '', is_active: false }
const EMPTY_HOLIDAY = { date: '', label: '' }

export default function AdminAcademicYears() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [holidaysFor, setHolidaysFor] = useState(null)
  const [holidayForm, setHolidayForm] = useState(EMPTY_HOLIDAY)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'academic-years'],
    queryFn: () => apiGet('/api/admin/academic-years'),
  })
  const years = data?.academic_years ?? []

  const createMutation = useMutation({
    mutationFn: () => apiPost('/api/admin/academic-years', form),
    onSuccess: () => {
      setShowForm(false)
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin', 'academic-years'] })
    },
  })

  const { data: holidaysData } = useQuery({
    queryKey: ['admin', 'academic-years', holidaysFor?.id, 'holidays'],
    queryFn: () => apiGet(`/api/admin/academic-years/${holidaysFor.id}/holidays`),
    enabled: !!holidaysFor,
  })
  const holidays = holidaysData?.holidays ?? []

  const addHolidayMutation = useMutation({
    mutationFn: () => apiPost(`/api/admin/academic-years/${holidaysFor.id}/holidays`, holidayForm),
    onSuccess: () => {
      setHolidayForm(EMPTY_HOLIDAY)
      queryClient.invalidateQueries({ queryKey: ['admin', 'academic-years', holidaysFor.id, 'holidays'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'academic-years'] })
    },
  })

  const removeHolidayMutation = useMutation({
    mutationFn: (id) => apiDelete(`/api/admin/holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'academic-years', holidaysFor.id, 'holidays'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'academic-years'] })
    },
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('academicYears.title')} showSearch={false}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('academicYears.add')}
        </button>
      </div>

      <DataTable
        loading={isLoading}
        rows={years}
        columns={[
          {
            key: 'label',
            label: t('academicYears.label'),
            render: (row) => (
              <span className="flex items-center gap-2">
                {row.label}
                {row.is_active && (
                  <span className="rounded-full bg-success-500/12 px-2 py-0.5 text-xs font-semibold text-success-500">
                    {t('academicYears.active')}
                  </span>
                )}
              </span>
            ),
          },
          { key: 'start_date', label: t('academicYears.startDate'), render: (row) => formatDate(row.start_date) },
          { key: 'end_date', label: t('academicYears.endDate'), render: (row) => formatDate(row.end_date) },
          { key: 'holidays', label: t('academicYears.manageHolidays'), render: (row) => t('academicYears.holidaysCount', { count: row.holidays_count }) },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => setHolidaysFor(row)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('academicYears.manageHolidays')}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t('academicYears.add')}
        footer={
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField
          label={t('academicYears.label')}
          htmlFor="label"
          required
          placeholder={t('academicYears.labelPlaceholder')}
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <FormField
          label={t('academicYears.startDate')}
          htmlFor="start_date"
          type="date"
          required
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        />
        <FormField
          label={t('academicYears.endDate')}
          htmlFor="end_date"
          type="date"
          required
          value={form.end_date}
          onChange={(e) => setForm({ ...form, end_date: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          {t('academicYears.setActive')}
        </label>
      </Modal>

      <Modal
        open={!!holidaysFor}
        onClose={() => setHolidaysFor(null)}
        title={t('academicYears.holidaysFor', { label: holidaysFor?.label })}
        size="lg"
      >
        <div className="flex flex-wrap items-end gap-2">
          <FormField
            label={t('academicYears.holidayDate')}
            htmlFor="holiday_date"
            type="date"
            value={holidayForm.date}
            onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
          />
          <FormField
            label={t('academicYears.holidayLabel')}
            htmlFor="holiday_label"
            placeholder={t('academicYears.holidayLabelPlaceholder')}
            value={holidayForm.label}
            onChange={(e) => setHolidayForm({ ...holidayForm, label: e.target.value })}
            className="flex-1"
          />
          <button
            type="button"
            disabled={!holidayForm.date || !holidayForm.label || addHolidayMutation.isPending}
            onClick={() => addHolidayMutation.mutate()}
            className="rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-50"
          >
            {t('academicYears.addHoliday')}
          </button>
        </div>

        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-bg-page">
              <span>
                {formatDate(h.date)} — {h.label}
              </span>
              <button type="button" onClick={() => removeHolidayMutation.mutate(h.id)} className="text-danger-500 hover:opacity-70">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </DashboardLayout>
  )
}
