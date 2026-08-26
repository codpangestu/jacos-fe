import {
  CalendarCheck,
  CalendarRange,
  Camera,
  Clock,
  FileClock,
  GraduationCap,
  History,
  LayoutDashboard,
  QrCode,
  Receipt,
  School,
  Settings2,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react'

// Menu sidebar per role, dipakai DashboardLayout — dipisah dari halaman
// masing-masing supaya bisa dipakai bareng oleh layar lintas-role
// (Notification Center, Profile) yang tetap butuh app shell sesuai role login.
// `label` di sini adalah KEY i18n (bukan teks final) — DashboardLayout yang
// men-translate lewat t() saat render, supaya sidebar ikut ganti bahasa.
export const NAV_MENU_GROUPS = {
  admin: [
    {
      label: 'navMenu.main',
      items: [{ label: 'dashboard.title', icon: LayoutDashboard, to: '/admin/dashboard' }],
    },
    {
      label: 'navMenu.dataMaster',
      items: [
        { label: 'navMenu.students', icon: GraduationCap, to: '/admin/students' },
        { label: 'navMenu.parents', icon: Users, to: '/admin/parents' },
        { label: 'navMenu.staff', icon: UserRound, to: '/admin/staff' },
        { label: 'navMenu.classrooms', icon: School, to: '/admin/classrooms' },
        { label: 'navMenu.academicYears', icon: CalendarRange, to: '/admin/academic-years' },
      ],
    },
    {
      label: 'navMenu.attendancePickup',
      items: [
        { label: 'navMenu.studentAttendanceReport', icon: UserCheck, to: '/admin/reports/attendance' },
        { label: 'navMenu.staffAttendanceReport', icon: UserCheck, to: '/admin/reports/hr' },
        { label: 'navMenu.pickupLogs', icon: QrCode, to: '/admin/pickup-logs' },
        { label: 'navMenu.dismissalCutoff', icon: Clock, to: '/admin/settings/dismissal-cutoff' },
      ],
    },
    {
      label: 'navMenu.hr',
      items: [{ label: 'navMenu.leaveApproval', icon: CalendarCheck, to: '/admin/leave-requests' }],
    },
    {
      label: 'navMenu.finance',
      items: [
        { label: 'navMenu.financeDashboard', icon: Wallet, to: '/admin/finance/dashboard' },
        { label: 'navMenu.invoiceList', icon: Receipt, to: '/admin/finance/invoices' },
        { label: 'navMenu.feeSettings', icon: Settings2, to: '/admin/settings/fee-structure' },
      ],
    },
    {
      label: 'navMenu.system',
      items: [
        { label: 'navMenu.auditLog', icon: FileClock, to: '/admin/audit-log' },
        { label: 'navMenu.consentStatus', icon: ShieldCheck, to: '/admin/consent-status' },
      ],
    },
  ],
  guru: [
    {
      label: 'navMenu.main',
      items: [{ label: 'dashboard.title', icon: LayoutDashboard, to: '/guru/dashboard' }],
    },
    {
      label: 'navMenu.studentAttendance',
      items: [
        { label: 'navMenu.attendanceInput', icon: UserCheck, to: '/guru/attendance' },
        { label: 'navMenu.attendanceHistory', icon: History, to: '/guru/attendance/history' },
      ],
    },
    {
      label: 'navMenu.pickupSection',
      items: [{ label: 'navMenu.pickupVerify', icon: QrCode, to: '/guru/pickup/verify' }],
    },
    {
      label: 'navMenu.staffing',
      items: [
        { label: 'navMenu.selfAttendance', icon: Camera, to: '/guru/attendance/self' },
        { label: 'navMenu.leaveRequest', icon: CalendarCheck, to: '/guru/leave-requests' },
      ],
    },
  ],
  staff: [
    {
      label: 'navMenu.main',
      items: [{ label: 'dashboard.title', icon: LayoutDashboard, to: '/staff/dashboard' }],
    },
    {
      label: 'navMenu.pickupSection',
      items: [{ label: 'navMenu.pickupVerify', icon: QrCode, to: '/staff/pickup/verify' }],
    },
    {
      label: 'navMenu.staffing',
      items: [
        { label: 'navMenu.selfAttendance', icon: Camera, to: '/staff/attendance/self' },
        { label: 'navMenu.leaveRequest', icon: CalendarCheck, to: '/staff/leave-requests' },
      ],
    },
  ],
  orang_tua: [
    {
      label: 'navMenu.main',
      items: [{ label: 'dashboard.title', icon: LayoutDashboard, to: '/ortu/dashboard' }],
    },
    {
      label: 'navMenu.myChild',
      items: [
        { label: 'navMenu.attendanceHistory', icon: UserCheck, to: '/ortu/attendance' },
        { label: 'navMenu.managePickups', icon: UsersRound, to: '/ortu/pickups' },
        { label: 'navMenu.pickupHistory', icon: QrCode, to: '/ortu/pickup-history' },
      ],
    },
    {
      label: 'navMenu.finance',
      items: [
        { label: 'navMenu.billList', icon: Receipt, to: '/ortu/invoices' },
        { label: 'navMenu.paymentHistory', icon: Wallet, to: '/ortu/payments/history' },
      ],
    },
  ],
}
