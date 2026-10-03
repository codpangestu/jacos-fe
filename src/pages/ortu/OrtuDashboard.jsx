import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Stethoscope,
  CalendarDays,
  CalendarHeart,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import NotificationBell from "../../components/NotificationBell";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiGet } from "../../lib/api";
import { setActiveChildId } from "../../lib/activeChild";
import { formatDate, weekdaysShort } from "../../lib/format";
import { getUser } from "../../lib/auth";
import bannerImg from "../../assets/guide/banner.png";
import banner1 from "../../assets/guide/banner (1).png";
import banner2 from "../../assets/guide/banner (2).png";
import boyVector from "../../assets/picture/boy.svg";
import girlVector from "../../assets/picture/girl.svg";

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
            scrolled ? 'h-[56px]' : 'h-[148px]'
          }`}
        >          {/* Blue header */}
          <div
            className={`absolute top-0 left-0 right-0 rounded-b-[36px] px-5 transition-all duration-300 ease-in-out overflow-hidden ${
              scrolled
                ? 'h-[56px] pt-[calc(env(safe-area-inset-top)+6px)]'
                : 'h-[104px] pt-[calc(env(safe-area-inset-top)+10px)]'
            }`}
            style={{ background: 'linear-gradient(to right, #35AEFC 0%, #007BFF 50%, #003F8A 100%)', boxShadow: '0 4px 16px rgba(0,63,138,0.35)' }}
          >
            {/* Layer circles dekorasi */}
            <div className="pointer-events-none absolute -left-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
            <div className="pointer-events-none absolute -left-4 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            {scrolled ? (
              /* ── Collapsed: satu baris compact ── */
              <div className="flex w-full items-center justify-between h-full pb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E6F2FF] border border-[#66ADFF] text-sm">
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
                <div className="flex items-center gap-2.5 pt-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F2FF] border-2 border-[#66ADFF] text-lg shadow-md">
                    👨‍💼
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-medium text-white/80">
                      Selamat Datang
                    </span>
                    <h1 className="text-[15px] font-bold text-white leading-tight">
                      {user?.name ? `Hi, ${user.name}` : "Hi, Bapak Adi"}
                    </h1>
                  </div>
                </div>
                <NotificationBell variant="hero" className="mt-2" />
              </div>
            )}
          </div>

          {/* Floating Pill — hanya tampil saat expanded */}
          {!scrolled && (
          <div className="absolute bottom-0 left-4 right-4 z-20">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full h-20 items-center justify-between rounded-[20px] bg-white px-4 shadow-[0_8px_24px_rgba(12,74,64,0.12)] border border-[#B0E0E6]/50 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F2FF] border border-[#B0E0E6] overflow-hidden">
                  <img
                    src={currentChild?.gender === "female" ? girlVector : boyVector}
                    alt=""
                    className="h-8 w-8 object-contain"
                    draggable="false"
                  />
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
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F2FF] overflow-hidden">
                            <img
                              src={c.gender === "female" ? girlVector : boyVector}
                              alt=""
                              className="h-7 w-7 object-contain"
                              draggable="false"
                            />
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
          style={{ height: `calc(100vh - ${scrolled ? 56 : 148}px)` }}
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

          {/* 3. WEEKSTRIP — 7 hari, hari aktif pill indigo */}
          <div className="w-full bg-white rounded-[20px] px-4 py-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between gap-1">
              {weekDays.map((day, idx) => {
                const dotColor = day.attended
                  ? 'bg-emerald-400'
                  : day.status === 'izin' || day.status === 'sakit'
                    ? 'bg-orange-400'
                    : day.status === 'alpa'
                      ? 'bg-red-400'
                      : 'bg-gray-300';
                return (
                  <div
                    key={idx}
                    className={`flex flex-1 flex-col items-center gap-1 py-2 rounded-[14px] transition-all ${
                      day.active
                        ? 'bg-[#5B4FCF] shadow-md'
                        : ''
                    }`}
                  >
                    <span className={`text-[10px] font-semibold ${day.active ? 'text-white/80' : 'text-gray-400'}`}>
                      {day.name}
                    </span>
                    <span className={`text-[15px] font-bold leading-tight ${day.active ? 'text-white' : 'text-gray-800'}`}>
                      {day.date}
                    </span>
                    <span className={`h-[7px] w-[7px] rounded-full ${dotColor}`} />
                  </div>
                );
              })}
              {/* chevron kanan */}
              <div className="flex items-center pl-1">
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* 4. CHILD CARD — orange, boy vector menonjol di kiri, status, NIS, 2 tombol */}
          {/* pt-5 memberi ruang untuk vector yang overflow ke atas via negative marginTop */}
          <div className="w-full pt-5 -mt-1 relative">
            <div
              className="w-full rounded-[24px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF9500 100%)', minHeight: 140 }}
            >
              {/* Dekorasi lingkaran */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute right-4 top-10 h-16 w-16 rounded-full bg-white/10" />

              <div className="flex items-end">
                {/* Avatar anak — keluar dari card ke atas via negative margin-top */}
                <div className="relative shrink-0" style={{ width: 118 }}>
                  <img
                    src={currentChild?.gender === 'female' ? girlVector : boyVector}
                    alt=""
                    className="object-contain drop-shadow-xl"
                    style={{ width: 118, height: 148, marginTop: -32, display: 'block' }}
                    draggable="false"
                  />
                </div>

                {/* Info kanan */}
                <div className="flex flex-1 flex-col gap-2.5 min-w-0 py-4 pr-4 pl-2">
                  {/* Status pill */}
                  <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#1A1A1A] px-3 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold text-white whitespace-nowrap">
                      {currentChild?.picked_up_at
                        ? 'Sudah Dijemput'
                        : ["izin","sakit"].includes(currentChild?.today_status)
                          ? 'Sedang Izin'
                          : 'Sedang Aktif di Sekolah'}
                    </span>
                    <ChevronRight size={12} className="text-white/60" />
                  </div>

                  {/* NIS */}
                  <span className="text-[14px] font-semibold text-white/90">
                    NIS: {currentChild?.nis ?? '-'}
                  </span>

                  {/* 2 tombol aksi */}
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => navigate('/ortu/pickups')}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-bold text-white active:opacity-80"
                      style={{ background: '#7C5FF5' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                      Jemput Anak
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/ortu/invoices')}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-bold text-gray-800 bg-white active:opacity-80"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                      Bayar SPP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. BOTTOM ROW — QR card (kiri) + Agenda (kanan) */}
          <div className="flex w-full gap-3 items-stretch">

            {/* QR Penjemput — biru muda */}
            <button
              type="button"
              onClick={() => navigate('/ortu/pickups')}
              className="flex flex-1 flex-col rounded-[20px] p-3.5 text-left"
              style={{ background: '#D6E4FF' }}
            >
              {/* QR box */}
              <div className="mb-2 flex h-[64px] w-[64px] items-center justify-center rounded-[14px] bg-white shadow-sm">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                  {/* QR pattern sederhana */}
                  <rect x="3" y="3" width="16" height="16" rx="2" fill="#111"/>
                  <rect x="6" y="6" width="10" height="10" rx="1" fill="white"/>
                  <rect x="8" y="8" width="6" height="6" fill="#111"/>
                  <rect x="25" y="3" width="16" height="16" rx="2" fill="#111"/>
                  <rect x="28" y="6" width="10" height="10" rx="1" fill="white"/>
                  <rect x="30" y="8" width="6" height="6" fill="#111"/>
                  <rect x="3" y="25" width="16" height="16" rx="2" fill="#111"/>
                  <rect x="6" y="28" width="10" height="10" rx="1" fill="white"/>
                  <rect x="8" y="30" width="6" height="6" fill="#111"/>
                  <rect x="25" y="25" width="4" height="4" fill="#111"/>
                  <rect x="31" y="25" width="4" height="4" fill="#111"/>
                  <rect x="25" y="31" width="4" height="4" fill="#111"/>
                  <rect x="31" y="31" width="4" height="4" fill="#111"/>
                  <rect x="37" y="25" width="4" height="4" fill="#111"/>
                  <rect x="37" y="31" width="4" height="4" fill="#111"/>
                  <rect x="25" y="37" width="4" height="4" fill="#111"/>
                  <rect x="31" y="37" width="4" height="4" fill="#111"/>
                </svg>
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-[11px] text-[#4A6FA5]">Penjemput Sah:</span>
                  <span className="text-[13px] font-bold text-[#1A2B4A] leading-tight">
                    {activePickups[0]?.name ?? 'Belum ada'}
                  </span>
                </div>
                <ChevronRight size={14} className="text-[#4A6FA5] mt-0.5 shrink-0" />
              </div>
              <span className="mt-1 text-[10px] text-[#4A6FA5] leading-snug">
                Tunjukkan QR code ini saat penjemputan
              </span>
            </button>

            {/* Agenda Mendatang */}
            <div ref={agendaRef} className="flex flex-1 flex-col bg-white rounded-[20px] p-3.5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-bold text-[#111827]">Agenda Mendatang</span>
                <button
                  type="button"
                  onClick={() => navigate('/ortu/attendance')}
                >
                  <ChevronRight size={15} className="text-gray-400" />
                </button>
              </div>

              {upcomingAgenda.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-3">{t('ortu.agendaEmpty')}</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {upcomingAgenda.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE9FF]">
                        <CalendarHeart size={14} className="text-[#7C5FF5]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-semibold text-[#111827] leading-tight">
                          {formatDate(item.date, { withYear: false })}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </ResponsiveShell>
  );
}
