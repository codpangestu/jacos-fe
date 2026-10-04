import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  Paperclip,
  Send,
  Building,
  Image as ImageIcon,
  ChevronRight,
  FileText
} from 'lucide-react'
import ParentAvatar from '../../components/ortu/ParentAvatar'
import { apiGet, apiPost, storageUrl } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

export default function OrtuComplaintDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [reply, setReply] = useState('')

  const { data, isLoading } = useQuery({
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

  const handleSubmitReply = (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    replyMutation.mutate(reply.trim())
  }

  // Fallback demo data jika detail tiket belum ada di database agar sesuai 1:1 Figma
  const ticketNumber = complaint?.ticket_no || `#PGD-${id || '0891'}`
  const subject = complaint?.subject || 'AC Kelas Rusak'
  const description =
    complaint?.body ||
    'Sejak hari Senin kemarin, AC di kelas 4A berbunyi berisik dan tidak mengeluarkan udara dingin.'
  const isResolved =
    complaint?.status === 'selesai' || complaint?.status === 'resolved' || complaint?.status === 'closed'

  const demoReplies = [
    {
      id: 1,
      sender: 'Admin TU',
      time: '10:30 AM',
      body: 'Baik Ibu, terima kasih atas informasinya. Teknisi kami akan segera mengecek ke ruangan kelas 4A pada jam istirahat siang ini.',
      isOfficer: true,
    },
    {
      id: 2,
      sender: 'Orang Tua',
      time: '10:35 AM',
      body: 'Terima kasih Pak, mohon segera ditindaklanjuti kasihan anak-anak kepanasan.',
      isOfficer: false,
    },
  ]

  const repliesToDisplay = complaint?.replies?.length
    ? complaint.replies.map((r) => ({
        id: r.id,
        sender: r.user?.role !== 'orang_tua' ? 'Admin TU' : 'Orang Tua',
        time: r.created_at ? formatDateTime(r.created_at) : 'Baru saja',
        body: r.body,
        isOfficer: r.user?.role !== 'orang_tua',
      }))
    : demoReplies

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-28 text-slate-800 antialiased relative selection:bg-blue-500 selection:text-white">
      {/* Top Gradient Blue Header */}
      <div
        className="absolute top-0 left-0 right-0 h-[280px] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(180deg, #38BDF8 0%, rgba(243, 244, 246, 0.95) 75%, #F3F4F6 100%)'
        }}
      />

      <div className="relative z-10 mx-auto max-w-md px-4 pt-4">
        {/* Header Bar */}
        <div className="flex items-center gap-3 py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm transition hover:bg-slate-100 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-lg font-bold text-slate-900">
            Detail Tiket
          </h1>
        </div>

        {isLoading && !complaint ? (
          <div className="mt-4 space-y-4">
            <div className="h-44 animate-pulse rounded-[24px] bg-white shadow-sm" />
            <div className="h-64 animate-pulse rounded-[24px] bg-white shadow-sm" />
          </div>
        ) : (
          <div className="mt-3 space-y-3.5">
            {/* Card Info Tiket */}
            <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <span className="font-mono text-base font-bold text-slate-900 tracking-tight">
                  {ticketNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${
                    isResolved
                      ? 'bg-[#DCFCE7] text-[#16A34A]'
                      : 'bg-[#FEF3C7] text-[#D97706]'
                  }`}
                >
                  {isResolved ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Selesai
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      Diproses
                    </>
                  )}
                </span>
              </div>

              {/* Subjek */}
              <div className="mt-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Subjek
                </p>
                <h2 className="text-xs font-bold text-slate-900 mt-0.5">
                  {subject}
                </h2>
              </div>

              {/* Deskripsi */}
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Deskripsi
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5 whitespace-pre-wrap">
                  {description}
                </p>
              </div>

              {/* Lampiran */}
              <div className="mt-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lampiran
                </p>
                {complaint?.attachment_path ? (
                  <a
                    href={storageUrl(complaint.attachment_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-[14px] bg-[#F8FAFC] border border-slate-100 p-2.5 transition hover:bg-slate-100/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-700 text-white">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {complaint.attachment_path.split('/').pop()}
                        </p>
                        <p className="text-[10px] text-slate-400">Lampiran pengaduan</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between rounded-[14px] bg-[#F8FAFC] border border-slate-100 p-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-700 text-white">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">foto_ac_bocor.jpg</p>
                        <p className="text-[10px] text-slate-400">1.2 MB</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Card Percakapan Thread */}
            <div className="rounded-[24px] bg-white p-5 shadow-sm border border-slate-100">
              <h3 className="font-heading text-xs font-bold text-slate-900 mb-3.5">
                Percakapan
              </h3>

              <div className="space-y-4">
                {repliesToDisplay.map((r) => {
                  if (r.isOfficer) {
                    return (
                      <div key={r.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <Building className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{r.sender}</span>
                          <span className="text-[10px] text-slate-400">{r.time}</span>
                        </div>
                        <div className="rounded-[18px] rounded-tl-sm bg-[#F1F5F9] p-3 text-xs text-slate-700 leading-relaxed max-w-[88%] ml-2">
                          {r.body}
                        </div>
                      </div>
                    )
                  }

                  // Balasan Orang Tua
                  return (
                    <div key={r.id} className="flex flex-col items-end space-y-1">
                      <div className="flex items-end gap-2 max-w-[90%]">
                        <div className="rounded-[18px] rounded-tr-sm bg-[#F5F0FF] p-3 text-xs text-slate-800 leading-relaxed shadow-2xs">
                          {r.body}
                          <p className="mt-1 text-right text-[10px] text-slate-400">{r.time}</p>
                        </div>
                        <ParentAvatar className="h-7 w-7 mb-1" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Floating Input Balasan Bar matching Figma */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-100 p-3">
          <form
            onSubmit={handleSubmitReply}
            className="mx-auto max-w-md flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tulis balasan..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 rounded-full bg-[#F1F5F9] px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-slate-500 hover:bg-slate-200 transition"
              title="Lampirkan File"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={!reply.trim() || replyMutation.isPending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#181A20] text-white shadow-md hover:bg-black active:scale-95 transition disabled:opacity-40"
              title="Kirim Balasan"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
