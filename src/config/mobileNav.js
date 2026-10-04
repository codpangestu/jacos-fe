import {
  CalendarCheck,
  Camera,
  CreditCard,
  House,
  ScanQrCode,
  Settings,
  UserRound,
} from 'lucide-react'

// Bottom tab bar untuk shell mobile (MobileAppShell) — dipakai role Orang Tua & Staff saja.
// Admin/Guru tetap pakai NAV_MENU_GROUPS (sidebar) di config/navigation.js, tidak disentuh.
//
// `label` adalah key i18n SHORT (navShort.*) — sengaja terpisah dari navMenu.* karena
// bottom bar cuma punya ~77px lebar per tab, sehingga butuh teks lebih pendek.
// Di-translate lewat t() di MobileAppShell.
//
// Catatan ikon:
//   `UserRound` (akun, tunggal) vs `Users` (anak, jamak) — sengaja beda biar tidak ketuker.
//   `ScanQrCode` (scan QR, staff) vs QrCode (tampilkan QR, ortu) — bedakan sisi pemindai & pemilik.
//   `central: true` = tombol aksi utama di tengah bar (bundar biru), bukan sekadar tab biasa.

export const MOBILE_TABS = {
  // 4 tab Ortu: Beranda / Finance / Profil Anak / Setting (sesuai frame Figma "Tab 1").
  // Tab "Finance" → /ortu/invoices (route lama, label diganti "Bayar").
  orang_tua: [
    { key: 'home',    label: 'navShort.home',    icon: House,      to: '/ortu/dashboard' },
    { key: 'finance', label: 'navShort.finance', icon: CreditCard, to: '/ortu/invoices' },
    { key: 'child',   label: 'navShort.child',   icon: UserRound,  to: '/ortu/profile-anak' },
    { key: 'profile', label: 'navShort.profile', icon: Settings,   to: '/ortu/account' },
  ],

  // 5 tab Staff: Beranda / Absensi / Verifikasi (central) / Izin / Profil.
  staff: [
    { key: 'home',       label: 'navShort.home',       icon: House,         to: '/staff/dashboard' },
    { key: 'attendance', label: 'navShort.attendance', icon: Camera,        to: '/staff/attendance/self' },
    { key: 'verify',     label: 'navShort.verify',     icon: ScanQrCode,    to: '/staff/pickup/verify', central: true },
    { key: 'leave',      label: 'navShort.leave',      icon: CalendarCheck, to: '/staff/leave-requests' },
    { key: 'profile',    label: 'navShort.profile',    icon: UserRound,     to: '/account/profile' },
  ],
}
