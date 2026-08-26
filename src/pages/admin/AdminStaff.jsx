import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPost, apiPut } from '../../lib/api'
import { formatDate } from '../../lib/format'

const EMPTY_FORM = { name: '', email: '', type: 'guru', position: '', phone: '', joined_at: '' }

export default function AdminStaff() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [created, setCreated] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'staff', type, page],
    queryFn: () => apiGet('/api/admin/staff', { type: type || undefined, page }),
  })

  const createMutation = useMutation({
    mutationFn: () => apiPost('/api/admin/staff', form),
    onSuccess: (data) => {
      setShowForm(false)
      setCreated({ ...data, email: form.email })
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      apiPut(`/api/admin/staff/${editing.id}`, {
        name: form.name,
        position: form.position,
        phone: form.phone,
        leave_quota: form.leave_quota || null,
      }),
    onSuccess: () => {
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
    },
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({ name: row.name, position: row.position ?? '', phone: row.phone ?? '', leave_quota: row.leave_quota ?? '' })
    setEditing(row)
    setShowForm(true)
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('staff.title')}>
      <FilterBar
        filters={[
          {
            key: 'type',
            type: 'select',
            label: t('staff.type'),
            value: type,
            onChange: setType,
            options: [
              { value: '', label: t('staff.filterType') },
              { value: 'guru', label: t('status.guru') },
              { value: 'non_guru', label: t('status.non_guru') },
            ],
          },
        ]}
        trailing={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
          >
            <Plus size={16} />
            {t('staff.addStaff')}
          </button>
        }
      />

      <DataTable
        loading={isLoading}
        rows={data?.data ?? []}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        columns={[
          { key: 'name', label: t('staff.name') },
          { key: 'email', label: t('staff.email'), render: (row) => row.user?.email ?? '-' },
          { key: 'type', label: t('staff.type'), render: (row) => <StatusBadge code={row.type} /> },
          { key: 'position', label: t('staff.position'), render: (row) => row.position || '-' },
          { key: 'joined_at', label: t('staff.joinedAt'), render: (row) => (row.joined_at ? formatDate(row.joined_at) : '-') },
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
        title={editing ? t('staff.editStaff') : t('staff.addStaff')}
        footer={
          <button
            type="button"
            disabled={createMutation.isPending || updateMutation.isPending}
            onClick={() => (editing ? updateMutation.mutate() : createMutation.mutate())}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField label={t('staff.name')} htmlFor="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {!editing && (
          <>
            <FormField
              label={t('staff.email')}
              htmlFor="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <FormField
              as="select"
              label={t('staff.type')}
              htmlFor="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="guru">{t('status.guru')}</option>
              <option value="non_guru">{t('status.non_guru')}</option>
            </FormField>
            <FormField
              label={t('staff.joinedAt')}
              htmlFor="joined_at"
              type="date"
              value={form.joined_at}
              onChange={(e) => setForm({ ...form, joined_at: e.target.value })}
            />
          </>
        )}
        <FormField label={t('staff.position')} htmlFor="position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        <FormField label={t('staff.phone')} htmlFor="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {editing && (
          <FormField
            label={t('staff.leaveQuota')}
            htmlFor="leave_quota"
            type="number"
            value={form.leave_quota}
            onChange={(e) => setForm({ ...form, leave_quota: e.target.value })}
          />
        )}
      </Modal>

      <Modal
        open={!!created}
        onClose={() => setCreated(null)}
        title={t('staff.createdTitle')}
        footer={
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400"
          >
            {t('staff.close')}
          </button>
        }
      >
        <p className="text-sm text-text-secondary">{t('staff.temporaryPasswordNote')}</p>
        <div className="space-y-1 rounded-xl bg-bg-page p-4 text-sm">
          <p>
            <span className="text-text-secondary">{t('staff.email')}: </span>
            <span className="font-mono font-semibold text-text-primary">{created?.email}</span>
          </p>
          <p>
            <span className="text-text-secondary">Password: </span>
            <span className="font-mono font-semibold text-text-primary">{created?.temporary_password}</span>
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
