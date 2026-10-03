import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ChevronRight, Paperclip, Send } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPost, storageUrl } from '../../lib/api'
import { formatDate, formatDateTime } from '../../lib/format'

export default function OrtuComplaintDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [reply, setReply] = useState('')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['ortu', 'complaint', id],
    queryFn: () => apiGet(`/api/complaints/${id}`),
  })

  const complaint = data?.complaint

  const replyMutation = useMutation({
    mutationFn: (body) => apiPost(`/api/complaints/${id}/replies`, { body }),
    onSuccess: () => {
      setReply('')
      queryClient.invalidateQueries({ queryKey: ['ortu', 'complaint', id] })
      queryClient.invalidateQueries({ queryKey: ['ortu', 'complaints'] })
    },
  })

  return (
    <ResponsiveShell pageTitle={t('complaints.detailTitle')} headerVariant="title" showSearch={false}>
      <nav className="flex items-center gap-1.5 text-sm">
        {/* Token `*-fg`, bukan shade 500: primary-300 di atas bg-page hanya
            ~3.1:1 di light (gagal AA). Lihat aturan kontras di frontend/context.md. */}
        <Link to="/ortu/complaints" className="font-semibold text-primary-fg hover:underline">
          {t('complaints.myTitle')}
        </Link>
        <ChevronRight size={14} className="text-text-secondary" />
        <span className="truncate text-text-secondary">{complaint?.ticket_no ?? `#${id}`}</span>
      </nav>

      {isLoading && (
        <p className="py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
      )}

      {!isLoading && (isError || !complaint) && (
        <p className="rounded-2xl border border-border bg-bg-surface px-3 py-6 text-center text-sm text-text-secondary">
          {isError ? error.message : t('common.noData')}
        </p>
      )}

      {complaint && (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-text-secondary">
                {complaint.ticket_no ?? `#${complaint.id}`}
              </span>
              <StatusBadge code={complaint.status} />
              {complaint.is_overdue && (
                <span className="flex items-center gap-1 rounded-lg bg-danger-500/12 px-2 py-1 text-[11px] font-semibold text-danger-fg">
                  <AlertTriangle size={12} />
                  {t('complaints.overdue')}
                </span>
              )}
            </div>

            <h2 className="font-heading text-base font-bold text-text-primary">{complaint.subject}</h2>
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
                  // Balasan dari pihak sekolah (admin/guru/staff) ditandai beda
                  // latar — kebalikan dari halaman Admin yang menandai pengadu.
                  const fromOfficer = r.user?.role !== 'orang_tua'
                  return (
                    <li
                      key={r.id}
                      className={`flex flex-col gap-1 rounded-xl p-3 ${
                        fromOfficer ? 'bg-primary-300/10' : 'bg-bg-page'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary">
                          {r.user?.name ?? '-'}
                          {fromOfficer && (
                            <span className="ml-1.5 font-normal text-text-secondary">
                              · {t('complaints.officer')}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-[11px] text-text-secondary">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-text-primary">{r.body}</p>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-xs text-text-secondary">{t('complaints.replyHint')}</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder={t('complaints.replyPlaceholder')}
                className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
              />

              {replyMutation.isError && (
                <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                  {replyMutation.error.message}
                </p>
              )}

              <button
                type="button"
                disabled={!reply.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate(reply.trim())}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                {replyMutation.isPending ? t('common.processing') : t('complaints.sendReply')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-surface p-5">
            <h3 className="text-sm font-bold text-text-primary">{t('complaints.ticketInfo')}</h3>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-secondary">{t('complaints.category')}</dt>
                <dd className="text-text-primary">
                  {t(`complaints.categories.${complaint.category}`, complaint.category)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-secondary">{t('complaints.student')}</dt>
                <dd className="text-text-primary">{complaint.student?.name ?? t('complaints.childGeneral')}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-secondary">{t('complaints.createdAt')}</dt>
                <dd className="text-text-primary">{formatDateTime(complaint.created_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-secondary">{t('complaints.dueAt')}</dt>
                <dd className={complaint.is_overdue ? 'font-semibold text-danger-fg' : 'text-text-primary'}>
                  {complaint.due_at ? formatDate(complaint.due_at) : '-'}
                </dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </ResponsiveShell>
  )
}
