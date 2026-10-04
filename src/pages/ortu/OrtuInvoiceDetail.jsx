import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  Smartphone,
  CreditCard,
  Building,
  RefreshCw
} from 'lucide-react'
import bsiLogo from '../../assets/picture/logo-bsi.png'
import { apiGet, apiPost } from '../../lib/api'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function OrtuInvoiceDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [openAccordion, setOpenAccordion] = useState(null)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['ortu', 'invoice', id],
    queryFn: () => apiGet(`/api/ortu/invoices/${id}/receipt`),
  })

  const payMutation = useMutation({
    mutationFn: () => apiPost(`/api/ortu/invoices/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ortu', 'invoice', id] })
    },
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['ortu', 'invoice', id] })
  }

  const vaNumber = invoice?.va_number || '900 1234 5678 9012'
  const isPaid = invoice?.status === 'lunas' || invoice?.status === 'paid'

  const handleCopyVa = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s+/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleAccordion = (key) => {
    setOpenAccordion(openAccordion === key ? null : key)
  }

  // Sample items jika invoice belum memuat item rincian spesifik
  const invoiceItems = invoice?.items?.length
    ? invoice.items
    : [
        { label: `SPP Bulan ${invoice?.period || 'November'}`, amount: invoice?.amount ? invoice.amount * 0.64 : 800000 },
        { label: 'Biaya Praktikum IPA', amount: invoice?.amount ? invoice.amount * 0.12 : 150000 },
        { label: 'Katering Sekolah', amount: invoice?.amount ? invoice.amount * 0.24 : 300000 },
      ]

  const totalAmount = invoice?.amount || 1250000

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 text-slate-800 antialiased relative selection:bg-blue-500 selection:text-white">
      {/* Background Top Gradient matching Figma exactly */}
      <div
        className="absolute top-0 left-0 right-0 h-[300px] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(180deg, #3397FF 0%, rgba(243, 244, 246, 0.95) 70%, #F3F4F6 100%)'
        }}
      />

      <div className="relative z-10 mx-auto max-w-md px-4 pt-4">
        {/* Header Row */}
        <div className="flex items-center gap-3 py-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BFDBFE] text-slate-800 shadow-sm transition hover:bg-blue-200 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-lg font-bold text-slate-900">
            Detail Tagihan
          </h1>
        </div>

        {isLoading && !invoice ? (
          <div className="mt-4 space-y-4">
            <div className="h-32 animate-pulse rounded-[20px] bg-white shadow-sm" />
            <div className="h-44 animate-pulse rounded-[20px] bg-white shadow-sm" />
            <div className="h-32 animate-pulse rounded-[20px] bg-blue-100 shadow-sm" />
          </div>
        ) : (
          <div className="mt-3 space-y-3.5">
            {/* Card 1: Header Invoice */}
            <div className="rounded-[20px] bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-400">No. Invoice</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 tracking-tight">
                    {invoice?.invoice_number || 'INV-20261101-BDS'}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm ${
                    isPaid ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                  }`}
                >
                  {isPaid ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Lunas
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      Belum Bayar
                    </>
                  )}
                </span>
              </div>

              <div className="mt-3.5">
                <p className="text-[11px] font-medium text-slate-400">Total Tagihan</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                  {formatCurrency(totalAmount)}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Batas Akhir: {invoice?.due_date ? formatDateTime(invoice.due_date) : '10 Des 2026'}
                </span>
              </div>
            </div>

            {/* Card 2: Rincian Biaya */}
            <div className="rounded-[20px] bg-white p-5 shadow-sm border border-slate-100">
              <h2 className="font-heading text-xs font-bold text-slate-900 mb-3">
                Rincian Biaya
              </h2>

              <div className="space-y-2 text-xs">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-600">
                    <span>{item.label}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="my-3.5 border-t border-dashed border-slate-200" />

              {/* Total Row Pill */}
              <div className="flex items-center justify-between rounded-[14px] bg-[#F8FAFC] px-3.5 py-2.5">
                <span className="text-xs font-bold text-slate-700">Total</span>
                <span className="text-xs font-extrabold text-slate-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Card 3: Virtual Account BSI */}
            {!isPaid && (
              <div className="rounded-[20px] bg-[#BDD7FD] p-4 shadow-sm border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <img src={bsiLogo} alt="Bank Syariah Indonesia" className="h-5 object-contain" />
                  <span className="text-[10px] font-bold text-blue-900">Bank Syariah Indonesia</span>
                </div>
                <p className="mt-1 text-[11px] font-semibold text-blue-950">
                  Virtual Account BSI
                </p>

                {/* White VA Box */}
                <div className="mt-2.5 flex items-center justify-between rounded-[16px] bg-white px-3.5 py-2.5 shadow-sm">
                  <span className="font-mono text-sm font-bold tracking-wider text-slate-800">
                    {vaNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyVa}
                    className="flex items-center gap-1 rounded-[10px] bg-[#6B7280] px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Salin Nomor
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Card 4: Cara Pembayaran */}
            <div className="rounded-[20px] bg-white p-5 shadow-sm border border-slate-100">
              <h2 className="font-heading text-xs font-bold text-slate-900 mb-3">
                Cara Pembayaran
              </h2>

              <div className="space-y-2.5">
                {/* Accordion 1: M-Banking */}
                <div className="rounded-[14px] bg-[#F8FAFC] border border-slate-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('mbanking')}
                    className="flex w-full items-center justify-between p-2.5 text-left transition hover:bg-slate-100/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#DCFCE7] text-emerald-600">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Via M-Banking</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        openAccordion === 'mbanking' ? 'rotate-180 text-slate-600' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'mbanking' && (
                    <div className="px-3.5 pb-3 pt-1 text-[11px] text-slate-600 space-y-1 border-t border-slate-100 bg-white">
                      <p>1. Buka aplikasi BSI Mobile / Mobile Banking Anda.</p>
                      <p>2. Pilih menu <strong>Bayar &gt; Akademik / Institusi</strong>.</p>
                      <p>3. Masukkan kode institusi atau pilih <strong>JACOS</strong>.</p>
                      <p>4. Masukkan nomor Virtual Account di atas.</p>
                      <p>5. Periksa nominal lalu masukkan PIN untuk konfirmasi.</p>
                    </div>
                  )}
                </div>

                {/* Accordion 2: ATM */}
                <div className="rounded-[14px] bg-[#F8FAFC] border border-slate-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('atm')}
                    className="flex w-full items-center justify-between p-2.5 text-left transition hover:bg-slate-100/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#DBEAFE] text-blue-600">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Via ATM</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        openAccordion === 'atm' ? 'rotate-180 text-slate-600' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'atm' && (
                    <div className="px-3.5 pb-3 pt-1 text-[11px] text-slate-600 space-y-1 border-t border-slate-100 bg-white">
                      <p>1. Masukkan kartu ATM dan PIN Anda di mesin ATM BSI.</p>
                      <p>2. Pilih menu <strong>Transaksi Lainnya &gt; Pembayaran &gt; Virtual Account</strong>.</p>
                      <p>3. Masukkan nomor Virtual Account.</p>
                      <p>4. Konfirmasi data dan selesaikan transaksi.</p>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Bank Lain */}
                <div className="rounded-[14px] bg-[#F8FAFC] border border-slate-100 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion('other')}
                    className="flex w-full items-center justify-between p-2.5 text-left transition hover:bg-slate-100/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FEF3C7] text-amber-600">
                        <Building className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Bank Lain</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        openAccordion === 'other' ? 'rotate-180 text-slate-600' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'other' && (
                    <div className="px-3.5 pb-3 pt-1 text-[11px] text-slate-600 space-y-1 border-t border-slate-100 bg-white">
                      <p>1. Pilih menu transfer antar bank ke <strong>Bank Syariah Indonesia (BSI / kode 451)</strong>.</p>
                      <p>2. Masukkan nomor Virtual Account sebagai rekening tujuan.</p>
                      <p>3. Masukkan nominal tagihan yang sesuai persis.</p>
                      <p>4. Simpan bukti transfer.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback bayar — sebelumnya senyap: gagal (mis. tagihan terlambat)
                maupun sukses tidak pernah memberi tahu user apa pun */}
            {!isPaid && payMutation.isError && (
              <div
                role="alert"
                className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
              >
                {payMutation.error?.message || t('common.errorGeneric')}
              </div>
            )}
            {!isPaid && payMutation.isSuccess && payMutation.data?.token && (
              <div className="rounded-[16px] border border-blue-200 bg-blue-50 px-4 py-3 text-[11px] leading-relaxed text-blue-900">
                <p>{t('ortu.paymentMethodNotReady')}</p>
                <code className="mt-1 block break-all rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-slate-800">
                  {payMutation.data.token}
                </code>
              </div>
            )}

            {/* Tombol Konfirmasi Pembayaran */}
            {!isPaid && (
              <button
                type="button"
                disabled={payMutation.isPending}
                onClick={() => payMutation.mutate()}
                className="w-full rounded-[16px] bg-[#52D388] py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition hover:bg-[#46bd79] active:scale-[0.99] disabled:opacity-60"
              >
                {payMutation.isPending ? t('common.processing') : 'Konfirmasi Pembayaran'}
              </button>
            )}

            {/* Refresh Status */}
            <button
              type="button"
              onClick={refresh}
              className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t('ortu.refreshStatus') || 'Perbarui Status'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
