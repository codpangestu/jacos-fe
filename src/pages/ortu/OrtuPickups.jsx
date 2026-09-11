import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Info, Plus, QrCode, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import ActiveChildBar from '../../components/ortu/ActiveChildBar'
import StatCard from '../../components/dashboard/StatCard'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiDelete, apiGet, apiPostForm, storageUrl } from '../../lib/api'
import { formatDate } from '../../lib/format'

const EMPTY_FORM = { name: '', relationship: '', photo: null }

export default function OrtuPickups() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { activeChild, children } = useOrtuChildren()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [viewingQr, setViewingQr] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'pickups', activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickups`),
    enabled: !!activeChild,
  })
  const pickups = data?.pickups ?? []
  const activeCount = pickups.filter((p) => p.status === 'active').length

  const createMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      body.append('name', form.name)
      body.append('relationship', form.relationship)
      if (form.photo) body.append('photo', form.photo)
      return apiPostForm(`/api/ortu/children/${activeChild.id}/pickups`, body)
    },
    onSuccess: () => {
      setShowForm(false)
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['ortu', 'pickups'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/ortu/pickups/${deleting.id}`),
    onSuccess: () => {
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: ['ortu', 'pickups'] })
    },
  })

  if (!activeChild) return null

  return (
    <ResponsiveShell pageTitle={t('ortu.pickupsTitle')} headerVariant="title" showSearch={false}>
      <ActiveChildBar child={activeChild} multiple={children.length > 1} />

      <div className="max-w-xs">
        <StatCard icon={ShieldCheck} label={t('ortu.pickupStatsActive')} value={activeCount} tone="success" />
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-primary-300/8 p-4 text-sm text-text-secondary">
        <Info size={16} className="mt-0.5 shrink-0 text-primary-300" />
        {t('ortu.pickupInfoBanner')}
      </div>

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
          {t('ortu.addPickup')}
        </button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
      ) : pickups.length === 0 ? (
        <p className="rounded-2xl border border-border bg-bg-surface p-10 text-center text-sm text-text-secondary">
          {t('common.noData')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pickups.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-bg-surface p-4">
              <div className="flex items-center gap-3">
                {p.photo_path ? (
                  <img src={storageUrl(p.photo_path)} alt={p.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
                    <UserRound size={22} />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{p.name}</p>
                  <p className="truncate text-xs text-text-secondary">{p.relationship}</p>
                </div>
                <StatusBadge code={p.status} />
              </div>
              {p.status === 'active' && p.valid_until && (
                <p className="mt-2 text-xs text-text-secondary">{t('ortu.validUntil', { date: formatDate(p.valid_until) })}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewingQr(p)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
                >
                  <QrCode size={14} />
                  {t('ortu.showQr')}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(p)}
                  className="rounded-lg border border-border p-1.5 text-danger-500 hover:bg-danger-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t('ortu.addPickup')}
        footer={
          <button
            type="button"
            disabled={!form.name || !form.relationship || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-50"
          >
            {createMutation.isPending ? t('common.processing') : t('common.save')}
          </button>
        }
      >
        <FormField
          label={t('ortu.pickupName')}
          htmlFor="pickup_name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <FormField
          label={t('ortu.pickupRelationship')}
          htmlFor="pickup_relationship"
          required
          placeholder={t('parents.relationshipPlaceholder')}
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
        />
        <FormField
          label={t('ortu.pickupPhoto')}
          htmlFor="pickup_photo"
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, photo: e.target.files[0] ?? null })}
        />
      </Modal>

      <Modal open={!!viewingQr} onClose={() => setViewingQr(null)} title={t('ortu.qrTitle', { name: viewingQr?.name })}>
        {viewingQr?.status === 'active' ? (
          <>
            <p className="text-sm text-text-secondary">{t('ortu.qrDescription')}</p>
            <div className="flex justify-center rounded-xl bg-white p-6">
              <QRCodeSVG value={viewingQr.qr_token} size={220} />
            </div>
            {viewingQr.valid_until && (
              <p className="text-center text-xs text-text-secondary">{t('ortu.validUntil', { date: formatDate(viewingQr.valid_until) })}</p>
            )}
          </>
        ) : (
          <p className="rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-text-secondary">
            {viewingQr?.status === 'pending_approval'
              ? t('ortu.qrNotReady')
              : t('ortu.qrNotActive', { status: t(`status.${viewingQr?.status}`) })}
          </p>
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t('ortu.deletePickupConfirmTitle')}
        description={t('ortu.deletePickupConfirmDescription')}
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
    </ResponsiveShell>
  )
}
