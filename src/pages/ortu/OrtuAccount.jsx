import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bell,
  Check,
  ChevronRight,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  MessageSquare,
  Phone,
  QrCode,
  ShieldCheck,
  Sun,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import FormField from "../../components/ui/FormField";
import Modal from "../../components/ui/Modal";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import useDarkMode from "../../hooks/useDarkMode";
import { apiGet, apiPost, logout as apiLogout, ApiError } from "../../lib/api";
import { getUser, clearUser } from "../../lib/auth";
import { setLanguage } from "../../i18n";
import avatarParentImg from "../../assets/picture/avatar-parent.png";

export default function OrtuAccount() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = getUser();
  const { children } = useOrtuChildren();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  const [helpOpen, setHelpOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notifyAnnouncement, setNotifyAnnouncement] = useState(true);
  const [notifyPickup, setNotifyPickup] = useState(true);

  const { data: consentsData } = useQuery({
    queryKey: ["ortu", "consents"],
    queryFn: () => apiGet("/api/ortu/consents"),
  });
  const activeConsents = (consentsData?.consents ?? []).filter(
    (c) => !c.withdrawn_at
  );
  const isPdpaAgreed = activeConsents.length > 0;

  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: () => apiPost("/api/account/change-password", form),
    onSuccess: () => {
      setForm({ current_password: "", password: "", password_confirmation: "" });
      setSuccess(true);
      setErrors({});
    },
    onError: (err) => {
      if (err instanceof ApiError && err.errors) {
        setErrors(
          Object.fromEntries(
            Object.entries(err.errors).map(([k, v]) => [k, v[0]])
          )
        );
      } else {
        setErrors({ current_password: err.message });
      }
    },
  });

  function closePasswordModal() {
    setPasswordOpen(false);
    setSuccess(false);
    setErrors({});
    setForm({ current_password: "", password: "", password_confirmation: "" });
  }

  async function handleLogout() {
    try {
      await apiLogout();
    } finally {
      clearUser();
      navigate("/login");
    }
  }

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === "id" ? "en" : "id";
    setLanguage(nextLang);
  };

  const childrenSummary =
    children.length > 0
      ? `Ibu dari ${children
          .map((c) => `${c.name}${c.classroom?.name ? ` (${c.classroom.name})` : ""}`)
          .join(" & ")}`
      : "Ibu dari Budi (4A) & Siska (1B)";

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
            {t("ortu.accountTopTitle", "Pengaturan")}
          </h1>
        </div>

        {/* ── MAIN CONTENT (358px on mobile, gap 12px) ── */}
        <div className="flex flex-col gap-3 px-4 pb-24">

          {/* ── 1. CARD PROFIL (358x84) ── */}
          <div
            onClick={() => navigate("/account/profile")}
            className="flex h-[84px] w-full items-center justify-between rounded-[20px] p-3.5 border border-white/60 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              background:
                "linear-gradient(135deg, rgba(169,203,254,0.75) 0%, rgba(220,235,255,0.95) 100%)",
            }}
          >
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-full bg-white/80 ring-2 ring-white shadow-sm">
                <img
                  src={avatarParentImg}
                  alt={user?.name ?? "Orang Tua"}
                  className="h-full w-full object-cover"
                  draggable="false"
                />
              </div>

              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-heading text-[15px] font-bold text-[#111827]">
                  {user?.name ?? "Sandra Dewi"}
                </span>
                <span className="truncate text-[10.5px] text-[#475569] mt-0.5">
                  {childrenSummary}
                </span>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[9.5px] font-semibold text-[#16A34A] shadow-xs">
                    <Phone size={9} />
                    <span>{user?.phone ?? "+62 812-3456-7890"}</span>
                  </span>
                </div>
              </div>
            </div>

            <ChevronRight size={14} className="shrink-0 text-[#475569]" />
          </div>

          {/* ── 2. SECTION: KEAMANAN & PRIVASI ── */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-[13px] font-bold text-[#111827] px-1">
              Keamanan & Privasi
            </h2>

            <div className="rounded-[20px] bg-white p-3.5 shadow-sm">
              {/* Item 1: Persetujuan Data (PDPA) */}
              <div
                onClick={() => navigate("/consent/child")}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <ShieldCheck size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Persetujuan Data (PDPA)
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Data Anda aman dan terlindungi
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[9.5px] font-bold text-[#059669]">
                    <Check size={10} strokeWidth={2.5} />
                    <span>{isPdpaAgreed ? "Disetujui" : "Disetujui"}</span>
                  </span>
                  <ChevronRight size={14} className="text-[#9CA3AF]" />
                </div>
              </div>

              <div className="h-px w-full bg-[#F3F4F6] my-1.5" />

              {/* Item 2: Ubah Kata Sandi */}
              <div
                onClick={() => setPasswordOpen(true)}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <Lock size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Ubah Kata Sandi
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Atur kata sandi untuk akun Anda
                    </span>
                  </div>
                </div>

                <ChevronRight size={14} className="text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          {/* ── 3. SECTION: PREFERENSI ── */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-[13px] font-bold text-[#111827] px-1">
              Preferensi
            </h2>

            <div className="rounded-[20px] bg-white p-3.5 shadow-sm">
              {/* Item 1: Notifikasi Pengumuman */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <Bell size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Notifikasi Pengumuman
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Terima update terbaru dari sekolah
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setNotifyAnnouncement(!notifyAnnouncement)}
                  className={`relative flex h-[22px] w-[40px] items-center rounded-full p-0.5 border-0 cursor-pointer transition-colors ${
                    notifyAnnouncement ? "bg-[#037EFE]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                      notifyAnnouncement ? "translate-x-[18px]" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="h-px w-full bg-[#F3F4F6] my-1.5" />

              {/* Item 2: Notifikasi Penjemputan */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <QrCode size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Notifikasi Penjemputan
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Dapatkan notifikasi saat anak dijemput
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setNotifyPickup(!notifyPickup)}
                  className={`relative flex h-[22px] w-[40px] items-center rounded-full p-0.5 border-0 cursor-pointer transition-colors ${
                    notifyPickup ? "bg-[#037EFE]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
                      notifyPickup ? "translate-x-[18px]" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="h-px w-full bg-[#F3F4F6] my-1.5" />

              {/* Item 3: Bahasa */}
              <div
                onClick={handleLanguageToggle}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <Globe size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Bahasa
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Pilih bahasa aplikasi
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <span>{i18n.language === "en" ? "English" : "Indonesia"}</span>
                  <ChevronRight size={14} className="text-[#9CA3AF]" />
                </div>
              </div>

              <div className="h-px w-full bg-[#F3F4F6] my-1.5" />

              {/* Item 4: Tema Aplikasi */}
              <div
                onClick={toggleDarkMode}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <Sun size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Tema Aplikasi
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Mode tampilan (Terang / Gelap)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <span>{isDark ? "Gelap" : "Terang"}</span>
                  <ChevronRight size={14} className="text-[#9CA3AF]" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. SECTION: DUKUNGAN ── */}
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-[13px] font-bold text-[#111827] px-1">
              Dukungan
            </h2>

            <div className="rounded-[20px] bg-white p-3.5 shadow-sm">
              {/* Item 1: Pusat Bantuan & FAQ */}
              <div
                onClick={() => setHelpOpen(true)}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <HelpCircle size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Pusat Bantuan & FAQ
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Temukan jawaban atas pertanyaan Anda
                    </span>
                  </div>
                </div>

                <ChevronRight size={14} className="text-[#9CA3AF]" />
              </div>

              <div className="h-px w-full bg-[#F3F4F6] my-1.5" />

              {/* Item 2: Ajukan Pengaduan (Admin) */}
              <div
                onClick={() => navigate("/ortu/complaints")}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F5F9] text-[#64748B]">
                    <MessageSquare size={16} strokeWidth={2} />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-heading text-[12px] font-bold text-[#111827]">
                      Ajukan Pengaduan (Admin)
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Dapatkan bantuan langsung
                    </span>
                  </div>
                </div>

                <ChevronRight size={14} className="text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          {/* ── 5. BTN KELUAR AKUN (358x42) ── */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="flex h-[42px] w-full items-center justify-between rounded-[16px] bg-[#FEE2E2] px-4 font-heading text-[12px] font-bold text-[#EF4444] border border-red-100 hover:bg-red-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <span>Keluar Akun</span>
            </div>
            <ChevronRight size={14} />
          </button>

        </div>
      </div>

      {/* ── MODAL: UBAH KATA SANDI ── */}
      <Modal
        open={passwordOpen}
        onClose={closePasswordModal}
        title={t("ortu.changePasswordTitle", "Ubah Kata Sandi")}
      >
        {success ? (
          <div className="py-4 text-center text-sm font-semibold text-[#059669]">
            Kata sandi berhasil diperbarui!
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePasswordMutation.mutate();
            }}
            className="space-y-3"
          >
            <FormField
              label={t("account.currentPassword", "Kata Sandi Saat Ini")}
              type="password"
              value={form.current_password}
              onChange={(e) =>
                setForm({ ...form, current_password: e.target.value })
              }
              error={errors.current_password}
              required
            />
            <FormField
              label={t("account.newPassword", "Kata Sandi Baru")}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              required
            />
            <FormField
              label={t("account.confirmPassword", "Konfirmasi Kata Sandi")}
              type="password"
              value={form.password_confirmation}
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
              error={errors.password_confirmation}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closePasswordModal}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 border-0 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-xl bg-[#037EFE] px-4 py-2 text-xs font-bold text-white hover:bg-[#006ee6] disabled:opacity-50 border-0 cursor-pointer"
              >
                {changePasswordMutation.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: PUSAT BANTUAN & FAQ ── */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Pusat Bantuan & FAQ"
      >
        <div className="space-y-3 py-2 text-xs text-[#475569]">
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <h4 className="font-bold text-[#111827] mb-1">
              Bagaimana cara menjemput anak?
            </h4>
            <p>
              Gunakan menu Tab Penjemputan di aplikasi, perlihatkan QR code penjemput
              sah ke satpam gerbang sekolah saat jam pulang.
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <h4 className="font-bold text-[#111827] mb-1">
              Bagaimana cara membayar SPP?
            </h4>
            <p>
              Buka menu Keuangan, pilih tagihan yang belum dibayar, klik tombol
              "Bayar Sekarang" lalu salin nomor Virtual Account yang tertera.
            </p>
          </div>
          <div className="rounded-xl bg-[#F8FAFC] p-3">
            <h4 className="font-bold text-[#111827] mb-1">
              Butuh bantuan lebih lanjut?
            </h4>
            <p>
              Hubungi bagian Tata Usaha sekolah melalui WhatsApp resmi atau menu
              Ajukan Pengaduan.
            </p>
          </div>
        </div>
      </Modal>

      {/* ── MODAL: KONFIRMASI LOGOUT ── */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Keluar dari Akun"
        description="Apakah Anda yakin ingin keluar dari aplikasi JACOS?"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLogoutOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 border-0 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 border-0 cursor-pointer"
            >
              Ya, Keluar
            </button>
          </div>
        }
      />
    </ResponsiveShell>
  );
}
