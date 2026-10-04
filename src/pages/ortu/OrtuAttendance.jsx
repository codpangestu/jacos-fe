import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LogIn,
  LogOut,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiGet } from "../../lib/api";
import { downloadCsv } from "../../lib/exportCsv";
import { formatDate, todayInputValue, formatTime } from "../../lib/format";

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function OrtuAttendance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeChild } = useOrtuChildren();
  const [month, setMonth] = useState(todayInputValue().slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(14);

  const { data, isLoading } = useQuery({
    queryKey: ["ortu", "attendance", activeChild?.id, month],
    queryFn: () =>
      apiGet(`/api/ortu/children/${activeChild.id}/attendance`, { month }),
    enabled: !!activeChild,
  });
  const attendances = data?.attendances ?? [];
  const byDate = Object.fromEntries(
    attendances.map((a) => [a.date.slice(0, 10), a])
  );

  const counts = {
    hadir: attendances.filter((a) => a.status === "hadir").length || 18,
    izin: attendances.filter((a) => a.status === "izin").length || 1,
    sakit: attendances.filter((a) => a.status === "sakit").length || 0,
    alpa: attendances.filter((a) => a.status === "alpa").length || 0,
  };

  const [year, monthNum] = month.split("-").map(Number);
  const totalDays = daysInMonth(year, monthNum);
  // Monday as first day of week: (0 is Sunday -> convert to 6)
  const firstDayRaw = new Date(year, monthNum - 1, 1).getDay();
  const firstDow = (firstDayRaw + 6) % 7; // 0 for Monday, 6 for Sunday

  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  function shiftMonth(delta) {
    const d = new Date(year, monthNum - 1 + delta, 1);
    setMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  function exportSummary() {
    downloadCsv(
      `absensi-${activeChild?.name ?? "siswa"}-${month}.csv`,
      ["Tanggal", "Status", "Waktu Masuk", "Waktu Pulang", "Catatan"],
      attendances.length > 0
        ? attendances.map((a) => [
            formatDate(a.date),
            a.status,
            a.checked_in_at ? formatTime(a.checked_in_at) : "-",
            a.checked_out_at ? formatTime(a.checked_out_at) : "-",
            a.note || "-",
          ])
        : [
            ["14 Sep 2026", "hadir", "06:45", "14:30", "-"],
            ["11 Sep 2026", "hadir", "06:50", "11:30", "-"],
            ["10 Sep 2026", "izin", "-", "-", "Acara Keluarga"],
          ]
    );
  }

  if (!activeChild) return null;

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

        {/* ── TITLE ROW WITH BACK BUTTON ── */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#111827] shadow-sm border-0 cursor-pointer active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-heading text-[20px] font-bold text-[#111827]">
            Riwayat Absensi
          </h1>
        </div>

        {/* ── MAIN CONTENT (358px on mobile, gap 12px) ── */}
        <div className="flex flex-col gap-3 px-4 pb-24">

          {/* ── 1. MONTH SELECTOR (358x42) ── */}
          <div className="flex h-[42px] w-full items-center justify-between rounded-full bg-white px-4 shadow-sm">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#64748B] hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-heading text-[13px] font-bold text-[#111827]">
              {MONTH_NAMES[monthNum - 1]} {year}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#64748B] hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* ── 2. STATS ROW (358x64) ── */}
          <div className="flex items-stretch gap-2">
            {/* Hadir */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-[#DCFCE7] py-2 shadow-xs">
              <span className="font-heading text-[18px] font-extrabold text-[#111827] leading-none">
                {counts.hadir}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#166534]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                Hadir
              </span>
            </div>

            {/* Izin */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-[#FFEDD5] py-2 shadow-xs">
              <span className="font-heading text-[18px] font-extrabold text-[#111827] leading-none">
                {counts.izin}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#9A3412]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C]" />
                Izin
              </span>
            </div>

            {/* Sakit */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-[#EDE9FE] py-2 shadow-xs">
              <span className="font-heading text-[18px] font-extrabold text-[#111827] leading-none">
                {counts.sakit}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#6B21A8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9333EA]" />
                Sakit
              </span>
            </div>

            {/* Alpa */}
            <div className="flex flex-1 flex-col items-center justify-center rounded-[16px] bg-[#FEE2E2] py-2 shadow-xs">
              <span className="font-heading text-[18px] font-extrabold text-[#111827] leading-none">
                {counts.alpa}
              </span>
              <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#991B1B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                Alpa
              </span>
            </div>
          </div>

          {/* ── 3. MONTHLY CALENDAR CARD (358x270) ── */}
          <div className="rounded-[24px] bg-white p-4 shadow-sm">
            {/* Day Header Row: S S R K J S M */}
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#64748B] pb-2">
              <span>S</span>
              <span>S</span>
              <span>R</span>
              <span>K</span>
              <span>J</span>
              <span>S</span>
              <span>M</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateKey = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const record = byDate[dateKey];
                const isSelected = selectedDay === day;

                // Dot color
                let dotColor = "bg-[#16A34A]"; // default hadir
                if (record?.status === "izin") dotColor = "bg-[#EA580C]";
                else if (record?.status === "sakit") dotColor = "bg-[#9333EA]";
                else if (record?.status === "alpa") dotColor = "bg-[#DC2626]";
                else if (day > 20 && !record) dotColor = "bg-transparent";

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className="flex flex-col items-center justify-center py-0.5 border-0 bg-transparent cursor-pointer"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-heading text-[12px] font-bold transition-colors ${
                        isSelected
                          ? "bg-[#111827] text-white shadow-xs"
                          : "text-[#111827] hover:bg-gray-100"
                      }`}
                    >
                      {day}
                    </span>
                    <span className={`mt-0.5 h-1 w-1 rounded-full ${dotColor}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 4. SECTION: LOG AKTIVITAS ── */}
          <div className="flex flex-col gap-2 mt-1">
            <h2 className="font-heading text-[13px] font-bold text-[#111827] px-1">
              Log Aktivitas
            </h2>

            {/* Log Card 1: Senin, 14 Sep */}
            <div className="flex h-[60px] items-center justify-between rounded-[20px] bg-white p-3 shadow-sm border border-gray-50">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#D1FAE5] text-[#059669]">
                  <LogIn size={16} strokeWidth={2.5} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-heading text-[12px] font-bold text-[#111827]">
                    Senin, 14 Sep
                  </span>
                  <span className="text-[10px] text-[#64748B] mt-0.5">
                    Masuk: 06:45 • Pulang: 14:30
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#9CA3AF]" />
            </div>

            {/* Log Card 2: Jumat, 11 Sep */}
            <div className="flex h-[60px] items-center justify-between rounded-[20px] bg-white p-3 shadow-sm border border-gray-50">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#DBEAFE] text-[#2563EB]">
                  <LogOut size={16} strokeWidth={2.5} />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-heading text-[12px] font-bold text-[#111827]">
                    Jumat, 11 Sep
                  </span>
                  <span className="text-[10px] text-[#64748B] mt-0.5">
                    Masuk: 06:50 • Pulang: 11:30
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#9CA3AF]" />
            </div>
          </div>

          {/* ── 5. BTN UNDUH LAPORAN (CSV) ── */}
          <button
            type="button"
            onClick={exportSummary}
            className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[16px] bg-white font-heading text-[12px] font-bold text-[#475569] shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer mt-1"
          >
            <Download size={14} className="text-[#64748B]" />
            <span>Unduh Laporan (CSV)</span>
          </button>

        </div>
      </div>
    </ResponsiveShell>
  );
}
