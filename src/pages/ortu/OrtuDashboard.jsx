import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Stethoscope,
  CalendarDays,
  CalendarCheck,
  CalendarHeart,
  Car,
  CreditCard,
  UserRoundCheck,
  Wallet,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import NotificationBell from "../../components/NotificationBell";
import StatusBadge from "../../components/ui/StatusBadge";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiGet, storageUrl } from "../../lib/api";
import { setActiveChildId } from "../../lib/activeChild";
import { formatCurrency, formatDate, formatTime, weekdaysShort } from "../../lib/format";
import { getUser } from "../../lib/auth";
import bannerImg from "../../assets/guide/banner.png";
import banner1 from "../../assets/guide/banner (1).png";
import banner2 from "../../assets/guide/banner (2).png";

/* ──────────────────────────────────────────────────────────
   BANNER SLIDESHOW
   Slide 1 : gambar banner.png (aset sekolah)
   Slide 2 : info penjemputan — gradient biru teal
   Slide 3 : info tagihan/SPP — gradient amber warm
   Auto-play 4 detik, swipe touch, dot indicator
──────────────────────────────────────────────────────────── */
function BannerSlideshow({ navigate }) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef(null)
  const touchStartX = useRef(null)
  const timerRef = useRef(null)

  const slides = [
    { id: 'banner' },
    { id: 'pickup' },
    { id: 'invoice' },
  ]

  const goTo = useCallback((idx) => {
    setCurrent((idx + slides.length) % slides.length)
  }, [slides.length])

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(() => goTo(current + 1), 4000)
    return () => clearInterval(timerRef.current)
  }, [current, goTo])

  // Touch swipe
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) goTo(current + (delta < 0 ? 1 : -1))
    touchStartX.current = null
  }

  return (
    <div className="w-full">
      {/* Slide track */}
      <div
        className="relative w-full overflow-hidden rounded-[20px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {/* Slide 1 — banner.png */}
          <div className="w-full shrink-0">
            <img
              src={bannerImg}
              alt="JACOS Banner"
              className="h-[140px] w-full object-cover"
              draggable="false"
            />
          </div>

          {/* Slide 2 — banner (1).png */}
          <div className="w-full shrink-0">
            <img
              src={banner1}
              alt=""
              aria-hidden="true"
              className="h-[140px] w-full object-cover"
              draggable="false"
            />
          </div>

          {/* Slide 3 — banner (2).png */}
          <div className="w-full shrink-0">
            <img
              src={banner2}
              alt=""
              aria-hidden="true"
              className="h-[140px] w-full object-cover"
              draggable="false"
            />
          </div>
        </div>
      </div>

      {/* Dot indicator — pill overlap ke bawah banner */}
      <div className="relative flex justify-center" style={{ marginTop: '-13px' }}>
        <div className="relative z-10 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 shadow-sm">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 h-[6px] ${
                i === current ? 'w-4 bg-[#2D94DA]' : 'w-[6px] bg-[#2D94DA]/30'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Emoji hubungan penjemput */
function relationshipEmoji(relationship = "") {
  const r = relationship.toLowerCase();
  if (r.includes("ayah") || r.includes("bapak") || r.includes("father"))
    return "👨";
  if (r.includes("ibu") || r.includes("mother")) return "👩";
  if (r.includes("kakek") || r.includes("grandfather")) return "👴";
  if (r.includes("nenek") || r.includes("grandmother")) return "👵";
  if (r.includes("supir") || r.includes("driver") || r.includes("jemput"))
    return "🚗";
  return "🧑";
}

export default function OrtuDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { children, activeChild } = useOrtuChildren();
  const user = getUser();

  const currentChild = activeChild ?? children[0];
  const agendaRef = useRef(null);

  const { data: pickupsData } = useQuery({
    queryKey: ["ortu", "pickups", currentChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${currentChild.id}/pickups`),
    enabled: !!currentChild,
  });
  const activePickups = (pickupsData?.pickups ?? []).filter(
    (p) => p.status === "active",
  );

  const today = new Date();
  const pad2 = (n) => String(n).padStart(2, "0");
  const ymOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const ymCurrent = ymOf(today);
  const ymPrev = ymOf(prevMonthDate);

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
    [...(attPrev?.attendances ?? []), ...(attCurrent?.attendances ?? [])].map((row) => [
      row.date.slice(0, 10),
      row,
    ]),
  );

  const { data: invoicesData } = useQuery({
    queryKey: ["ortu", "invoices", currentChild?.id, "all"],
    queryFn: () => apiGet(`/api/ortu/children/${currentChild.id}/invoices`),
    enabled: !!currentChild,
  });
  const allInvoices = invoicesData?.invoices ?? [];
  const unpaidInvoices = allInvoices.filter((i) => ["belum_bayar", "terlambat"].includes(i.status));
  const outstandingTotal = unpaidInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const nearestDueInvoice = unpaidInvoices
    .slice()
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const { data: calendarData } = useQuery({
    queryKey: ["ortu", "calendar", "upcoming"],
    queryFn: () => apiGet("/api/ortu/calendar/upcoming"),
  });
  const upcomingAgenda = calendarData?.holidays ?? [];

  if (children.length === 0) return null;

  function pickChild(childId) {
    setIsDropdownOpen(false);
    if (childId === null) return;
    setActiveChildId(childId);
  }

  // Weekstrip 7 hari terakhir (berjalan, bukan mock) — dari data absensi asli.
  const weekDays = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - idx));
    const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const record = attendanceByDate.get(key);
    return {
      key,
      name: weekdaysShort()[d.getDay()],
      date: pad2(d.getDate()),
      status: record?.status ?? null,
      attended: record?.status === "hadir",
      active: idx === 6,
    };
  });
  const recentAttendanceEntries = Array.from(attendanceByDate.entries())
    .filter(([, row]) => !!row.status)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, 2);

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false}>
      {/* 
        MAIN CANVAS: Pastel Gradient Background exactly matching Figma:
        linear-gradient(150deg, #CAE6F6 0%, #F6E3F2 50%, #DDF0F4 100%)
      */}
      <div className="relative flex w-full flex-col items-center bg-gradient-to-br from-[#CAE6F6] via-[#F6E3F2] to-[#DDF0F4] overflow-x-hidden">
        {/* 1. HERO SECTION — sticky, collapses on scroll */}
        <div
          className={`sticky top-0 z-50 w-full shrink-0 transition-all duration-300 ease-in-out ${
            scrolled ? 'h-[64px]' : 'h-[175px]'
          }`}
        >          {/* Blue header */}
          <div
            className={`absolute top-0 left-0 right-0 rounded-b-[40px] px-5 transition-all duration-300 ease-in-out overflow-hidden ${
              scrolled
                ? 'h-[64px] pt-[calc(env(safe-area-inset-top)+8px)]'
                : 'h-[130px] pt-[calc(env(safe-area-inset-top)+14px)]'
            }`}
            style={{ background: 'linear-gradient(to right, #35AEFC 0%, #007BFF 50%, #003F8A 100%)', boxShadow: '0 4px 16px rgba(0,63,138,0.35)' }}
          >
            {/* Layer circles dekorasi */}
            <div className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
            <div className="pointer-events-none absolute -left-4 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            {scrolled ? (
              /* ── Collapsed: satu baris compact ── */
              <div className="flex w-full items-center justify-between h-full pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F2FF] border border-[#66ADFF] text-sm">
                    👨‍💼
                  </div>
                  <span className="text-[13px] font-bold text-white leading-tight">
                    {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Hi!'}
                  </span>
                </div>
                <NotificationBell variant="hero" />
              </div>
            ) : (
              /* ── Expanded: full greeting ── */
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3 pt-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F2FF] border-2 border-[#66ADFF] text-xl shadow-md">
                    👨‍💼
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-medium text-white/80">
                      Selamat Datang
                    </span>
                    <h1 className="text-base font-bold text-white leading-tight">
                      {user?.name ? `Hi, ${user.name}` : "Hi, Bapak Adi"}
                    </h1>
                  </div>
                </div>
                <NotificationBell variant="hero" className="mt-5" />
              </div>
            )}
          </div>

          {/* Floating Pill — hanya tampil saat expanded */}
          {!scrolled && (
          <div className="absolute bottom-0 left-4 right-4 z-20">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full h-16 items-center justify-between rounded-full bg-white px-4 shadow-[0_8px_24px_rgba(12,74,64,0.12)] border border-[#B0E0E6]/50 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F2FF] border border-[#B0E0E6] text-lg">
                  {currentChild?.gender === "female" ? "👧" : "👦"}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-[#007BFF]">
                      {currentChild?.name || "Pilih Siswa"}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#007BFF] shrink-0" />
                  </div>
                  <span className="truncate text-[11px] text-[#6C8EBF]">
                    {currentChild?.classroom?.name
                      ? `${currentChild.classroom.name} • `
                      : ""}
                    NIS {currentChild?.nis || "-"}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={() => setIsDropdownOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-border bg-white p-2 shadow-[0_16px_36px_rgba(0,0,0,0.18)]">
                  {children.map((c) => {
                    const isSelected = currentChild?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => pickChild(c.id)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl p-2.5 transition-colors ${
                          isSelected
                            ? "bg-primary-300/15 text-[#007BFF]"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F2FF] text-sm font-bold">
                            {c.gender === "female" ? "👧" : "👦"}
                          </span>
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold">{c.name}</span>
                            <span className="text-xs text-gray-500">
                              {c.classroom?.name || "Siswa"}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={16} className="text-[#007BFF]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          )}
        </div>
        <div
          id="ortu-scroll-container"
          className="flex w-full flex-col items-center gap-4 px-4 mt-4 overflow-y-auto pb-24"
          style={{ height: `calc(100vh - ${scrolled ? 64 : 175}px)` }}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 40)}
        >
          {/* 2. QUICK ACTIONS (3 CIRCULAR WHITE ICONS EXACT TO FIGMA) */}
          <div className="flex justify-center items-center gap-7 w-full mt-2">
            {/* Absensi */}
            <div
              onClick={() => navigate("/ortu/attendance")}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(12,74,64,0.06)] transition-transform group-hover:scale-105 active:scale-95 text-[#007BFF]">
                <ClipboardCheck size={28} />
              </div>
              <span className="text-xs font-medium text-gray-700">Absensi</span>
            </div>

            {/* Izin Sakit */}
            <div
              onClick={() => navigate("/ortu/leave-requests")}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(12,74,64,0.06)] transition-transform group-hover:scale-105 active:scale-95 text-[#007BFF]">
                <Stethoscope size={28} />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {t("studentLeave.dashboardCta")}
              </span>
            </div>

            {/* Agenda — scroll ke kartu Agenda Mendatang, bukan navigasi */}
            <div
              onClick={() => agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_6px_16px_rgba(12,74,64,0.06)] transition-transform group-hover:scale-105 active:scale-95 text-[#007BFF]">
                <CalendarDays size={28} />
              </div>
              <span className="text-xs font-medium text-gray-700">Agenda</span>
            </div>
          </div>

          {/* 2.5. BANNER SLIDESHOW */}
          <BannerSlideshow navigate={navigate} />

          {/* 3. ATTENDANCE SCHEDULE & WEEKSTRIP CARD */}
          <div className="flex flex-col gap-3.5 bg-white rounded-[24px] p-4.5 w-full border border-[#E5EFE9] shadow-[0_8px_24px_rgba(12,74,64,0.05)]">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-bold text-[#111827]">
                Jadwal & Riwayat Minggu Ini
              </span>
              <button
                type="button"
                onClick={() => navigate("/ortu/attendance")}
                className="flex items-center gap-1 text-[11px] font-bold text-[#007BFF]"
              >
                Riwayat
                <ChevronRight size={14} />
              </button>
            </div>

            {/* WeekStrip 7 Hari */}
            <div className="flex justify-between items-center w-full gap-1">
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-xl border transition-all ${
                    day.active
                      ? "bg-[#E6F7E2] border-[#007BFF] border-2 shadow-xs"
                      : day.attended
                        ? "bg-[#F0FDF4] border-[#E6F2FF]"
                        : "bg-gray-50 border-transparent"
                  }`}
                >
                  <span
                    className={`text-[10px] ${day.active ? "font-bold text-[#007BFF]" : day.attended ? "text-emerald-700" : "text-gray-400"}`}
                  >
                    {day.name}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      day.active
                        ? "bg-[#007BFF] text-white"
                        : day.attended
                          ? "bg-[#007BFF] text-white"
                          : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {day.attended || day.active ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <span className="text-[9px]">-</span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold ${day.active ? "text-[#007BFF]" : "text-gray-800"}`}
                  >
                    {day.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Entries List — data absensi asli, bukan mock */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {recentAttendanceEntries.length === 0 ? (
                <p className="text-center text-[11px] text-gray-500 py-1">
                  {t("common.noData")}
                </p>
              ) : (
                recentAttendanceEntries.map(([key, row], idx) => {
                  const isToday = key === `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
                  const tone = row.status === "hadir" ? "text-emerald-600" : row.status === "alpa" ? "text-red-600" : "text-orange-600";
                  return (
                    <div key={key}>
                      {idx > 0 && <div className="h-px w-full bg-gray-100 mb-2" />}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#007BFF]" />
                          <span className="text-gray-800 font-medium">
                            {formatDate(key)}{isToday ? ` (${t("common.today")})` : ""}
                          </span>
                        </div>
                        <span className={`font-bold ${tone}`}>{t(`status.${row.status}`)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3.5. STATUS HARI INI — absensi & jemput, data asli dari /api/ortu/children */}
          <div className="flex items-center justify-between gap-3 bg-white rounded-[24px] p-4 w-full border border-[#E5EFE9] shadow-[0_8px_24px_rgba(12,74,64,0.05)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F2FF] text-[#007BFF]">
                <UserRoundCheck size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-gray-500">{t("ortu.pickupStatusToday")}</span>
                {["izin", "sakit", "alpa"].includes(currentChild?.today_status) ? (
                  <div className="flex items-center gap-1.5">
                    <StatusBadge code={currentChild.today_status} />
                    <span className="text-xs text-gray-600">{t("ortu.noPickupExpected")}</span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-[#111827]">
                    {currentChild?.picked_up_at
                      ? t("ortu.pickedUpAt", { time: formatTime(currentChild.picked_up_at) })
                      : t("ortu.notPickedUpYet")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3.6. RINGKASAN TAGIHAN — data asli dari /api/ortu/children/{id}/invoices */}
          <div
            onClick={() => navigate("/ortu/invoices")}
            className="flex items-center justify-between gap-3 bg-white rounded-[24px] p-4 w-full border border-[#E5EFE9] shadow-[0_8px_24px_rgba(12,74,64,0.05)] cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF5FF] text-purple-600">
                <Wallet size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] text-gray-500">{t("ortu.activeInvoice")}</span>
                {unpaidInvoices.length > 0 ? (
                  <>
                    <span className="text-sm font-bold text-[#111827]">{formatCurrency(outstandingTotal)}</span>
                    {nearestDueInvoice && (
                      <span className="truncate text-[11px] text-orange-600">
                        {t("ortu.invoiceDueSoonDescription", {
                          invoiceNumber: nearestDueInvoice.invoice_number,
                          amount: formatCurrency(nearestDueInvoice.amount),
                          date: formatDate(nearestDueInvoice.due_date),
                        })}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-bold text-emerald-600">{t("ortu.noActiveInvoice")}</span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-gray-400" />
          </div>

          {/* 4. CHILDREN OVERVIEW SECTION */}
          <div className="flex flex-col gap-2.5 w-full">
            <div className="flex justify-between items-center w-full px-1">
              <span className="text-sm font-bold text-[#111827]">
                Daftar Anak ({children.length} Anak)
              </span>
              <span className="text-[11px] text-gray-500">
                Pilih untuk beralih
              </span>
            </div>

            {children.map((c) => {
              const isActive = currentChild?.id === c.id;
              return (
                <div
                  key={c.id}
                  className={`flex flex-col gap-2.5 bg-white rounded-[20px] p-3.5 w-full shadow-sm transition-all ${
                    isActive
                      ? "border-2 border-[#007BFF] shadow-[0_4px_14px_rgba(0,123,255,0.08)]"
                      : "border border-[#E5EFE9]"
                  }`}
                >
                  <div
                    onClick={() => {
                      setActiveChildId(c.id);
                      navigate("/ortu/profile-anak");
                    }}
                    className="flex justify-between items-center w-full cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {c.photo_path ? (
                        <img
                          src={storageUrl(c.photo_path)}
                          alt={c.name}
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${c.gender === "female" ? "bg-pink-100" : "bg-[#E6F2FF]"}`}
                        >
                          {c.gender === "female" ? "👧" : "👦"}
                        </div>
                      )}
                      <div className="flex flex-col text-left min-w-0">
                        <span className="truncate text-[13px] font-bold text-[#111827]">
                          {c.name}
                        </span>
                        <span className="truncate text-[11px] text-gray-500">
                          {c.classroom?.name || "Siswa"} • NIS {c.nis || "-"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#ECFDF5] text-emerald-600 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isActive ? "Sedang Aktif" : "Di Rumah"}
                    </div>
                  </div>

                  {/* 3 Action Buttons: Absensi, Jemput, Bayar */}
                  <div className="flex gap-2 w-full pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChildId(c.id);
                        navigate("/ortu/attendance");
                      }}
                      className="flex flex-1 items-center justify-center gap-1 bg-[#F0FDF4] py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100/60 transition-colors"
                    >
                      <CalendarCheck size={12} />
                      <span className="text-[11px] font-semibold">Absensi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveChildId(c.id);
                        navigate("/ortu/pickups");
                      }}
                      className="flex flex-1 items-center justify-center gap-1 bg-[#FFF7ED] py-1.5 rounded-lg text-orange-600 hover:bg-orange-100/60 transition-colors"
                    >
                      <Car size={12} />
                      <span className="text-[11px] font-semibold">Jemput</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveChildId(c.id);
                        navigate("/ortu/invoices");
                      }}
                      className="flex flex-1 items-center justify-center gap-1 bg-[#FAF5FF] py-1.5 rounded-lg text-purple-600 hover:bg-purple-100/60 transition-colors"
                    >
                      <CreditCard size={12} />
                      <span className="text-[11px] font-semibold">Bayar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. AUTHORIZED PICKUPS CARD (EXACT FIGMA LAYOUT) */}
          <div className="flex flex-col gap-3 bg-white rounded-[24px] p-4.5 w-full border border-[#E5EFE9] shadow-[0_8px_24px_rgba(12,74,64,0.05)]">
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-[#111827]">
                  Penjemput Sah (QR)
                </span>
                <span className="text-[11px] text-gray-500">
                  Terverifikasi sistem sekolah
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/ortu/pickups")}
                className="flex items-center gap-0.5 text-[11px] font-bold text-[#007BFF]"
              >
                Kelola
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2 w-full">
              {activePickups.length > 0 ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex w-full gap-2">
                    {activePickups.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className="flex flex-1 min-w-0 items-center gap-1.5 rounded-full bg-[#F0FDF4] border border-[#E6F2FF] px-2.5 py-1.5"
                      >
                        <span className="text-xs">
                          {relationshipEmoji(p.relationship)}
                        </span>
                        <span className="truncate text-[11px] font-bold text-[#111827]">
                          {p.name}{" "}
                          <span className="font-normal text-gray-500">
                            ({p.relationship})
                          </span>
                        </span>
                        <CheckCircle
                          size={12}
                          className="ml-auto shrink-0 text-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                  {activePickups.length > 2 && (
                    <div className="flex w-full">
                      <div className="flex min-w-0 items-center gap-1.5 rounded-full bg-[#F0FDF4] border border-[#E6F2FF] px-3 py-1.5">
                        <span className="text-xs">
                          {relationshipEmoji(activePickups[2].relationship)}
                        </span>
                        <span className="truncate text-[11px] font-bold text-[#111827]">
                          {activePickups[2].name}{" "}
                          <span className="font-normal text-gray-500">
                            ({activePickups[2].relationship})
                          </span>
                        </span>
                        <CheckCircle
                          size={12}
                          className="ml-auto shrink-0 text-emerald-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <p className="text-[11px] text-gray-500">{t("ortu.noPickupsRegistered")}</p>
                  <button
                    type="button"
                    onClick={() => navigate("/ortu/pickups")}
                    className="text-[11px] font-bold text-[#007BFF]"
                  >
                    {t("ortu.addPickup")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 5.5. AGENDA MENDATANG — kalender akademik (hari libur/perayaan) yang diinput Admin */}
          <div
            ref={agendaRef}
            className="flex flex-col gap-3 bg-white rounded-[24px] p-4.5 w-full border border-[#E5EFE9] shadow-[0_8px_24px_rgba(12,74,64,0.05)]"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF2F8] text-pink-600">
                <CalendarHeart size={16} />
              </div>
              <span className="text-sm font-bold text-[#111827]">{t("ortu.agendaCardTitle")}</span>
            </div>

            {upcomingAgenda.length === 0 ? (
              <p className="text-center text-[11px] text-gray-500 py-1">{t("ortu.agendaEmpty")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingAgenda.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#F9FCF8] p-2.5">
                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[10px] font-bold text-[#007BFF] border border-gray-100">
                      {formatDate(item.date, { withYear: false })}
                    </div>
                    <span className="truncate text-xs font-medium text-[#111827]">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </ResponsiveShell>
  );
}
