import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api'
import { formatDate } from '../../lib/format'

const EMPTY_FORM = { title: '', body: '', target_role: '', expires_at: '' }

export default function AdminAnnouncements() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'announcements', page],
    queryFn: () => apiGet('/api/admin/announcements', { page }),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? apiPut(`/api/admin/announcements/${editing.id}`, form) : apiPost('/api/admin/announcements', form),
    onSuccess: () => {
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/admin/announcements/${deleting.id}`),
    onSuccess: () => {
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({
      title: row.title,
      body: row.body,
      target_role: row.target_role ?? '',
      expires_at: row.expires_at ? row.expires_at.slice(0, 10) : '',
    })
    setEditing(row)
    setShowForm(true)
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('announcements.title')}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('announcements.add')}
        </button>
      </div>

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
          { key: 'title', label: t('announcements.announcementTitle') },
          {
            key: 'target_role',
            label: t('announcements.targetRole'),
            render: (row) => (row.target_role ? t(`status.${row.target_role}`, row.target_role) : t('announcements.targetAll')),
          },
          { key: 'creator', label: t('announcements.createdBy'), render: (row) => row.creator?.name ?? '-' },
          { key: 'created_at', label: t('announcements.createdAt'), render: (row) => formatDate(row.created_at) },
          {
            key: 'expires_at',
            label: t('announcements.expiresAt'),
            render: (row) =>
              row.expires_at ? (
                <StatusBadge
                  code={row.is_expired ? 'expired' : 'active'}
                  label={row.is_expired ? t('status.expired') : formatDate(row.expires_at)}
                />
              ) : (
                <span className="text-text-secondary">{t('announcements.noExpiry')}</span>
              ),
          },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
                >
                  <Pencil size={13} />
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(row)}
                  className="rounded-lg border border-border p-1.5 text-danger-500 hover:bg-danger-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t('announcements.edit') : t('announcements.add')}
        footer={
          <button
            type="button"
            disabled={!form.title || !form.body || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-50"
          >
            {saveMutation.isPending ? t('common.processing') : t('common.save')}
          </button>
        }
      >
        <FormField
          label={t('announcements.announcementTitle')}
          htmlFor="title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <FormField
          as="textarea"
          label={t('announcements.body')}
          htmlFor="body"
          required
          rows={4}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <FormField
          as="select"
          label={t('announcements.targetRole')}
          htmlFor="target_role"
          value={form.target_role}
          onChange={(e) => setForm({ ...form, target_role: e.target.value })}
        >
          <option value="">{t('announcements.targetAll')}</option>
          <option value="guru">{t('status.guru')}</option>
          <option value="staff">{t('status.staff')}</option>
          <option value="orang_tua">{t('status.orang_tua')}</option>
        </FormField>
        <div>
          <FormField
            label={t('announcements.expiresAt')}
            htmlFor="expires_at"
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
          <p className="mt-1 text-xs text-text-secondary">{t('announcements.expiresAtHint')}</p>
        </div>
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t('announcements.deleteConfirmTitle')}
        description={t('announcements.deleteConfirmDescription')}
        footer={
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:opacity-60"
          >
            {deleteMutation.isPending ? t('common.processing') : t('common.delete')}
          </button>
        }
      />
    </DashboardLayout>
  )
}

