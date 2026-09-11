import { Camera, CalendarCheck, CircleUserRound, Home, QrCode, Receipt, UserRound } from 'lucide-react'

// Bottom tab bar untuk shell mobile (MobileAppShell) — dipakai role Orang Tua & Staff saja.
// Admin/Guru tetap pakai NAV_MENU_GROUPS (sidebar) di config/navigation.js, tidak disentuh.
// `label` adalah key i18n (sama seperti NAV_MENU_GROUPS), di-translate lewat t() di MobileAppShell.
export const MOBILE_TABS = {
  orang_tua: [
    { key: 'home', label: 'dashboard.title', icon: Home, to: '/ortu/dashboard' },
    { key: 'child', label: 'navMenu.childProfile', icon: UserRound, to: '/ortu/profile-anak' },
    { key: 'pickup', label: 'navMenu.managePickups', icon: QrCode, to: '/ortu/pickups', central: true },
    { key: 'invoices', label: 'navMenu.billList', icon: Receipt, to: '/ortu/invoices' },
    { key: 'profile', label: 'profile.tabLabel', icon: CircleUserRound, to: '/account/profile' },
  ],
  staff: [
    { key: 'home', label: 'dashboard.title', icon: Home, to: '/staff/dashboard' },
    { key: 'attendance', label: 'navMenu.selfAttendance', icon: Camera, to: '/staff/attendance/self' },
    { key: 'verify', label: 'navMenu.pickupVerify', icon: QrCode, to: '/staff/pickup/verify', central: true },
    { key: 'leave', label: 'navMenu.leaveRequest', icon: CalendarCheck, to: '/staff/leave-requests' },
    { key: 'profile', label: 'profile.tabLabel', icon: CircleUserRound, to: '/account/profile' },
  ],
}
