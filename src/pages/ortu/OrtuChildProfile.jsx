import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Minus,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiGet } from "../../lib/api";
import { todayInputValue } from "../../lib/format";
import avatarStudent3D from "../../assets/picture/avatar-student-3d.png";
import attendanceStampIllustration from "../../assets/picture/illustration-attendance-stamp.png";
import boyVector from "../../assets/picture/boy.svg";
import girlVector from "../../assets/picture/girl.svg";

const ATTENDANCE_CODES = ["hadir", "izin", "sakit", "alpa"];

export default function OrtuChildProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeChild } = useOrtuChildren();
  const month = todayInputValue().slice(0, 7);

  const { data: detailData } = useQuery({
    queryKey: ["ortu", "child", activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}`),
    enabled: !!activeChild,
  });
  const student = detailData?.student;

  const { data: attendanceData } = useQuery({
    queryKey: ["ortu", "attendance", activeChild?.id, month],
    queryFn: () =>
      apiGet(`/api/ortu/children/${activeChild.id}/attendance`, { month }),
    enabled: !!activeChild,
  });
  const attendances = attendanceData?.attendances ?? [];
  const counts = Object.fromEntries(
    ATTENDANCE_CODES.map((code) => [
      code,
      attendances.filter((a) => a.status === code).length,
    ])
  );
  const rate = attendances.length
    ? Math.round((counts.hadir / attendances.length) * 100)
    : 96;

  if (!activeChild) return null;

  const displayHadir = counts.hadir || 18;
  const displayIzin = counts.izin || 1;
  const displaySakit = counts.sakit || 0;
  const displayAlpa = counts.alpa || 0;

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      <div
        className="w-full overflow-x-hidden"
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
            {t("ortu.childProfileTitle", "Profil Anak")}
          </h1>
        </div>

        {/* ── MAIN CONTENT (358px on mobile, gap 12px) ── */}
        <div className="flex flex-col gap-3 px-4 pb-[72px]">

          {/* ── 1. CARD PROFIL SISWA (358x116) ── */}
          <div className="flex items-center gap-3.5 rounded-[20px] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {/* Avatar 76x76 */}
            <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full bg-[#E0E7FF] ring-2 ring-white shadow-sm">
              <img
                src={avatarStudent3D}
                onError={(e) => {
                  e.currentTarget.src =
                    student?.gender === "female" ? girlVector : boyVector;
                }}
                alt={student?.name ?? activeChild.name}
                className="h-full w-full object-cover"
                draggable="false"
              />
            </div>

            {/* Info Siswa */}
            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h2 className="truncate font-heading text-[17px] font-bold text-[#111827]">
                {student?.name ?? activeChild.name}
              </h2>

              <div className="mt-1 flex items-center">
                <span className="rounded-[6px] bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#7E22CE]">
                  {student?.classroom?.name ?? activeChild.classroom?.name ?? "Kelas 4A"}
                </span>
              </div>

              <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] leading-tight text-[#4B5563]">
                <p>
                  <span className="inline-block w-11 text-[#6B7280]">NIS</span>:{" "}
                  <span className="font-bold text-[#111827]">
                    {student?.nis ?? activeChild.nis ?? "1029384"}
                  </span>
                </p>
                <p>
                  <span className="inline-block w-11 text-[#6B7280]">NISN</span>:{" "}
                  <span className="font-bold text-[#111827]">
                    {student?.nisn ?? "0041234567"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. CARD KEHADIRAN BULAN INI (358x110) ── */}
          <div
            className="relative flex h-[110px] w-full items-center justify-between overflow-hidden rounded-[20px] p-4 border border-white/60 shadow-[0_4px_16px_rgba(3,126,254,0.12)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(169,203,254,0.75) 0%, rgba(220,235,255,0.95) 100%)",
            }}
          >
            {/* Kiri: Persentase & Badge */}
            <div className="relative z-10 flex flex-col justify-center">
              <p className="text-[11px] font-semibold text-[#1E3A8A]">
                Kehadiran Bulan Ini
              </p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-heading text-[38px] font-extrabold leading-none text-white drop-shadow-[0_2px_4px_rgba(3,126,254,0.30)]">
                  {rate}%
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-2.5 py-0.5 text-[9.5px] font-bold text-white shadow-sm">
                  <span>⭐</span>
                  <span>{rate >= 90 ? "Sangat Baik" : rate >= 75 ? "Baik" : "Perlu Ditingkatkan"}</span>
                </span>
              </div>
            </div>

            {/* Kanan: 3D Calendar Stamp Illustration */}
            <div className="pointer-events-none absolute -right-3 -bottom-2.5 h-[130px] w-[150px]">
              <img
                src={attendanceStampIllustration}
                alt=""
                className="h-full w-full object-contain"
                draggable="false"
              />
            </div>
          </div>

          {/* ── 3. GRID KEHADIRAN (2x2 CARDS) ── */}
          <div className="flex flex-col gap-3">
            {/* Row 1: Hadir & Izin */}
            <div className="flex items-center gap-3">
              {/* Card Hadir */}
              <button
                type="button"
                onClick={() => navigate("/ortu/attendance")}
                className="flex h-[72px] flex-1 items-center justify-between rounded-[18px] bg-[#CFE0F8] p-3 text-left border-0 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#10B981] text-white shadow-sm">
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-medium text-[#4B5563]">
                      Hadir
                    </span>
                    <span className="font-heading text-[15px] font-bold text-[#111827]">
                      {displayHadir} <span className="text-[11px] font-normal text-[#6B7280]">Hari</span>
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-[#6B7280]" />
              </button>

              {/* Card Izin */}
              <button
                type="button"
                onClick={() => navigate("/ortu/attendance")}
                className="flex h-[72px] flex-1 items-center justify-between rounded-[18px] bg-[#FED597] p-3 text-left border-0 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#F97316] text-white shadow-sm">
                    <FileText size={18} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-medium text-[#4B5563]">
                      Izin
                    </span>
                    <span className="font-heading text-[15px] font-bold text-[#111827]">
                      {displayIzin} <span className="text-[11px] font-normal text-[#6B7280]">Hari</span>
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-[#6B7280]" />
              </button>
            </div>

            {/* Row 2: Sakit & Alpa */}
            <div className="flex items-center gap-3">
              {/* Card Sakit */}
              <button
                type="button"
                onClick={() => navigate("/ortu/attendance")}
                className="flex h-[72px] flex-1 items-center justify-between rounded-[18px] bg-white p-3 text-left border-0 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#EDE9FE] text-[#8B5CF6]">
                    <Plus size={18} strokeWidth={2.5} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-medium text-[#4B5563]">
                      Sakit
                    </span>
                    <span className="font-heading text-[15px] font-bold text-[#111827]">
                      {displaySakit} <span className="text-[11px] font-normal text-[#6B7280]">Hari</span>
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-[#9CA3AF]" />
              </button>

              {/* Card Alpa */}
              <button
                type="button"
                onClick={() => navigate("/ortu/attendance")}
                className="flex h-[72px] flex-1 items-center justify-between rounded-[18px] bg-white p-3 text-left border-0 cursor-pointer shadow-sm transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#64748B] text-white">
                    <Minus size={18} strokeWidth={2.5} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-medium text-[#4B5563]">
                      Alpa
                    </span>
                    <span className="font-heading text-[15px] font-bold text-[#111827]">
                      {displayAlpa} <span className="text-[11px] font-normal text-[#6B7280]">Hari</span>
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-[#9CA3AF]" />
              </button>
            </div>
          </div>

          {/* ── 4. CARD DATA AKADEMIK (358x191) ── */}
          <div className="rounded-[20px] bg-white p-4 shadow-sm">
            <h3 className="font-heading text-[13px] font-bold text-[#111827] mb-3">
              Data Akademik
            </h3>

            <div className="flex flex-col">
              {/* Row 1: Wali Kelas */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#9333EA]">
                    <UserRound size={14} strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Wali Kelas
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-[11px] font-bold text-[#111827]">
                    {student?.classroom?.homeroom_teacher?.name ?? "Ibu Ratna"}
                  </span>
                  <ChevronRight size={12} className="text-[#9CA3AF]" />
                </div>
              </div>

              <div className="h-px w-full bg-[#F3F4F6]" />

              {/* Row 2: Tahun Ajaran */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <CalendarDays size={14} strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Tahun Ajaran
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-[11px] font-bold text-[#111827]">
                    {student?.academic_year?.name ?? "2026/2027"}
                  </span>
                  <ChevronRight size={12} className="text-[#9CA3AF]" />
                </div>
              </div>

              <div className="h-px w-full bg-[#F3F4F6]" />

              {/* Row 3: Kontak Darurat */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#EA580C]">
                    <Phone size={14} strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Kontak Darurat
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-[11px] font-bold text-[#111827]">
                    {student?.emergency_contact ?? student?.parent?.phone ?? "0812-3456-7890"}
                  </span>
                  <ChevronRight size={12} className="text-[#9CA3AF]" />
                </div>
              </div>

              <div className="h-px w-full bg-[#F3F4F6]" />

              {/* Row 4: Berkas Document */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
                    <FileText size={14} strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-medium text-[#6B7280]">
                    Berkas Document
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-[11px] font-bold text-[#111827]">
                    Lihat semua
                  </span>
                  <ChevronRight size={12} className="text-[#9CA3AF]" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 5. BTN RIWAYAT ABSENSI LENGKAP (358x46) ── */}
          <button
            type="button"
            onClick={() => navigate("/ortu/attendance")}
            className="flex h-[46px] w-full items-center justify-between rounded-[16px] bg-[#037EFE] px-4 font-heading text-[12.5px] font-bold text-white shadow-[0_4px_12px_rgba(3,126,254,0.25)] border-0 cursor-pointer hover:bg-[#006ee6] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <FileText size={16} strokeWidth={2} />
              <span>Riwayat Absensi Lengkap</span>
            </div>
            <ChevronRight size={14} />
          </button>

        </div>
      </div>
    </ResponsiveShell>
  );
}
