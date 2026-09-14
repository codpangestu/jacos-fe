import React from 'react';
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Plus, QrCode, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
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
  const { activeChild } = useOrtuChildren()
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
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div className="relative flex flex-col min-h-screen bg-primary-300 overflow-hidden">
        
        {/* --- HERO AREA (QR CODE) --- */}
        <div className="flex flex-col w-full pt-[env(safe-area-inset-top)] pb-10 px-4 relative">
          <div className="flex justify-between items-center w-full mt-4 mb-6 z-10">
            <button onClick={() => window.history.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-white">{t('ortu.pickupsTitle')}</h1>
            <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center w-full bg-bg-surface rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-10">
            <div className="flex justify-between items-center w-full mb-4">
              <div className="flex flex-col">
                <span className="text-xs text-text-secondary">Siswa</span>
                <span className="text-base font-bold text-text-primary">{activeChild.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-text-secondary">Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                  <span className="text-xs font-bold text-success-500">Siap Dijemput</span>
                </div>
              </div>
            </div>

            <div className="w-full h-px border-t border-dashed border-border mb-4" />

            <div className="flex items-center justify-center w-40 h-40 rounded-2xl bg-primary-300/10 mb-3 overflow-hidden p-2">
              {/* Show the QR of the first active pickup, or placeholder */}
              {pickups.filter(p => p.status === 'active')[0] ? (
                 <QRCodeSVG value={pickups.filter(p => p.status === 'active')[0].qr_token} size={140} />
              ) : (
                 <QrCode size={80} className="text-text-secondary opacity-50" />
              )}
            </div>
            <p className="text-[11px] text-text-secondary mb-4">Tunjukkan ke satpam gerbang</p>
            
            <div className="flex items-center gap-1.5 bg-bg-page px-3 py-1.5 rounded-xl">
              <RefreshCw size={12} className="text-text-secondary" />
              <span className="text-[11px] font-medium text-text-secondary">Pilih penjemput di bawah untuk QR lain</span>
            </div>
          </div>
        </div>

        {/* --- WHITE SHEET CONTENT --- */}
        <div className="flex-1 w-full bg-bg-surface rounded-t-[32px] pt-5 px-5 pb-32 flex flex-col gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-20">
          <div className="w-full flex justify-center mb-2">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full mb-3">
              <h3 className="text-base font-bold text-text-primary">{t('ortu.authorizedPickupsTitle')}</h3>
              <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }} className="text-[13px] font-medium text-primary-300">Tambah</button>
            </div>

            {isLoading ? (
               <p className="py-4 text-center text-sm text-text-secondary">{t('common.loading')}</p>
            ) : pickups.length === 0 ? (
               <p className="py-4 text-center text-sm text-text-secondary">{t('common.noData')}</p>
            ) : (
              <div className="flex flex-col w-full bg-bg-surface rounded-[24px] border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-3 gap-1">
                {pickups.map((p, index) => (
                  <React.Fragment key={p.id}>
                    <div onClick={() => setViewingQr(p)} className="flex justify-between items-center w-full p-2 rounded-2xl hover:bg-bg-page cursor-pointer">
                      <div className="flex items-center gap-3">
                        {p.photo_path ? (
                           <img src={storageUrl(p.photo_path)} alt={p.name} className="flex items-center justify-center w-10 h-10 rounded-full object-cover" />
                        ) : (
                           <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-300/10 text-base">
                             👤
                           </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary">{p.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-secondary">{p.relationship}</span>
                            <StatusBadge code={p.status} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={(e) => { e.stopPropagation(); setDeleting(p); }} className="p-2 text-danger-500 hover:bg-danger-500/10 rounded-full">
                           <Trash2 size={16} />
                         </button>
                         <ChevronRight size={16} className="text-text-secondary" />
                      </div>
                    </div>
                    {index < pickups.length - 1 && <div className="w-[calc(100%-24px)] h-px bg-border mx-auto" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
