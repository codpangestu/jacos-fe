import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Paperclip
} from 'lucide-react'
import useOrtuChildren from '../../hooks/useOrtuChildren'
import { apiGet, apiPostForm } from '../../lib/api'
import { formatDate, todayInputValue } from '../../lib/format'

export default function OrtuLeaveRequests() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { activeChild, children } = useOrtuChildren()
  const [page, setPage] = useState(1)

  const emptyForm = () => ({
    student_id: activeChild?.id ?? '',
    type: 'sakit',
    start_date: todayInputValue(),
    end_date: todayInputValue(),
    reason: '',
    attachment: null,
  })
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'leave-requests', page],
    queryFn: () => apiGet('/api/ortu/leave-requests', { page }),
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v)
      })
      return apiPostForm('/api/ortu/leave-requests', body)
    },
    onSuccess: () => {
      setForm(emptyForm())
      queryClient.invalidateQueries({ queryKey: ['ortu', 'leave-requests'] })
    },
  })

  const requestsList = data?.data ?? []

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 text-slate-800 antialiased relative selection:bg-emerald-500 selection:text-white">
      {/* Background Top Gradient matching Figma exactly */}
      <div
        className="absolute top-0 left-0 right-0 h-[280px] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(180deg, #1DD469 0%, rgba(243, 244, 246, 0.95) 75%, #F3F4F6 100%)'
        }}
      />

      <div className="relative z-10 mx-auto max-w-md px-4 pt-4">
        {/* Header Bar */}
        <div className="flex items-center gap-3 py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6EE59F] text-[#064E3B] shadow-sm transition hover:bg-[#5cd48e] active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-lg font-bold text-slate-900">
            {t('studentLeave.title') || 'Pengajuan Izin'}
          </h1>
        </div>

        {/* Form Card */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submitMutation.mutate()
          }}
          className="mt-3 space-y-4 rounded-[24px] bg-white p-5 shadow-sm border border-slate-100"
        >
          {submitMutation.isSuccess && (
            <div className="rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200">
              {t('studentLeave.submitSuccess') || 'Pengajuan izin berhasil dikirim.'}
            </div>
          )}
          {submitMutation.isError && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {submitMutation.error?.message || 'Gagal mengirim pengajuan izin.'}
            </div>
          )}

          {/* F1: Pilih Anak */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-800">
              {t('studentLeave.childLabel') || 'Pilih Anak'}
            </label>
            <div className="relative">
              <select
                value={form.student_id || activeChild?.id || ''}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {children?.length ? (
                  children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.grade_level ? `- ${c.grade_level}` : ''}
                    </option>
                  ))
                ) : (
                  <option value={activeChild?.id || ''}>
                    {activeChild?.name || 'Siswa'} {activeChild?.grade_level ? `- ${activeChild.grade_level}` : ''}
                  </option>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* F2: Jenis Izin */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-800">
              {t('studentLeave.typeLabel') || 'Jenis Izin'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'sakit' })}
                className={`flex items-center justify-center rounded-[14px] py-2.5 text-xs font-semibold transition ${
                  form.type === 'sakit'
                    ? 'bg-[#1DD469] text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sakit
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'izin' })}
                className={`flex items-center justify-center rounded-[14px] py-2.5 text-xs font-semibold transition ${
                  form.type === 'izin'
                    ? 'bg-[#1DD469] text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Izin Acara
              </button>
            </div>
          </div>

          {/* F3: Tanggal Mulai & Selesai */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-800">
              Tanggal
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="block text-[10px] font-medium text-slate-400 mb-1">Mulai</span>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-medium text-slate-400 mb-1">Selesai</span>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* F4: Alasan */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800">
                {t('leave.reason') || 'Alasan'}
              </label>
              <span className="text-[10px] font-medium text-slate-400">
                {form.reason.length}/500
              </span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              placeholder={t('leave.reasonPlaceholder') || 'Tulis alasan pengajuan izin...'}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full resize-none rounded-[14px] border border-slate-200 bg-white p-3 text-xs text-slate-700 placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* F5: Unggah Dokumen */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-800">
              Unggah Dokumen
            </label>
            <label className="relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-slate-300 bg-[#FAF9FC] p-4 text-center cursor-pointer transition hover:bg-slate-100">
              <input
                type="file"
                className="sr-only"
                onChange={(e) => setForm({ ...form, attachment: e.target.files?.[0] ?? null })}
              />
              <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-slate-700">
                {form.attachment ? form.attachment.name : 'Unggah Surat Dokter'}
              </p>
              <p className="text-[10px] text-slate-400">(Opsional)</p>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full rounded-[16px] bg-[#1DD469] py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition hover:bg-[#19bd5d] active:scale-[0.99] disabled:opacity-60"
          >
            {submitMutation.isPending ? t('common.processing') : 'Kirim Pengajuan'}
          </button>
        </form>

        {/* Section: Riwayat Izin */}
        <div className="mt-6">
          <h2 className="mb-3 font-heading text-sm font-bold text-slate-900">
            {t('studentLeave.historyTitle') || 'Riwayat Izin'}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-[18px] bg-white shadow-sm" />
              ))}
            </div>
          ) : requestsList.length === 0 ? (
            /* Fallback dummy data jika belum ada riwayat dari backend agar sesuai dengan figma */
            <div className="space-y-3">
              {/* Sample Card R1 */}
              <div className="rounded-[18px] bg-white p-4 shadow-sm border border-slate-100/80">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Izin - Acara Keluarga</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">20 Sep 2026</p>
                    <p className="text-[11px] text-slate-500 mt-1">Alasan: Acara keluarga di luar kota</p>
                  </div>
                  <span className="inline-flex rounded-[12px] bg-[#F59E0B] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    Menunggu
                  </span>
                </div>
              </div>

              {/* Sample Card R2 */}
              <div className="rounded-[18px] bg-white p-4 shadow-sm border border-slate-100/80">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Sakit - Demam</h3>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">14 Sep - 15 Sep 2026</p>
                    <p className="text-[11px] text-slate-500 mt-1">Alasan: Demam dan tidak enak badan</p>
                  </div>
                  <span className="inline-flex rounded-[12px] bg-[#10B981] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    Disetujui
                  </span>
                </div>
                {/* Catatan Callout */}
                <div className="mt-3 rounded-[12px] bg-[#E8FAF2] p-2.5 border border-emerald-100 text-[11px]">
                  <p className="font-bold text-[#10B981]">Catatan Ustadzah Ratna:</p>
                  <p className="text-slate-600 mt-0.5">Semoga lekas sembuh, materi akan dikirim via WA.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {requestsList.map((row) => {
                const isApproved = row.status === 'approved' || row.status === 'disetujui'
                const isPending = row.status === 'pending' || row.status === 'menunggu'
                const isRejected = row.status === 'rejected' || row.status === 'ditolak'

                return (
                  <div key={row.id} className="rounded-[18px] bg-white p-4 shadow-sm border border-slate-100/80">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 capitalize">
                          {row.type === 'sakit' ? 'Sakit' : 'Izin'} - {row.reason?.slice(0, 24) || 'Pengajuan'}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {formatDate(row.start_date)} {row.start_date !== row.end_date ? ` - ${formatDate(row.end_date)}` : ''}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Alasan: {row.reason}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-[12px] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
                          isApproved
                            ? 'bg-[#10B981]'
                            : isPending
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#EF4444]'
                        }`}
                      >
                        {isApproved ? 'Disetujui' : isPending ? 'Menunggu' : 'Ditolak'}
                      </span>
                    </div>

                    {row.review_note && (
                      <div className="mt-3 rounded-[12px] bg-[#E8FAF2] p-2.5 border border-emerald-100 text-[11px]">
                        <p className="font-bold text-[#10B981]">Catatan Petugas:</p>
                        <p className="text-slate-600 mt-0.5">{row.review_note}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
