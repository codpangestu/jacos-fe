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
export const NAV_MENU_GROUPS = {
  admin: [
    {
      label: 'Menu Utama',
      items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' }],
    },
    {
      label: 'Data Master',
      items: [
        { label: 'Data Siswa', icon: GraduationCap, to: '/admin/students' },
        { label: 'Data Orang Tua/Wali', icon: Users, to: '/admin/parents' },
        { label: 'Data Staff/Guru', icon: UserRound, to: '/admin/staff' },
        { label: 'Kelas/Rombel', icon: School, to: '/admin/classrooms' },
        { label: 'Tahun Ajaran & Kalender', icon: CalendarRange, to: '/admin/academic-years' },
      ],
    },
    {
      label: 'Absensi & Jemput',
      items: [
        { label: 'Rekap Absensi Siswa', icon: UserCheck, to: '/admin/reports/attendance' },
        { label: 'Rekap Absensi Staff', icon: UserCheck, to: '/admin/reports/hr' },
        { label: 'Log Jemput Anak', icon: QrCode, to: '/admin/pickup-logs' },
        { label: 'Pengaturan Cut-off', icon: Clock, to: '/admin/settings/dismissal-cutoff' },
      ],
    },
    {
      label: 'HR',
      items: [{ label: 'Persetujuan Cuti/Izin', icon: CalendarCheck, to: '/admin/leave-requests' }],
    },
    {
      label: 'Keuangan',
      items: [
        { label: 'Dashboard Keuangan', icon: Wallet, to: '/admin/finance/dashboard' },
        { label: 'Daftar Invoice', icon: Receipt, to: '/admin/finance/invoices' },
        { label: 'Pengaturan Biaya SPP', icon: Settings2, to: '/admin/settings/fee-structure' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { label: 'Audit Log', icon: FileClock, to: '/admin/audit-log' },
        { label: 'Status Consent Data Anak', icon: ShieldCheck, to: '/admin/consent-status' },
      ],
    },
  ],
  guru: [
    {
      label: 'Menu Utama',
      items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/guru/dashboard' }],
    },
    {
      label: 'Absensi Siswa',
      items: [
        { label: 'Input Absensi', icon: UserCheck, to: '/guru/attendance' },
        { label: 'Riwayat Absensi', icon: History, to: '/guru/attendance/history' },
      ],
    },
    {
      label: 'Jemput Anak',
      items: [{ label: 'Verifikasi Jemput', icon: QrCode, to: '/guru/pickup/verify' }],
    },
    {
      label: 'Kepegawaian',
      items: [
        { label: 'Absensi Pribadi', icon: Camera, to: '/guru/attendance/self' },
        { label: 'Cuti/Izin', icon: CalendarCheck, to: '/guru/leave-requests' },
      ],
    },
  ],
  staff: [
    {
      label: 'Menu Utama',
      items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/staff/dashboard' }],
    },
    {
      label: 'Jemput Anak',
      items: [{ label: 'Verifikasi Jemput', icon: QrCode, to: '/staff/pickup/verify' }],
    },
    {
      label: 'Kepegawaian',
      items: [
        { label: 'Absensi Pribadi', icon: Camera, to: '/staff/attendance/self' },
        { label: 'Cuti/Izin', icon: CalendarCheck, to: '/staff/leave-requests' },
      ],
    },
  ],
  orang_tua: [
    {
      label: 'Menu Utama',
      items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/ortu/dashboard' }],
    },
    {
      label: 'Anak Saya',
      items: [
        { label: 'Riwayat Absensi', icon: UserCheck, to: '/ortu/attendance' },
        { label: 'Kelola Penjemput', icon: UsersRound, to: '/ortu/pickups' },
        { label: 'Riwayat Jemput', icon: QrCode, to: '/ortu/pickup-history' },
      ],
    },
    {
      label: 'Keuangan',
      items: [
        { label: 'Daftar Tagihan', icon: Receipt, to: '/ortu/invoices' },
        { label: 'Riwayat Pembayaran', icon: Wallet, to: '/ortu/payments/history' },
      ],
    },
  ],
}
