import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  Paperclip,
  FileText,
  X,
  Send,
  HelpCircle
} from 'lucide-react'
import csIllustration from '../../assets/picture/illustration-cs-agent.png'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, apiPostForm } from '../../lib/api'
import { formatDate } from '../../lib/format'

const CATEGORIES = [
  { value: 'keuangan', label: 'Keuangan & Administrasi SPP' },
  { value: 'akademik', label: 'Akademik & Pembelajaran' },
  { value: 'sarana', label: 'Sarana & Prasarana' },
  { value: 'disiplin', label: 'Kedisiplinan Siswa' },
  { value: 'lainnya', label: 'Lainnya' },
]

export default function OrtuComplaints() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { children, activeChild } = useOrtuChildren()

  const [filterTab, setFilterTab] = useState('semua') // 'semua' | 'diproses' | 'selesai'
  const [formOpen, setFormOpen] = useState(false)

  const emptyForm = () => ({
    student_id: activeChild?.id ?? '',
    category: 'keuangan',
    subject: '',
    body: '',
    attachment: null,
  })
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'complaints'],
    queryFn: () => apiGet('/api/ortu/complaints'),
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v)
      })
      return apiPostForm('/api/ortu/complaints', body)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ortu', 'complaints'] })
      setForm(emptyForm())
      setFormOpen(false)
      if (result?.complaint?.id) {
        navigate(`/ortu/complaints/${result.complaint.id}`)
      }
    },
  })

  const complaintsList = data?.data ?? []

  // Tidak ada fallback demo — tampilkan empty state kalau memang belum ada pengaduan
  const itemsToDisplay = complaintsList

  const filteredItems = itemsToDisplay.filter((item) => {
    if (filterTab === 'diproses') {
      return item.status === 'diproses' || item.status === 'in_progress' || item.status === 'baru'
    }
    if (filterTab === 'selesai') {
      return item.status === 'selesai' || item.status === 'resolved' || item.status === 'closed'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 text-slate-800 antialiased relative selection:bg-blue-500 selection:text-white">
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
            Layanan TU
          </h1>
        </div>

        {/* Hero Banner Blue Card */}
        <div className="mt-3 relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] p-5 shadow-sm text-white">
          <div className="relative z-10 max-w-[210px]">
            <h2 className="font-heading text-base font-bold leading-tight">
              Pusat Bantuan<br />Pengaduan
            </h2>
            <p className="mt-1 text-[11px] text-blue-100 leading-normal">
              Sampaikan Aduan dan Pertanyaan Anda di sini
            </p>
            <button
              type="button"
              onClick={() => {
                setForm({ ...emptyForm(), student_id: activeChild?.id ?? '' })
                setFormOpen(true)
              }}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#181A20] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-black active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Buat Pengaduan
            </button>
          </div>

          {/* CS Illustration Vector on Right */}
          <div className="absolute -bottom-2 -right-1 pointer-events-none w-[150px] sm:w-[165px]">
            <img
              src={csIllustration}
              alt="Customer Service Support"
              className="w-full object-contain"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterTab('semua')}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              filterTab === 'semua'
                ? 'bg-[#181A20] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('diproses')}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              filterTab === 'diproses'
                ? 'bg-[#181A20] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Diproses
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('selesai')}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              filterTab === 'selesai'
                ? 'bg-[#181A20] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* List of Complaints */}
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-[22px] bg-white shadow-sm" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[22px] bg-white p-8 text-center text-xs text-slate-500 shadow-sm">
              Tidak ada pengaduan dengan status ini.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isResolved =
                item.status === 'selesai' || item.status === 'resolved' || item.status === 'closed'
              const ticketNum = item.ticket_no || `#TKT-${item.id}`
              const createdDate = item.created_at ? formatDate(item.created_at) : '-'
              const parentInfo = item.submitted_by?.name ?? item.parent_name ?? '-'
              const studentName = item.student?.name
                ? `${item.student.name}${item.student.classroom?.name ? ` ${item.student.classroom.name}` : ''}`
                : item.student_info ?? '-'

              return (
                <div
                  key={item.id}
                  className="rounded-[22px] bg-white p-4 shadow-sm border border-slate-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-mono text-[11px] font-semibold text-slate-400">
                          {ticketNum} · {createdDate}
                        </p>
                        <h3 className="text-xs font-bold text-slate-900 mt-0.5">
                          {item.subject}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{parentInfo} - [ {studentName} ]</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${
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

                  {/* Bottom Action Pill */}
                  <button
                    type="button"
                    onClick={() => navigate(`/ortu/complaints/${item.id}`)}
                    className="mt-3 flex w-full items-center justify-between rounded-[14px] bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/80 active:scale-[0.99]"
                  >
                    <span>{isResolved ? 'Lihat Riwayat' : 'Buka Percakapan'}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Modal / Overlay Form Pengaduan matching Figma Mobile - Form Pengaduan (Ortu) [50:1393] */}
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Buat Pengaduan
                </h3>
                <div className="h-8 w-8 flex items-center justify-center text-slate-400">
                  <HelpCircle className="h-4 w-4" />
                </div>
              </div>

              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                Sampaikan kendala fasilitas, biaya, atau akademik langsung ke pihak sekolah.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submitMutation.mutate()
                }}
                className="mt-3 space-y-3"
              >
                {/* Terkait Anak */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Terkait Anak
                  </label>
                  <select
                    value={form.student_id}
                    onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                    className="w-full rounded-[14px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {children?.length ? (
                      children.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Kelas {c.grade_level || '4-A'})
                        </option>
                      ))
                    ) : (
                      <option value={activeChild?.id || ''}>
                        {activeChild?.name || 'Budi Santoso'} (Kelas {activeChild?.grade_level || '4-A'})
                      </option>
                    )}
                  </select>
                </div>

                {/* Kategori Pengaduan */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Kategori Pengaduan
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-[14px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subjek Singkat */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Subjek Singkat
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Keterlambatan Konfirmasi SPP September"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-[14px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Rincian Keluhan / Pertanyaan */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Rincian Keluhan / Pertanyaan
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tuliskan kendala Anda secara lengkap..."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="w-full resize-none rounded-[14px] border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Lampiran Bukti (Opsional) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-800">
                    Lampiran Bukti (Opsional)
                  </label>
                  {form.attachment ? (
                    <div className="flex items-center justify-between rounded-[14px] border border-blue-200 bg-[#F0F7FF] p-2.5 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-blue-900 truncate">{form.attachment.name}</p>
                          <p className="text-[10px] text-blue-600">
                            {(form.attachment.size / 1024 / 1024).toFixed(1)} MB • Siap diunggah
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, attachment: null })}
                        className="rounded-full p-1 text-blue-400 hover:bg-blue-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-slate-300 bg-[#FAF9FC] p-3 text-xs text-slate-600 cursor-pointer hover:bg-slate-100">
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })}
                      />
                      <Paperclip className="h-4 w-4 text-slate-400" />
                      <span>Pilih Dokumen / Foto Bukti</span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#2563EB] py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitMutation.isPending ? 'Mengirim...' : 'Kirim Pengaduan Sekarang'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
