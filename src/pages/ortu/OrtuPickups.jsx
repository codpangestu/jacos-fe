import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  QrCode,
  RotateCw,
  Trash2,
} from "lucide-react";
import ResponsiveShell from "../../layouts/ResponsiveShell";
import FormField from "../../components/ui/FormField";
import Modal from "../../components/ui/Modal";
import useOrtuChildren from "../../hooks/useOrtuChildren";
import { apiDelete, apiGet, apiPostForm, storageUrl } from "../../lib/api";
import { formatDate } from "../../lib/format";
import avatarSantoso from "../../assets/picture/avatar-santoso.png";
import avatarYanto from "../../assets/picture/avatar-yanto.png";

const EMPTY_FORM = { name: "", relationship: "", photo: null };

export default function OrtuPickups() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeChild } = useOrtuChildren();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewingQr, setViewingQr] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selectedPickupId, setSelectedPickupId] = useState(null);

  // Countdown timer (5 minutes = 300s)
  const [secondsLeft, setSecondsLeft] = useState(299);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleRefreshQr = () => {
    setSecondsLeft(300);
    queryClient.invalidateQueries({ queryKey: ["ortu", "pickups"] });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["ortu", "pickups", activeChild?.id],
    queryFn: () => apiGet(`/api/ortu/children/${activeChild.id}/pickups`),
    enabled: !!activeChild,
  });
  const pickups = data?.pickups ?? [];

  const createMutation = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append("name", form.name);
      body.append("relationship", form.relationship);
      if (form.photo) body.append("photo", form.photo);
      return apiPostForm(`/api/ortu/children/${activeChild.id}/pickups`, body);
    },
    onSuccess: () => {
      setShowForm(false);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ["ortu", "pickups"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/api/ortu/pickups/${deleting.id}`),
    onSuccess: () => {
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["ortu", "pickups"] });
    },
  });

  if (!activeChild) return null;

  // Pick the active pickup for display in the main card
  const activePickup =
    pickups.find((p) => p.id === selectedPickupId) ||
    pickups.find((p) => p.status === "active") ||
    pickups[0] ||
    null;

  // Fallback sample list matching Figma if no pickups are configured yet
  const defaultPickups = [
    {
      id: "sample-1",
      name: "Bpk. Santoso",
      relationship: "Ayah",
      status: "active",
      verified: true,
      avatar: avatarSantoso,
      qr_token: `PICKUP-${activeChild.id}-SANTOSO-${Date.now()}`,
    },
    {
      id: "sample-2",
      name: "Bpk. Yanto",
      relationship: "Supir",
      status: "active",
      verified: true,
      avatar: avatarYanto,
      qr_token: `PICKUP-${activeChild.id}-YANTO-${Date.now()}`,
    },
  ];

  const displayedPickups = pickups.length > 0 ? pickups : defaultPickups;
  const currentToken = activePickup?.qr_token || displayedPickups[0]?.qr_token;

  return (
    <ResponsiveShell headerVariant="none" fullBleed showSearch={false} hideTabs>
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
        <div className="flex items-center gap-3 px-4 pt-3 pb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#111827] shadow-sm border-0 cursor-pointer active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-heading text-[20px] font-bold text-[#111827]">
            {t("ortu.pickupsTitle", "Penjemputan")}
          </h1>
        </div>

        {/* ── MAIN CONTENT (358px on mobile) ── */}
        <div className="flex flex-col gap-3 px-4 pb-24">

          {/* ── 1. CARD UTAMA PENJEMPUTAN (358x350) ── */}
          <div className="flex flex-col items-center justify-between rounded-[24px] bg-white p-5 shadow-sm min-h-[350px]">
            {/* Badge Siap */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00C274] px-3.5 py-1 text-[10.5px] font-bold text-white shadow-sm">
              <Check size={12} strokeWidth={3} />
              <span>Siap Dijemput</span>
            </div>

            {/* QR Container */}
            <div className="my-2 flex h-[156px] w-[156px] items-center justify-center rounded-[24px] bg-[#EEF2FF] p-3 shadow-inner ring-4 ring-[#E0E7FF]/60">
              <div className="flex h-[136px] w-[136px] items-center justify-center rounded-[18px] bg-white p-2 shadow-sm">
                {currentToken ? (
                  <QRCodeSVG
                    value={currentToken}
                    size={118}
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                    level="M"
                  />
                ) : (
                  <QrCode size={80} className="text-[#9CA3AF]" />
                )}
              </div>
            </div>

            {/* Timer Column */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-[#64748B]">
                Berlaku hingga
              </span>
              <span className="font-heading text-[28px] font-extrabold tracking-tight text-[#111827] leading-none mt-1">
                {formatTimer(secondsLeft)}
              </span>
            </div>

            {/* Btn Perbarui QR */}
            <button
              type="button"
              onClick={handleRefreshQr}
              className="mt-3 flex h-[42px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#F1F3F9] font-heading text-[12px] font-bold text-[#475569] border-0 cursor-pointer hover:bg-[#E2E8F0] active:scale-[0.98] transition-all"
            >
              <RotateCw size={14} className="text-[#64748B]" />
              <span>Perbarui QR</span>
            </button>
          </div>

          {/* ── 2. SECTION: PENJEMPUT TERDAFTAR ── */}
          <div className="mt-1 flex flex-col gap-2">
            <h2 className="font-heading text-[13px] font-bold text-[#111827] px-1">
              {t("ortu.authorizedPickupsTitle", "Penjemput Terdaftar")}
            </h2>

            {/* List Penjemput */}
            <div className="flex flex-col gap-2.5">
              {displayedPickups.map((p, idx) => {
                const isSelected = (activePickup?.id || displayedPickups[0]?.id) === p.id;
                const avatarSrc =
                  p.photo_path
                    ? storageUrl(p.photo_path)
                    : p.avatar || (idx === 0 ? avatarSantoso : avatarYanto);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPickupId(p.id);
                      setViewingQr(p);
                    }}
                    className={`flex h-[76px] items-center justify-between rounded-[20px] bg-white p-3.5 shadow-sm border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#037EFE]/30 ring-1 ring-[#037EFE]/20"
                        : "border-transparent hover:bg-gray-50/80"
                    }`}
                  >
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-full bg-[#EEF2FF] ring-2 ring-white shadow-sm">
                        <img
                          src={avatarSrc}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          draggable="false"
                        />
                      </div>

                      <div className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate font-heading text-[13px] font-bold text-[#111827]">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-[#6B7280] mt-0.5">
                          {p.relationship}
                        </span>
                        <div className="mt-1 flex items-center">
                          <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#ECFDF5] px-1.5 py-0.5 text-[9px] font-semibold text-[#059669]">
                            <Check size={10} strokeWidth={2.5} />
                            <span>KTP Terverifikasi</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.id && !String(p.id).startsWith("sample") && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleting(p);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#EF4444] hover:bg-red-50 border-0 bg-transparent cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <ChevronRight size={14} className="text-[#9CA3AF]" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── 3. BTN TAMBAH PENJEMPUT (358x46) ── */}
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setShowForm(true);
              }}
              className="mt-1 flex h-[46px] w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] font-heading text-[12.5px] font-bold text-[#475569] cursor-pointer hover:bg-[#F1F5F9] active:scale-[0.98] transition-all"
            >
              <Plus size={16} />
              <span>{t("ortu.addPickup", "Tambah Penjemput")}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── MODAL: TAMBAH PENJEMPUT ── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={t("ortu.addPickup", "Tambah Penjemput")}
        footer={
          <button
            type="button"
            disabled={!form.name || !form.relationship || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="rounded-xl bg-[#037EFE] px-5 py-2 text-sm font-semibold text-white hover:bg-[#006ee6] disabled:opacity-50 border-0 cursor-pointer"
          >
            {createMutation.isPending ? t("common.processing") : t("common.save")}
          </button>
        }
      >
        <FormField
          label={t("ortu.pickupName", "Nama Lengkap")}
          htmlFor="pickup_name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <FormField
          label={t("ortu.pickupRelationship", "Hubungan")}
          htmlFor="pickup_relationship"
          required
          placeholder={t("parents.relationshipPlaceholder", "Misal: Ayah, Ibu, Supir")}
          value={form.relationship}
          onChange={(e) => setForm({ ...form, relationship: e.target.value })}
        />
        <FormField
          label={t("ortu.pickupPhoto", "Foto KTP / Profil")}
          htmlFor="pickup_photo"
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, photo: e.target.files[0] ?? null })}
        />
      </Modal>

      {/* ── MODAL: LIHAT QR DETAIL ── */}
      <Modal
        open={!!viewingQr}
        onClose={() => setViewingQr(null)}
        title={t("ortu.qrTitle", { name: viewingQr?.name })}
      >
        <div className="flex flex-col items-center py-2">
          <p className="text-center text-xs text-[#64748B] mb-4">
            Tunjukkan kode QR ini kepada petugas di gerbang sekolah saat proses penjemputan.
          </p>
          <div className="flex h-56 w-56 items-center justify-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
            <QRCodeSVG
              value={viewingQr?.qr_token || currentToken}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#111827"
              level="M"
            />
          </div>
          <p className="mt-4 text-xs font-semibold text-[#111827]">
            {viewingQr?.name} ({viewingQr?.relationship})
          </p>
        </div>
      </Modal>

      {/* ── MODAL: KONFIRMASI HAPUS ── */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("ortu.deletePickupConfirmTitle", "Hapus Penjemput")}
        description={t(
          "ortu.deletePickupConfirmDescription",
          `Yakin ingin menghapus ${deleting?.name} dari daftar penjemput sah?`
        )}
        footer={
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            className="rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-600 disabled:opacity-60 border-0 cursor-pointer"
          >
            {deleteMutation.isPending ? t("common.processing") : t("common.delete")}
          </button>
        }
      />
    </ResponsiveShell>
  );
}
