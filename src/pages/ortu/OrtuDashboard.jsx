import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  Megaphone,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import NotificationBell from "../../components/NotificationBell";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiGet } from "../../lib/api";
import { setActiveChildId } from "../../lib/activeChild";
import { formatDate, weekdayLong, weekdaysShort, nowWib } from "../../lib/format";
import { getUser } from "../../lib/auth";
import bannerImg from "../../assets/guide/banner.png";
import banner1 from "../../assets/guide/banner (1).png";
import banner2 from "../../assets/guide/banner (2).png";
import ChildAvatar from "../../components/ortu/ChildAvatar";
import ParentAvatar from "../../components/ortu/ParentAvatar";
import { getChildMascot, getChildGender } from "../../lib/childProfile";

/* ─────────────────────────────────────────────────────────────
   BANNER SLIDESHOW
   3 slide · auto-play 4s · swipe · dot overlay
   FIX: overflow-hidden on container, dot via Tailwind only
───────────────────────────────────────────────────────────── */
function BannerSlideshow() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const slides = [bannerImg, banner1, banner2];

  const goTo = useCallback(
    (idx) => setCurrent((idx + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    // Auto-play dihentikan kalau user meminta reduce-motion (WCAG 2.3.3) —
    // dot & swipe manual tetap berfungsi.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const iv = setInterval(() => goTo(current + 1), 4000);
    return () => clearInterval(iv);
  }, [current, goTo]);

  return (
    <div
      className="relative h-[157px] w-full overflow-hidden rounded-3xl shadow-[0px_8px_24px_#00000026]"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 40) goTo(current + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      {/* Track */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div key={i} className="h-full w-full shrink-0">
            <img
              src={src}
              alt={i === 0 ? "JACOS" : ""}
              aria-hidden={i !== 0}
              className="h-full w-full object-cover"
              draggable="false"
            />
          </div>
        ))}
      </div>

      {/* Dot indicator — tombol 24×24 (target sentuh min) dgn visual dot kecil di dalam */}
      <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t("ortu.showSlide", { n: i + 1 })}
            aria-current={current === i}
            className="flex h-6 w-6 items-center justify-center border-0 bg-transparent p-0 cursor-pointer"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   QR PLACEHOLDER
───────────────────────────────────────────────────────────── */
function QrPlaceholder({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="16" height="16" rx="2" fill="#111827" />
      <rect x="6" y="6" width="10" height="10" rx="1" fill="white" />
      <rect x="8" y="8" width="6" height="6" fill="#111827" />
      <rect x="25" y="3" width="16" height="16" rx="2" fill="#111827" />
      <rect x="28" y="6" width="10" height="10" rx="1" fill="white" />
      <rect x="30" y="8" width="6" height="6" fill="#111827" />
      <rect x="3" y="25" width="16" height="16" rx="2" fill="#111827" />
      <rect x="6" y="28" width="10" height="10" rx="1" fill="white" />
      <rect x="8" y="30" width="6" height="6" fill="#111827" />
      <rect x="25" y="25" width="4" height="4" fill="#111827" />
      <rect x="31" y="25" width="4" height="4" fill="#111827" />
      <rect x="25" y="31" width="4" height="4" fill="#111827" />
      <rect x="31" y="31" width="4" height="4" fill="#111827" />
      <rect x="37" y="25" width="4" height="4" fill="#111827" />
      <rect x="37" y="31" width="4" height="4" fill="#111827" />
      <rect x="25" y="37" width="4" height="4" fill="#111827" />
      <rect x="31" y="37" width="4" height="4" fill="#111827" />
    </svg>
  );
}


