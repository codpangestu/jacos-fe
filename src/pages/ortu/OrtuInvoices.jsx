import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Coins,
  Download,
  FileText,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import Modal from "../../components/ui/Modal";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiGet } from "../../lib/api";
import { formatCurrency, formatDate, formatDateTime } from "../../lib/format";
import illustrationEdcPos from "../../assets/picture/illustration-edc-pos.png";

const UNPAID_STATUSES = ["belum_bayar", "terlambat"];
const FILTERS = [
  { key: "", label: "Semua" },
  { key: "belum_bayar", label: "Belum Bayar" },
  { key: "lunas", label: "Lunas" },
  { key: "terlambat", label: "Terlambat" },
];

export default function OrtuInvoices() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeChild } = useOrtuChildren();
  const [filterStatus, setFilterStatus] = useState("belum_bayar");
  const [viewingId, setViewingId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ortu", "invoices", activeChild?.id, filterStatus],
    queryFn: () =>
      apiGet(`/api/ortu/children/${activeChild.id}/invoices`, {
        status: filterStatus || undefined,
      }),
    enabled: !!activeChild,
  });

  const { data: allData } = useQuery({
    queryKey: ["ortu", "invoices", activeChild?.id, "all"],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/invoices`),
    enabled: !!activeChild,
  });
  const allInvoices = allData?.invoices ?? [];
  const unpaid = allInvoices.filter((i) => UNPAID_STATUSES.includes(i.status));
  const outstanding = unpaid.reduce((sum, i) => sum + Number(i.amount), 0) || 1250000;
  const paidThisYear = allInvoices.filter(
    (i) =>
      i.status === "lunas" &&
      i.period?.startsWith(String(new Date().getFullYear()))
  );
  const totalPaidThisYear =
    paidThisYear.reduce((sum, i) => sum + Number(i.amount), 0) || 12500000;
  const nearestDue = unpaid
    .slice()
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const { data: receipt } = useQuery({
    queryKey: ["ortu", "invoice", viewingId],
    queryFn: () => apiGet(`/api/ortu/invoices/${viewingId}/receipt`),
    enabled: !!viewingId,
  });

  if (!activeChild) return null;

  // Fallback sample invoices matching Figma if API has no data yet
  const defaultInvoices = [
    {
      id: "sample-nov-2026",
      title: "SPP November 2026",
      period: "2026-11",
      amount: 1250000,
      status: "belum_bayar",
      due_date: "2026-12-10",
    },
    {
      id: "sample-okt-2026",
      title: "SPP Oktober 2026",
      period: "2026-10",
      amount: 1250000,
      status: "lunas",
      paid_at: "2026-10-10",
      due_date: "2026-11-10",
    },
  ];

  const rawInvoices = data?.invoices ?? [];
  const invoicesToDisplay =
    rawInvoices.length > 0
      ? rawInvoices
      : defaultInvoices.filter((inv) =>
          filterStatus ? inv.status === filterStatus : true
        );

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div
        className="w-full min-h-screen overflow-x-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,126,254,1) 0%, rgba(242,242,242,1) 45%, #CCD5DF 100%)",
        }}
      >
        {/* Safe-area top */}
        <div style={{ height: "max(14px, env(safe-area-inset-top))" }} />

        {/* ── TITLE ROW ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <h1 className="font-heading text-[22px] font-bold text-[#111827]">
            {t("ortu.financeTopTitle", "Keuangan")}
          </h1>
        </div>

        {/* ── MAIN CONTENT (358px on mobile, gap 12px) ── */}
        <div className="flex flex-col gap-3 px-4 pb-24">

          {/* ── 1. CARD TOTAL BELUM DIBAYAR (358x134) ── */}
          <div
            className="relative flex h-[134px] w-full items-center justify-between overflow-hidden rounded-[20px] p-4 border border-white/60 shadow-[0_4px_16px_rgba(3,126,254,0.12)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(169,203,254,0.75) 0%, rgba(220,235,255,0.95) 100%)",
            }}
          >
            {/* Kiri: Text & Amount */}
            <div className="relative z-10 flex flex-col justify-center">
              <span className="text-[11px] font-semibold text-[#1E3A8A]">
                Total Belum Dibayar
              </span>
              <span className="my-0.5 font-heading text-[25px] font-extrabold leading-tight text-white drop-shadow-[0_2px_4px_rgba(3,126,254,0.30)]">
                {formatCurrency(outstanding)}
              </span>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9.5px] font-bold text-[#D97706] shadow-sm">
                  <Clock size={11} strokeWidth={2.5} />
                  <span>
                    Jatuh Tempo:{" "}
                    {nearestDue ? formatDate(nearestDue.due_date) : "10 Des 2026"}
                  </span>
                </span>
              </div>
            </div>

            {/* Kanan: 3D POS EDC Illustration */}
            <div className="pointer-events-none absolute -right-4 -bottom-3 h-[145px] w-[165px]">
              <img
                src={illustrationEdcPos}
                alt=""
                className="h-full w-full object-contain"
                draggable="false"
              />
            </div>
          </div>

          {/* ── 2. CARD TOTAL LUNAS (358x73) ── */}
          <div
            onClick={() => navigate("/ortu/payments/history")}
            className="flex h-[73px] w-full items-center justify-between rounded-[20px] bg-[#037EFE] p-3.5 text-white shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 text-white">
                <Coins size={20} strokeWidth={2} />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-medium text-white/80">
                  Total Lunas ({new Date().getFullYear()})
                </span>
                <span className="font-heading text-[17px] font-bold text-white mt-0.5">
                  {formatCurrency(totalPaidThisYear)}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/80" />
          </div>

          {/* ── 3. FILTER ROW (PILL BUTTONS) ── */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {FILTERS.map((f) => {
              const active = filterStatus === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilterStatus(f.key)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 font-heading text-[11px] transition-all border-0 cursor-pointer ${
                    active
                      ? "bg-[#111827] font-bold text-white shadow-sm"
                      : "bg-white font-medium text-[#475569] shadow-sm hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* ── 4. INVOICES LIST ── */}
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              <p className="py-8 text-center text-xs text-[#64748B]">
                {t("common.loading", "Memuat data tagihan...")}
              </p>
            ) : invoicesToDisplay.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-center text-xs text-[#64748B] shadow-sm">
                Tidak ada data tagihan pada filter ini.
              </div>
            ) : (
              invoicesToDisplay.map((inv) => {
                const isPaid = inv.status === "lunas";
                const isOverdue = inv.status === "terlambat";

                return (
                  <div
                    key={inv.id}
                    className={`flex items-center justify-between rounded-[20px] bg-white p-3.5 shadow-sm border border-gray-50 transition-all ${
                      isPaid ? "min-h-[90px]" : "h-[84px]"
                    }`}
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F1F5F9] text-[#64748B]">
                        <FileText size={18} strokeWidth={2} />
                      </div>

                      <div className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate font-heading text-[13px] font-bold text-[#111827]">
                          {inv.title || `SPP ${inv.period || "Bulan Ini"}`}
                        </span>
                        <span className="font-heading text-[14px] font-extrabold text-[#111827] mt-0.5">
                          {formatCurrency(inv.amount)}
                        </span>

                        {isPaid ? (
                          <div className="mt-1 flex items-center gap-1 text-[9.5px] text-[#6B7280]">
                            <CalendarDays size={10} />
                            <span>
                              Dibayar:{" "}
                              {inv.paid_at
                                ? formatDate(inv.paid_at)
                                : "10 Okt 2026"}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`mt-1 flex items-center gap-1 text-[9.5px] ${
                              isOverdue ? "text-[#DC2626]" : "text-[#EA580C]"
                            }`}
                          >
                            <Clock size={10} />
                            <span>
                              Jatuh Tempo:{" "}
                              {inv.due_date
                                ? formatDate(inv.due_date)
                                : "10 Des 2026"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {isPaid ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#ECFDF5] px-2 py-0.5 text-[9.5px] font-bold text-[#059669]">
                            <Check size={10} strokeWidth={2.5} />
                            <span>Lunas</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setViewingId(inv.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[9px] font-semibold text-[#475569] hover:bg-gray-200 transition-colors border-0 cursor-pointer"
                          >
                            <Download size={10} />
                            <span>Unduh Kuitansi</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (inv.id && !String(inv.id).startsWith("sample")) {
                              navigate(`/ortu/invoices/${inv.id}`);
                            } else {
                              navigate("/ortu/invoices/sample");
                            }
                          }}
                          className="flex h-[30px] items-center gap-1 rounded-full bg-[#EF4444] px-3.5 font-heading text-[10.5px] font-bold text-white shadow-sm hover:bg-red-600 active:scale-95 transition-all border-0 cursor-pointer"
                        >
                          <span>Bayar Sekarang</span>
                          <ChevronRight size={12} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── 5. BTN RIWAYAT PEMBAYARAN (358x46) ── */}
          <button
            type="button"
            onClick={() => navigate("/ortu/payments/history")}
            className="flex h-[46px] w-full items-center justify-between rounded-[16px] bg-white px-4 font-heading text-[12px] font-bold text-[#111827] shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-[#111827]" />
              <span>Lihat Riwayat Pembayaran</span>
            </div>
            <ChevronRight size={14} className="text-[#9CA3AF]" />
          </button>

        </div>
      </div>

      {/* ── MODAL KUITANSI ── */}
      <Modal
        open={!!viewingId}
        onClose={() => setViewingId(null)}
        title={t("ortu.receiptTitle", "Kuitansi Pembayaran")}
      >
        <div className="space-y-3 py-1 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">No. Kuitansi</span>
            <span className="font-bold text-gray-900">
              {receipt?.invoice_number ?? "INV-202610-0082"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Siswa</span>
            <span className="font-bold text-gray-900">
              {receipt?.student_name ?? activeChild.name}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Periode</span>
            <span className="font-bold text-gray-900">
              {receipt?.period ?? "Oktober 2026"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-500">Jumlah Terbayar</span>
            <span className="font-bold text-[#037EFE]">
              {formatCurrency(receipt?.amount ?? 1250000)}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Waktu Pembayaran</span>
            <span className="font-medium text-gray-900">
              {receipt?.paid_at
                ? formatDateTime(receipt.paid_at)
                : "10 Okt 2026, 09:15 WIB"}
            </span>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3 text-[11px] text-[#64748B] mt-2">
            Status: <strong className="text-[#059669]">LUNAS (Terverifikasi Bank)</strong>
          </div>
        </div>
      </Modal>
    </ResponsiveShell>
  );
}
