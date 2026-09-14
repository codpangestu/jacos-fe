import {
  Baby,
  CalendarCheck,
  Camera,
  CarFront,
  House,
  Receipt,
  ScanQrCode,
  Settings,
  UserRound,
} from 'lucide-react'

// Bottom tab bar untuk shell mobile (MobileAppShell) — dipakai role Orang Tua & Staff saja.
// Admin/Guru tetap pakai NAV_MENU_GROUPS (sidebar) di config/navigation.js, tidak disentuh.
// `label` adalah key i18n SHORT (navShort.*) — sengaja terpisah dari navMenu.* karena
// bottom bar cuma punya ~77px lebar per tab, jadi butuh teks yang lebih pendek
// daripada label sidebar. Di-translate lewat t() di MobileAppShell.
//
// Catatan ikon: pilih glyph yang saling jelas beda di ukuran kecil —
// `Users` (anak, jamak) vs `UserRound` (akun, tunggal) sengaja dipasangkan biar
// tidak ketuker, dan `QrCode` (tampilkan QR, ortu) vs `ScanQrCode` (scan QR, staff)
// membedakan sisi pemilik QR dengan sisi pemindai QR. `central: true` = tombol
// aksi utama di tengah bar (selalu tampil sebagai tombol bundar biru), bukan
// sekadar tab biasa.
export const MOBILE_TABS = {
  orang_tua: [
    { key: 'home',     label: 'navShort.home',     icon: House,     to: '/ortu/dashboard' },
    { key: 'child',    label: 'navShort.child',    icon: Baby,      to: '/ortu/profile-anak' },
    { key: 'pickup',   label: 'navShort.pickup',   icon: CarFront,  to: '/ortu/pickups' },
    { key: 'invoices', label: 'navShort.invoices', icon: Receipt,   to: '/ortu/invoices' },
    { key: 'profile',  label: 'navShort.profile',  icon: Settings,  to: '/ortu/account' },
  ],
  staff: [
    { key: 'home', label: 'navShort.home', icon: House, to: '/staff/dashboard' },
    { key: 'attendance', label: 'navShort.attendance', icon: Camera, to: '/staff/attendance/self' },
    { key: 'verify', label: 'navShort.verify', icon: ScanQrCode, to: '/staff/pickup/verify', central: true },
    { key: 'leave', label: 'navShort.leave', icon: CalendarCheck, to: '/staff/leave-requests' },
    { key: 'profile', label: 'navShort.profile', icon: UserRound, to: '/account/profile' },
  ],
}
