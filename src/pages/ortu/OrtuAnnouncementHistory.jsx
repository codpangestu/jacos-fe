import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronLeft,
  Megaphone,
  Calendar,
  Clock,
  Search,
  X,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  BellRing,
} from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import Modal from '../../components/ui/Modal'
import { apiGet } from '../../lib/api'
import { formatDate } from '../../lib/format'

export default function OrtuAnnouncementHistory() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [filterTab, setFilterTab] = useState('semua') // 'semua' | 'aktif' | 'expired'
  const [search, setSearch] = useState('')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['ortu', 'announcements', 'history', page],
    queryFn: () => apiGet('/api/announcements/history', { page }),
  })

  const rawRows = data?.data ?? []

  // Hitung stats
  const totalCount = data?.total ?? rawRows.length
  const activeCount = rawRows.filter((r) => !r.is_expired).length
  const expiredCount = rawRows.filter((r) => r.is_expired).length

  // Filter berdasarkan tab dan search query
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      // Filter status tab
      if (filterTab === 'aktif' && row.is_expired) return false
      if (filterTab === 'expired' && !row.is_expired) return false

      // Filter search
      if (search.trim()) {
        const q = search.toLowerCase()
        const titleMatch = (row.title || '').toLowerCase().includes(q)
        const bodyMatch = (row.body || '').toLowerCase().includes(q)
        return titleMatch || bodyMatch
      }

      return true
    })
  }, [rawRows, filterTab, search])

  const totalPages = data?.last_page ?? 1

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div
        className="w-full min-h-screen overflow-x-hidden pb-24"
        style={{
          background:
            'linear-gradient(180deg, rgba(3,126,254,1) 0%, rgba(242,242,242,1) 45%, #CCD5DF 100%)',
        }}
      >
        {/* Safe-area top spacer */}
        <div style={{ height: 'max(14px, env(safe-area-inset-top))' }} />

        {/* ── HEADER ── */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('common.back', 'Kembali')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95 border-0 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-[20px] font-bold text-white">
              {t('announcements.historyTitle', 'Riwayat Pengumuman')}
            </h1>
            <p className="truncate text-[11px] text-white/80">
              Informasi dan surat edaran resmi dari sekolah
            </p>
          </div>
        </div>

        {/* ── MAIN CONTENT (max-w 480px, px-4) ── */}
        <div className="flex flex-col gap-3 px-4">

          {/* ── 1. HERO STATS CARD ── */}
          <div className="flex items-center justify-between rounded-[20px] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#037EFE]">
                <Megaphone size={22} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6B7280]">
                  Pusat Pengumuman
                </p>
                <h2 className="font-heading text-[16px] font-bold text-[#111827]">
                  {totalCount} Total Pengumuman
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold text-[#059669]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                {activeCount} Aktif
              </span>
            </div>
          </div>

          {/* ── 2. SEARCH BAR ── */}
          <div className="relative flex items-center">
            <Search
              size={16}
              className="absolute left-3.5 text-[#9CA3AF] pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul atau isi pengumuman..."
              className="w-full rounded-[14px] bg-white py-2.5 pl-10 pr-9 text-[12px] font-medium text-[#111827] placeholder-[#9CA3AF] shadow-sm outline-none border border-transparent focus:border-[#037EFE] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 text-[#9CA3AF] hover:text-[#4B5563] border-0 bg-transparent cursor-pointer p-0"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* ── 3. FILTER TABS (Semua, Aktif, Kedaluwarsa) ── */}
          <div className="flex items-center gap-2 rounded-[14px] bg-white/70 p-1 backdrop-blur-sm shadow-xs">
            <button
              type="button"
              onClick={() => setFilterTab('semua')}
              className={`flex-1 rounded-[10px] py-1.5 text-center text-[11px] font-bold transition-all border-0 cursor-pointer ${
                filterTab === 'semua'
                  ? 'bg-white text-[#037EFE] shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('aktif')}
              className={`flex-1 rounded-[10px] py-1.5 text-center text-[11px] font-bold transition-all border-0 cursor-pointer ${
                filterTab === 'aktif'
                  ? 'bg-white text-[#059669] shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('expired')}
              className={`flex-1 rounded-[10px] py-1.5 text-center text-[11px] font-bold transition-all border-0 cursor-pointer ${
                filterTab === 'expired'
                  ? 'bg-white text-[#64748B] shadow-sm'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              Kedaluwarsa ({expiredCount})
            </button>
          </div>

          {/* ── 4. LIST PENGUMUMAN ── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] bg-white p-8 shadow-sm">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#037EFE] border-t-transparent" />
              <p className="mt-2 text-[12px] font-medium text-[#6B7280]">
                {t('common.loading', 'Memuat pengumuman...')}
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] bg-white p-8 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
                <Megaphone size={24} />
              </div>
              <h3 className="mt-3 font-heading text-[14px] font-bold text-[#111827]">
                {t('announcements.noAnnouncements', 'Belum Ada Pengumuman')}
              </h3>
              <p className="mt-1 text-[11px] text-[#6B7280]">
                {search
                  ? `Tidak ada pengumuman yang cocok dengan kata kunci "${search}".`
                  : 'Saat ini belum ada pengumuman sekolah untuk kategori ini.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredRows.map((item) => {
                const isExpired = item.is_expired
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="flex flex-col gap-2 rounded-[20px] bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    {/* Top Row: Tags & Expiry badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[9.5px] font-bold text-[#037EFE]">
                        <BellRing size={10} />
                        <span>Pengumuman Resmi</span>
                      </span>

                      {item.expires_at ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                            isExpired
                              ? 'bg-[#F1F5F9] text-[#64748B]'
                              : 'bg-[#ECFDF5] text-[#059669]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isExpired ? 'bg-[#94A3B8]' : 'bg-[#10B981]'
                            }`}
                          />
                          {isExpired ? 'Kedaluwarsa' : 'Aktif'}
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[9.5px] font-semibold text-[#64748B]">
                          Tanpa batas waktu
                        </span>
                      )}
                    </div>

                    {/* Judul */}
                    <h3 className="font-heading text-[14px] font-bold leading-snug text-[#111827] line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Body snippet */}
                    <p className="text-[11px] leading-relaxed text-[#4B5563] line-clamp-2">
                      {item.body}
                    </p>

                    <div className="h-px w-full bg-[#F3F4F6] my-0.5" />

                    {/* Footer Row: Tanggal Terbit & Tombol Baca */}
                    <div className="flex items-center justify-between text-[10.5px] text-[#6B7280]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#9CA3AF]" />
                        <span>{formatDate(item.created_at)}</span>
                        {item.expires_at && (
                          <>
                            <span className="text-[#CBD5E1]">•</span>
                            <span className="text-[10px] text-[#64748B]">
                              s.d. {formatDate(item.expires_at)}
                            </span>
                          </>
                        )}
                      </div>

                      <span className="flex items-center gap-0.5 font-bold text-[#037EFE] hover:underline">
                        <span>Baca</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── 5. PAGINATION CONTROLS ── */}
          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 items-center justify-center rounded-[10px] bg-white px-3 text-[11px] font-bold text-[#111827] shadow-xs disabled:opacity-40 cursor-pointer border-0"
              >
                Sebelumnya
              </button>
              <span className="text-[11px] font-semibold text-white/90">
                Halaman {page} dari {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-8 items-center justify-center rounded-[10px] bg-white px-3 text-[11px] font-bold text-[#111827] shadow-xs disabled:opacity-40 cursor-pointer border-0"
              >
                Selanjutnya
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── MODAL DETAIL PENGUMUMAN ── */}
      <Modal
        open={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        title={t('announcements.announcementTitle', 'Detail Pengumuman')}
      >
        {selectedAnnouncement && (
          <div className="flex flex-col gap-3.5 pt-1">
            {/* Status & Date Tag */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10px] font-bold text-[#037EFE]">
                <Megaphone size={11} />
                <span>Pengumuman Sekolah</span>
              </span>

              {selectedAnnouncement.expires_at ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold ${
                    selectedAnnouncement.is_expired
                      ? 'bg-[#F1F5F9] text-[#64748B]'
                      : 'bg-[#ECFDF5] text-[#059669]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedAnnouncement.is_expired
                        ? 'bg-[#94A3B8]'
                        : 'bg-[#10B981]'
                    }`}
                  />
                  {selectedAnnouncement.is_expired ? 'Kedaluwarsa' : 'Aktif'}
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h2 className="font-heading text-[16px] font-bold leading-snug text-[#111827]">
              {selectedAnnouncement.title}
            </h2>

            {/* Metadata (Waktu diterbitkan) */}
            <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-[#F8FAFC] p-2.5 text-[11px] text-[#64748B]">
              <div className="flex items-center gap-1">
                <Calendar size={13} className="text-[#9CA3AF]" />
                <span>Diterbitkan: {formatDate(selectedAnnouncement.created_at)}</span>
              </div>
              {selectedAnnouncement.expires_at && (
                <div className="flex items-center gap-1">
                  <Clock size={13} className="text-[#9CA3AF]" />
                  <span>
                    Berlaku s.d: {formatDate(selectedAnnouncement.expires_at)}
                  </span>
                </div>
              )}
            </div>

            {/* Body Text */}
            <div className="rounded-[14px] border border-[#F1F5F9] bg-white p-3.5 text-[12px] leading-relaxed text-[#374151] whitespace-pre-line">
              {selectedAnnouncement.body}
            </div>

            {/* Footer action */}
            <button
              type="button"
              onClick={() => setSelectedAnnouncement(null)}
              className="mt-1 flex h-10 w-full items-center justify-center rounded-[12px] bg-[#037EFE] text-[12px] font-bold text-white shadow-sm hover:bg-[#0066D6] active:scale-[0.98] transition-all border-0 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}
      </Modal>
    </ResponsiveShell>
  )
}