/* ═════════════════════════════════════════════════════════════
   PAGE
═════════════════════════════════════════════════════════════ */
export default function OrtuDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { children, activeChild, isLoading: childrenLoading, isError: childrenError, refetch: refetchChildren } = useOrtuChildren();
  const user = getUser();

  const currentChild = activeChild ?? children[0];
  // "Hari ini" selalu wall-clock WIB (NFR §7.2) — new Date() biasa bisa geser
  // tanggal kalau device user di luar zona WIB.
  const today = nowWib();
  const pad2 = (n) => String(n).padStart(2, "0");

  /* ── Queries ── */
  const { data: pickupsData } = useQuery({
    queryKey: ["ortu", "pickups", currentChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${currentChild.id}/pickups`),
    enabled: !!currentChild,
  });
  const activePickups = (pickupsData?.pickups ?? []).filter((p) => p.status === "active");

  const ymOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  const ymCurrent = ymOf(today);
  const ymPrev = ymOf(new Date(today.getFullYear(), today.getMonth() - 1, 1));

  const { data: attCurrent } = useQuery({
    queryKey: ["ortu", "attendance", currentChild?.id, ymCurrent],
    queryFn: () => apiGet(`/api/ortu/children/${currentChild.id}/attendance`, { month: ymCurrent }),
    enabled: !!currentChild,
  });
  const { data: attPrev } = useQuery({
    queryKey: ["ortu", "attendance", currentChild?.id, ymPrev],
    queryFn: () => apiGet(`/api/ortu/children/${currentChild.id}/attendance`, { month: ymPrev }),
    enabled: !!currentChild,
  });
  const attendanceByDate = new Map(
    [...(attPrev?.attendances ?? []), ...(attCurrent?.attendances ?? [])].map(
      (row) => [row.date.slice(0, 10), row],
    ),
  );

  const { data: calendarData } = useQuery({
    queryKey: ["ortu", "calendar", "upcoming"],
    queryFn: () => apiGet("/api/ortu/calendar/upcoming"),
  });
  const upcomingAgenda = calendarData?.holidays ?? [];

  /* ── Invoice: cari tagihan belum/terlambat bayar terdekat ── */
  const { data: invoicesData } = useQuery({
    queryKey: ["ortu", "invoices", currentChild?.id, "unpaid"],
    queryFn: () => apiGet(`/api/ortu/children/${currentChild.id}/invoices`),
    enabled: !!currentChild,
  });
  const unpaidInvoices = (invoicesData?.invoices ?? []).filter((i) =>
    ["belum_bayar", "terlambat"].includes(i.status),
  );
  const nearestInvoice = unpaidInvoices
    .slice()
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0] ?? null;
  const isOverdue = nearestInvoice?.status === "terlambat" ||
    (nearestInvoice?.due_date && new Date(nearestInvoice.due_date) < today);

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements", "feed"],
    queryFn: () => apiGet("/api/announcements"),
  });
  const latestAnnouncements = announcementsData?.announcements ?? [];

  if (childrenLoading && children.length === 0) {
    return (
      <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
        <div
          className="w-full space-y-3 px-4 pt-6 pb-24"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,126,254,1) 0%, rgba(242,237,237,1) 27%, #F3F4F6 100%)",
          }}
        >
          <div className="h-14 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-[86px] animate-pulse rounded-2xl bg-white/70" />
          <div className="h-[157px] animate-pulse rounded-3xl bg-white/70" />
          <div className="h-[124px] animate-pulse rounded-[20px] bg-white/70" />
        </div>
      </ResponsiveShell>
    );
  }

  if (childrenError && children.length === 0) {
    return (
      <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
        <div
          className="w-full px-4 pt-8 pb-24"
          style={{
            background:
              "linear-gradient(180deg, rgba(3,126,254,1) 0%, rgba(242,237,237,1) 27%, #F3F4F6 100%)",
          }}
        >
          <div role="alert" className="rounded-2xl border border-red-200 bg-white p-5 text-center shadow-sm">
            <p className="text-sm font-semibold text-red-700">{t("dashboard.loadError")}</p>
            <button
              type="button"
              onClick={() => refetchChildren()}
              className="mt-3 rounded-xl bg-[#0C2B4C] px-4 py-2 text-sm font-semibold text-white border-0 cursor-pointer"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      </ResponsiveShell>
    );
  }

  if (children.length === 0) return null;

  /* ── Weekstrip ── */
  const dayNames = weekdaysShort();
  const weekDays = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - idx));
    const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const record = attendanceByDate.get(key);
    return {
      key,
      name: dayNames[d.getDay()],
      date: pad2(d.getDate()),
      status: record?.status ?? null,
      attended: record?.status === "hadir",
      isToday: idx === 6,
    };
  });

  /* ── Status anak hari ini ── */
  const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  const attToday = attendanceByDate.get(todayKey);
  let statusLabel = t("ortu.statusNotRecorded");
  let statusDot = "bg-[#9CA3AF]";
  if (currentChild?.picked_up_at) {
    statusLabel = t("ortu.statusPickedUp");         statusDot = "bg-[#22C55E]";
  } else if (attToday?.status === "hadir") {
    statusLabel = t("ortu.statusActiveAtSchool");   statusDot = "bg-[#22C55E]";
  } else if (["izin", "sakit"].includes(attToday?.status)) {
    statusLabel = t("ortu.statusOnLeave");          statusDot = "bg-[#FB923C]";
  } else if (attToday?.status === "alpa") {
    statusLabel = t("ortu.statusAbsent");           statusDot = "bg-[#EF4444]";
  }

  const firstName = (user?.name ?? "").split(" ")[0];

  const quickActions = [
    {
      key: "attendance",
      label: t("ortu.actionAttendance"),
      bg: "rgba(63, 163, 235, 0.20)",
      iconColor: "text-[#0F457F]",
      Icon: ClipboardCheck,
      onClick: () => navigate("/ortu/attendance"),
    },
    {
      key: "leave",
      label: t("studentLeave.dashboardCta"),
      bg: "rgba(254, 154, 39, 0.20)",
      iconColor: "text-[#78350F]",
      Icon: FileText,
      onClick: () => navigate("/ortu/leave-requests"),
    },
    {
      key: "agenda",
      label: t("ortu.actionAgenda"),
      bg: "rgba(165, 201, 255, 0.20)",
      iconColor: "text-[#3E579D]",
      Icon: CalendarDays,
      onClick: () =>
        document
          .getElementById("ortu-agenda-card")
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    },
  ];

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      {/*
        FIX: Hapus min-h-screen — penyebab ruang kosong gradient setelah konten habis.
        Gunakan min-h-full agar wrapper hanya setinggi kontennya.
        overflow-x-hidden tetap di sini mencegah horizontal scroll dari track slideshow.
        Background F3F4F6 di bawah akan diisi oleh MobileAppShell bg-bg-page yg sama warnanya.
      */}
      <div
        className="w-full overflow-x-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,126,254,1) 0%, rgba(242,237,237,1) 27%, #F3F4F6 100%)",
        }}
      >
        {/* Safe-area top */}
        <div style={{ height: "max(14px, env(safe-area-inset-top))" }} />

        {/* ══════════════════════════════
            PROFILE HEADER
        ══════════════════════════════ */}
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Avatar parent 54x54: vektor laki-laki / wanita sesuai gender */}
            <ParentAvatar user={user} childrenList={children} className="h-[54px] w-[54px]" />

            <div className="min-w-0 flex-1">
              {/* FIX: truncate pada nama mencegah overflow di nama panjang */}
              <h1 className="truncate font-heading text-[18px] font-bold leading-tight text-[#111827]">
                {t("ortu.hello", { name: firstName })}
              </h1>

              {/* Child switcher */}
              {children.length > 1 ? (
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    className="flex h-6 max-w-full items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white py-0.5 pl-1 pr-2.5 shadow-sm active:scale-[0.98]"
                  >
                    <ChildAvatar child={currentChild} className="h-[19px] w-[22px]" />
                    {/* FIX: truncate + max-w agar tidak overflow pill */}
                    <span className="max-w-[160px] truncate text-[9px] font-semibold text-[#374151]">
                      {currentChild?.name}
                      {currentChild?.classroom?.name ? ` (${currentChild.classroom.name})` : ""}
                    </span>
                    <ChevronDown
                      size={10}
                      className={`shrink-0 text-[#6B7280] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <>
                      <button
                        type="button"
                        aria-label={t("common.close")}
                        onClick={() => setDropdownOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <ul
                        role="listbox"
                        className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1 shadow-xl"
                      >
                        {children.map((c) => {
                          const isSelected = currentChild?.id === c.id;
                          return (
                            <li key={c.id} aria-selected={isSelected}>
                              <button
                                type="button"
                                role="option"
                                onClick={() => {
                                  setDropdownOpen(false);
                                  setActiveChildId(c.id);
                                }}
                                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                                  isSelected ? "bg-[#037EFE]/10" : "hover:bg-gray-50"
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <ChildAvatar child={c} className="h-[22px] w-[22px]" />
                                  <span className="truncate text-[11px] font-semibold text-[#374151]">
                                    {c.name}
                                    {c.classroom?.name ? ` (${c.classroom.name})` : ""}
                                  </span>
                                </span>
                                {isSelected && <Check size={13} className="shrink-0 text-[#037EFE]" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-1 flex h-7 max-w-full items-center gap-1.5 rounded-[14px] border border-gray-200 bg-white py-0.5 pl-1 pr-2.5 shadow-sm">
                  <ChildAvatar child={currentChild} className="h-[22px] w-[22px]" />
                  <span className="max-w-[160px] truncate text-[9px] font-semibold text-[#374151]">
                    {currentChild?.name}
                    {currentChild?.classroom?.name ? ` (${currentChild.classroom.name})` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          <NotificationBell variant="dot" />
        </div>

        {/* ══════════════════════════════
            DASHBOARD CONTENT
            FIX: gap-[11px] sesuai Figma
            FIX: pb-24 cukup untuk tab bar ~56px + safe area
        ══════════════════════════════ */}
        <div className="flex flex-col gap-[11px] px-4 pb-[68px] pt-[11px]">

          {/* ── 1. QUICK ACTIONS ── */}
          <div className="flex h-[86px] items-center justify-center">
            <div className="flex items-center gap-[26px]">
              {quickActions.map(({ key, label, bg, iconColor, Icon, onClick }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  onClick={onClick}
                  className="flex w-20 flex-col items-center gap-0 border-0 bg-transparent p-0 cursor-pointer"
                >
                  <span
                    className="flex h-[62px] w-[62px] items-center justify-center rounded-full backdrop-blur-md shadow-[0_4px_6px_-2px_rgba(0,0,0,0.15)] ring-1 ring-white/50 transition-transform active:scale-95"
                    style={{ background: bg }}
                  >
                    <Icon size={28} strokeWidth={2} className={iconColor} />
                  </span>
                  <span className="mt-1.5 text-center font-heading text-[12px] font-bold leading-tight text-[#111827]">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. BANNER SLIDESHOW ── */}
          <BannerSlideshow />

          {/* ── 3. WEEK CALENDAR STRIP ── */}
          <div className="flex h-[76px] items-center overflow-hidden rounded-[18px] bg-white shadow-[0px_4px_5px_-3px_rgba(0,0,0,0.25)]">
            {weekDays.map((day) => (
              <div
                key={day.key}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-[3px] ${
                  day.isToday
                    ? "mx-0.5 h-14 rounded-[14px] bg-[#000006]"
                    : "h-[54px]"
                }`}
              >
                <span
                  className={`text-[8.5px] font-medium leading-tight whitespace-nowrap ${
                    day.isToday ? "text-white" : "text-[#6B7280]"
                  }`}
                >
                  {day.name}
                </span>
                <span
                  className={`font-bold leading-tight whitespace-nowrap ${
                    day.isToday ? "text-[13px] text-white" : "text-[12.5px] text-[#111827]"
                  }`}
                >
                  {day.date}
                </span>
                <span
                  className={`h-1 w-1 rounded-sm ${
                    day.attended
                      ? "bg-green-500"
                      : day.status === "izin" || day.status === "sakit"
                        ? "bg-orange-400"
                        : day.status === "alpa"
                          ? "bg-red-500"
                          : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
            {/* Chevron navigasi */}
            <button
              type="button"
              onClick={() => navigate("/ortu/attendance")}
              aria-label={t("ortu.attendanceHistoryTitle")}
              className="flex shrink-0 items-center justify-center px-2 py-2 border-0 bg-transparent cursor-pointer"
            >
              <ChevronRight size={12} className="text-[#9CA3AF]" />
            </button>
          </div>

          {/* ── 4. CHILD STATUS CARD ── */}
          <div
            className="flex w-full items-stretch overflow-hidden rounded-[20px] shadow-[0px_4px_5.2px_-3px_rgba(0,0,0,0.25)]"
            style={{
              background: "linear-gradient(144deg, rgba(255,174,66,1) 0%, rgba(255,247,239,1) 100%)",
              minHeight: "124px",
            }}
          >
            {/* Mascot — lebar fixed 102px sesuai Figma (Dinamis: rubah cowo / rubah cewe) */}
            <div className="relative flex w-[102px] shrink-0 items-center justify-center p-2">
              <div className="absolute inset-2 rounded-[14px] bg-[#F7D1A2]" />
              <img
                src={getChildMascot(currentChild)}
                alt={getChildGender(currentChild) === "female" ? "Maskot Siswi JACOS" : "Maskot Siswa JACOS"}
                className="relative z-10 h-[98px] w-auto object-contain"
                draggable="false"
              />
            </div>

            {/* Konten kanan — flex-1, padding konsisten */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-3 pr-3 pl-1">
              {/* Status + chevron */}
              <div className="flex items-center justify-between gap-1">
                <div className="inline-flex min-w-0 shrink items-center gap-1.5 rounded-[11px] bg-[#111827] px-2.5 py-0.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot}`} />
                  <span className="truncate text-[9.5px] font-bold text-white">
                    {statusLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/ortu/profile-anak")}
                  aria-label={t("ortu.childProfileTitle")}
                  className="shrink-0 border-0 bg-transparent p-0 cursor-pointer"
                >
                  <ChevronRight size={14} className="text-white" />
                </button>
              </div>

              {/* NIS */}
              <span className="text-[11.5px] font-semibold text-[#111827]">
                {t("students.nis")}: {currentChild?.nis ?? "-"}
              </span>

              {/* Tombol aksi */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/ortu/pickups")}
                  className="flex h-8 flex-1 items-center justify-center gap-1 rounded-[14px] bg-[#3474B0] px-2 text-[10px] font-bold text-white border-0 shadow-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                >
                  <Users size={13} className="shrink-0" />
                  <span className="truncate">{t("ortu.pickupChildBtn")}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    nearestInvoice
                      ? navigate(`/ortu/invoices/${nearestInvoice.id}`)
                      : navigate("/ortu/invoices")
                  }
                  className="relative flex h-8 flex-1 items-center justify-center gap-1 rounded-[14px] bg-white px-2 text-[10px] font-bold text-[#111827] border-0 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                >
                  {/* Dot merah — muncul kalau ada tagihan lewat tenggat */}
                  {isOverdue && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
                      <span className="text-[7px] font-bold text-white leading-none">!</span>
                    </span>
                  )}
                  <CreditCard size={13} className="shrink-0" />
                  <span className="truncate">{t("ortu.paySppBtn")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 5. QR PENJEMPUT + AGENDA MENDATANG ── */}
          <div className="flex items-stretch gap-3">

            {/* QR Penjemput — 174px di Figma, w-1/2 flex-1 */}
            <button
              type="button"
              onClick={() => navigate("/ortu/pickups")}
              className="flex flex-1 items-center justify-between rounded-[18px] bg-[#A9CBFE] p-2.5 text-left border-0 cursor-pointer transition-transform active:scale-[0.98]"
            >
              {/* QR box 54x54 */}
              <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[10px] bg-white p-1 shadow-sm">
                {activePickups[0]?.qr_token ? (
                  <QRCodeSVG
                    value={activePickups[0].qr_token}
                    size={44}
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                    level="M"
                  />
                ) : (
                  <QrPlaceholder size={44} />
                )}
              </div>

              <div className="mx-1.5 min-w-0 flex-1">
                <p className="text-[9px] leading-tight text-[#334155]">
                  {t("ortu.authorizedPickupsShort")}
                </p>
                <p className="truncate text-[11px] font-bold text-[#0F172A]">
                  {activePickups[0]?.name ?? t("ortu.noPickupYet")}
                </p>
                <p className="mt-0.5 text-[8px] leading-[10px] text-[#334155] line-clamp-2">
                  {t("ortu.qrHint")}
                </p>
              </div>

              <ChevronRight size={12} className="shrink-0 text-[#1E293B]" />
            </button>

            {/* Agenda Mendatang — 174px di Figma, w-1/2 flex-1 */}
            <div
              id="ortu-agenda-card"
              className="flex flex-1 flex-col justify-between rounded-[18px] bg-white p-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-heading text-[10.5px] font-bold leading-tight text-[#111827]">
                  {t("ortu.agendaCardTitle")}
                </h2>
                <ChevronRight size={10} className="shrink-0 text-[#9CA3AF]" />
              </div>

              <div className="my-auto flex flex-col gap-1.5">
                {upcomingAgenda.length > 0 ? (
                  upcomingAgenda.slice(0, 2).map((item, idx) => {
                    const [y, m, d] = item.date.slice(0, 10).split("-").map(Number);
                    const isEven = idx % 2 === 0;
                    return (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] ${isEven ? 'bg-[#F3E8FF]' : 'bg-[#EFF6FF]'}`}>
                          <CalendarDays size={12} className={isEven ? 'text-[#9333EA]' : 'text-[#2563EB]'} />
                        </span>
                        <div className="min-w-0 flex flex-col">
                          <span className="truncate text-[9px] font-bold text-[#111827]">
                            {weekdayLong(new Date(y, m - 1, d))},{" "}
                            {formatDate(item.date, { withYear: false })}
                          </span>
                          <span className="truncate text-[8px] text-[#6B7280]">
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-2 text-center text-[9px] text-[#6B7280]">
                    {t("ortu.agendaEmpty")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── 6. PENGUMUMAN SEKOLAH ── */}
          {latestAnnouncements.length > 0 && (
            <div className="flex flex-col gap-2 rounded-[20px] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#037EFE]">
                    <Megaphone size={14} />
                  </span>
                  <h2 className="font-heading text-[12px] font-bold text-[#111827]">
                    {t("ortu.announcementsTitle")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/ortu/announcements")}
                  className="flex items-center gap-0.5 text-[11px] font-bold text-[#0369D6] hover:underline border-0 bg-transparent cursor-pointer p-0"
                >
                  <span>{t("common.viewAll")}</span>
                  <ChevronRight size={13} className="shrink-0 text-[#9CA3AF]" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                {latestAnnouncements.slice(0, 2).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate("/ortu/announcements")}
                    className="flex w-full flex-col gap-1 rounded-[12px] bg-[#F8FAFC] p-2.5 text-left transition hover:bg-[#F1F5F9] cursor-pointer border-0"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11.5px] font-bold text-[#111827]">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-[9.5px] text-[#64748B]">
                        {formatDate(item.created_at, { withYear: false })}
                      </span>
                    </span>
                    <span className="text-[10.5px] text-[#4B5563] line-clamp-1">
                      {item.body}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </ResponsiveShell>
  );
}
