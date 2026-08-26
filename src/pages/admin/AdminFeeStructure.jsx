import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPost, apiPut } from '../../lib/api'
import { formatCurrency } from '../../lib/format'

const EMPTY_FORM = { grade_level_id: '', label: '', monthly_amount: '' }

export default function AdminFeeStructure() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data: gradeLevelsData } = useQuery({
    queryKey: ['admin', 'grade-levels'],
    queryFn: () => apiGet('/api/admin/grade-levels'),
  })
  const gradeLevels = gradeLevelsData?.grade_levels ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'fee-structures'],
    queryFn: () => apiGet('/api/admin/fee-structures'),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? apiPut(`/api/admin/fee-structures/${editing.id}`, { monthly_amount: form.monthly_amount })
        : apiPost('/api/admin/fee-structures', form),
    onSuccess: () => {
      setShowForm(false)
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin', 'fee-structures'] })
    },
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({ grade_level_id: row.grade_level_id, label: row.label, monthly_amount: row.monthly_amount })
    setEditing(row)
    setShowForm(true)
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('finance.feeStructureTitle')} showSearch={false}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('finance.addFee')}
        </button>
      </div>

      <DataTable
        loading={isLoading}
        rows={data?.fee_structures ?? []}
        columns={[
          { key: 'grade', label: t('finance.gradeLevel'), render: (row) => row.grade_level?.name },
          { key: 'label', label: t('finance.label') },
          { key: 'amount', label: t('finance.monthlyAmount'), render: (row) => formatCurrency(row.monthly_amount) },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('common.edit')}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t('finance.addFee')}
        footer={
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField
          as="select"
          label={t('finance.gradeLevel')}
          htmlFor="grade_level_id"
          required
          disabled={!!editing}
          value={form.grade_level_id}
          onChange={(e) => setForm({ ...form, grade_level_id: e.target.value })}
        >
          <option value="">-</option>
          {gradeLevels.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </FormField>
        <FormField
          label={t('finance.label')}
          htmlFor="label"
          placeholder={t('finance.labelPlaceholder')}
          disabled={!!editing}
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        <FormField
          label={t('finance.monthlyAmount')}
          htmlFor="monthly_amount"
          type="number"
          required
          value={form.monthly_amount}
          onChange={(e) => setForm({ ...form, monthly_amount: e.target.value })}
        />
      </Modal>
    </DashboardLayout>
  )
}
