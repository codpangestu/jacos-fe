import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Paperclip, Send, Trash2 } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { apiDelete, apiGet, apiPatch, apiPost, storageUrl } from '../../lib/api'
import { formatDate, formatDateTime } from '../../lib/format'

// Harus sama dengan Complaint::SLA_DAYS di backend — dipakai hanya untuk
// menampilkan hint di form, bukan sebagai sumber kebenaran perhitungan due_at.
const SLA_DAYS = { high: 1, normal: 3, low: 7 }

const STATUS_ACTIONS = [
  { status: 'in_progress', key: 'complaints.markInProgress', className: 'bg-primary-300 text-white hover:bg-primary-400' },
  { status: 'resolved', key: 'complaints.markResolved', className: 'bg-success-500 text-white hover:bg-success-500/90' },
  { status: 'rejected', key: 'complaints.markRejected', className: 'bg-danger-500 text-white hover:bg-danger-500/90' },
  { status: 'open', key: 'complaints.reopen', className: 'bg-bg-page text-text-primary border border-border hover:bg-border/40' },
]

export default function AdminComplaintDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [reply, setReply] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Draf catatan & penanda error disimpan bersama ID tiketnya, lalu diturunkan
  // saat render. Efeknya sama dengan useEffect penyinkron, tapi tanpa setState
  // di dalam effect (ditandai lint react/set-state-in-effect) dan tanpa risiko
  // draf tiket lama tertinggal saat admin pindah ke tiket lain.
  const [noteDraft, setNoteDraft] = useState({ id: null, value: '' })
  const [noteErrorId, setNoteErrorId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'complaint', id],
    queryFn: () => apiGet(`/api/complaints/${id}`),
  })

  const { data: assigneeData } = useQuery({
    queryKey: ['admin', 'complaint-assignees'],
    queryFn: () => apiGet('/api/admin/complaints/assignees'),
    staleTime: 5 * 60 * 1000,
  })

  const complaint = data?.complaint

  // Catatan penyelesaian yang sudah tersimpan ikut tampil di textarea, supaya
  // admin tidak perlu mengetik ulang saat mengubah status tiket yang sama.
  const note = noteDraft.id === complaint?.id ? noteDraft.value : (complaint?.resolution_note ?? '')
  const noteError = noteErrorId === complaint?.id && !!complaint?.id
  const setNote = (value) => setNoteDraft({ id: complaint?.id ?? null, value })
  const setNoteError = (value) => setNoteErrorId(value && complaint?.id ? complaint.id : null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'complaint', id] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] })
  }

  const triageMutation = useMutation({
    mutationFn: (payload) => apiPatch(`/api/admin/complaints/${id}`, payload),
    onSuccess: () => {
      setNoteError(false)
      invalidate()
    },
  })

  const replyMutation = useMutation({
    mutationFn: (body) => apiPost(`/api/complaints/${id}/replies`, { body }),
    onSuccess: () => {
      setReply('')
      invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/admin/complaints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] })
      navigate('/admin/complaints')
    },
  })

  function submitStatus(status) {
    // Backend menolak menutup tiket tanpa catatan; dicek di sini juga supaya
    // admin dapat umpan balik tanpa menunggu request.
    if (status === 'resolved' && !note.trim()) {
      setNoteError(true)
      return
    }
    triageMutation.mutate({ status, resolution_note: note.trim() || null })
  }

  if (isLoading) {
    return (
      <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('complaints.detailTitle')}>
        <p className="text-sm text-text-secondary">{t('common.loading')}</p>
      </DashboardLayout>
    )
  }

  if (!complaint) {
    return (
      <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('complaints.detailTitle')}>
        <p className="text-sm text-text-secondary">{t('common.noData')}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('complaints.detailTitle')}>
      <Link
        to="/admin/complaints"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary no-underline hover:text-text-primary"
      >
        <ArrowLeft size={15} />
        {t('complaints.backToList')}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm font-semibold text-text-secondary">
          {complaint.ticket_no ?? `#${complaint.id}`}
        </span>
        <StatusBadge code={complaint.status} />
        {complaint.is_overdue && (
          <span className="flex items-center gap-1.5 rounded-lg bg-danger-500/12 px-2 py-1 text-xs font-semibold text-danger-fg">
            <AlertTriangle size={13} />
            {t('complaints.overdue')}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Isi pengaduan + percakapan ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-5">
            <h2 className="text-lg font-bold text-text-primary">{complaint.subject}</h2>
            <p className="whitespace-pre-wrap text-sm text-text-primary">{complaint.body}</p>
            {complaint.attachment_path && (
              <a
                href={storageUrl(complaint.attachment_path)}
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary-fg no-underline hover:underline"
              >
                <Paperclip size={14} />
                {t('complaints.attachment')}
              </a>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-surface p-5">
            <h3 className="text-sm font-bold text-text-primary">{t('complaints.thread')}</h3>

            {(complaint.replies ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary">{t('complaints.noReplies')}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {complaint.replies.map((r) => {
                  const fromAdmin = r.user?.role === 'admin'
                  return (
                    <li
                      key={r.id}
                      className={`flex flex-col gap-1 rounded-xl p-3 ${
                        fromAdmin ? 'bg-primary-300/10' : 'bg-bg-page'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary">{r.user?.name ?? '-'}</span>
                        <span className="text-[11px] text-text-secondary">{formatDateTime(r.created_at)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-text-primary">{r.body}</p>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="flex flex-col gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={t('complaints.replyPlaceholder')}
                className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
              />
              <button
                type="button"
                disabled={!reply.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate(reply.trim())}
                className="flex w-fit cursor-pointer items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                {replyMutation.isPending ? t('common.processing') : t('complaints.sendReply')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Tindak lanjut ── */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-surface p-5">
            <h3 className="text-sm font-bold text-text-primary">{t('complaints.triage')}</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">{t('complaints.priority')}</label>
              <select
                value={complaint.priority}
                onChange={(e) => triageMutation.mutate({ priority: e.target.value })}
                className="rounded-xl border border-border bg-bg-page px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
              >
                {Object.entries(SLA_DAYS).map(([value, days]) => (
                  <option key={value} value={value}>
                    {t(`complaints.priorities.${value}`)} — {t('complaints.slaHint', { days })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">{t('complaints.assignedTo')}</label>
              <select
                value={complaint.assigned_to?.id ?? complaint.assigned_to ?? ''}
                onChange={(e) => triageMutation.mutate({ assigned_to: e.target.value ? Number(e.target.value) : null })}
                className="rounded-xl border border-border bg-bg-page px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
              >
                <option value="">{t('complaints.unassigned')}</option>
                {(assigneeData?.assignees ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({t(`status.${u.role}`, u.role)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">{t('complaints.resolutionNote')}</label>
              <textarea
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  setNoteError(false)
                }}
                rows={3}
                className={`w-full rounded-xl border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary focus:outline-none ${
                  noteError ? 'border-danger-500 focus:border-danger-500' : 'border-border focus:border-primary-300'
                }`}
              />
              {noteError && <p className="text-xs text-danger-fg">{t('complaints.resolutionRequired')}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.map((action) => (
                <button
                  key={action.status}
                  type="button"
                  disabled={triageMutation.isPending || complaint.status === action.status}
                  onClick={() => submitStatus(action.status)}
                  className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${action.className}`}
                >
                  {t(action.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-5">
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex flex-col">
                <dt className="text-xs text-text-secondary">{t('complaints.submittedBy')}</dt>
                <dd className="text-text-primary">{complaint.submitted_by?.name ?? '-'}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-text-secondary">{t('complaints.student')}</dt>
                <dd className="text-text-primary">{complaint.student?.name ?? '-'}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-text-secondary">{t('complaints.category')}</dt>
                <dd className="text-text-primary">
                  {t(`complaints.categories.${complaint.category}`, complaint.category)}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-text-secondary">{t('complaints.createdAt')}</dt>
                <dd className="text-text-primary">{formatDateTime(complaint.created_at)}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-text-secondary">{t('complaints.dueAt')}</dt>
                <dd className={complaint.is_overdue ? 'font-semibold text-danger-fg' : 'text-text-primary'}>
                  {complaint.due_at ? formatDate(complaint.due_at) : '-'}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex w-fit cursor-pointer items-center gap-1.5 rounded-xl bg-danger-500/12 px-3 py-2 text-xs font-semibold text-danger-fg transition-colors hover:bg-danger-500/20"
            >
              <Trash2 size={13} />
              {t('complaints.deleteComplaint')}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('complaints.deleteComplaint')}
        description={complaint.ticket_no ?? `#${complaint.id}`}
        footer={
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="cursor-pointer rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:opacity-50"
          >
            {deleteMutation.isPending ? t('common.processing') : t('common.delete')}
          </button>
        }
      >
        <p className="text-sm text-text-secondary">{t('complaints.deleteConfirm')}</p>
      </Modal>
    </DashboardLayout>
  )
}
