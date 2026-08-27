import { createBrowserRouter } from 'react-router-dom'

import Homepage from './pages/Homepage'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Profile from './pages/common/Profile'
import ConsentChild from './pages/common/ConsentChild'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAttendanceReport from './pages/admin/AdminAttendanceReport'
import AdminAttendanceSubmissionStatus from './pages/admin/AdminAttendanceSubmissionStatus'
import AdminPickupLogs from './pages/admin/AdminPickupLogs'
import AdminPickupApprovals from './pages/admin/AdminPickupApprovals'
import AdminStaff from './pages/admin/AdminStaff'
import AdminHrReport from './pages/admin/AdminHrReport'
import AdminLeaveRequests from './pages/admin/AdminLeaveRequests'
import AdminFeeStructure from './pages/admin/AdminFeeStructure'
import AdminFinanceDashboard from './pages/admin/AdminFinanceDashboard'
import AdminInvoices from './pages/admin/AdminInvoices'
import AdminStudents from './pages/admin/AdminStudents'
import AdminStudentDetail from './pages/admin/AdminStudentDetail'
import AdminParents from './pages/admin/AdminParents'
import AdminClassrooms from './pages/admin/AdminClassrooms'
import AdminAcademicYears from './pages/admin/AdminAcademicYears'
import AdminDismissalSettings from './pages/admin/AdminDismissalSettings'
import AdminAuditLog from './pages/admin/AdminAuditLog'
import AdminConsentStatus from './pages/admin/AdminConsentStatus'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import GuruDashboard from './pages/guru/GuruDashboard'
import GuruAttendance from './pages/guru/GuruAttendance'
import GuruAttendanceHistory from './pages/guru/GuruAttendanceHistory'
import OrtuDashboard from './pages/ortu/OrtuDashboard'
import SelectChild from './pages/ortu/SelectChild'
import OrtuAttendance from './pages/ortu/OrtuAttendance'
import OrtuPickups from './pages/ortu/OrtuPickups'
import OrtuPickupHistory from './pages/ortu/OrtuPickupHistory'
import OrtuInvoices from './pages/ortu/OrtuInvoices'
import OrtuInvoiceDetail from './pages/ortu/OrtuInvoiceDetail'
import OrtuPaymentHistory from './pages/ortu/OrtuPaymentHistory'
import StaffDashboard from './pages/staff/StaffDashboard'
import PickupVerify from './pages/pickup/PickupVerify'
import SelfAttendance from './pages/self-attendance/SelfAttendance'
import LeaveRequests from './pages/leave/LeaveRequests'
import NotFound from './pages/NotFound'
import AuthGuard from './components/AuthGuard'
import RoleGuard from './components/RoleGuard'
import OrtuGuard from './components/OrtuGuard'

const admin = (element) => <RoleGuard role="admin">{element}</RoleGuard>
const guru = (element) => <RoleGuard role="guru">{element}</RoleGuard>
const staff = (element) => <RoleGuard role="staff">{element}</RoleGuard>
const authed = (element) => <AuthGuard>{element}</AuthGuard>
const ortu = (element) => <OrtuGuard>{element}</OrtuGuard>

export const router = createBrowserRouter([
  { path: '/', element: <Homepage /> },
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/account/profile', element: authed(<Profile />) },
  { path: '/consent/child', element: authed(<ConsentChild />) },
  { path: '/admin/dashboard', element: admin(<AdminDashboard />) },
  { path: '/admin/reports/attendance', element: admin(<AdminAttendanceReport />) },
  { path: '/admin/attendance/submission-status', element: admin(<AdminAttendanceSubmissionStatus />) },
  { path: '/admin/pickup-logs', element: admin(<AdminPickupLogs />) },
  { path: '/admin/pickup-approvals', element: admin(<AdminPickupApprovals />) },
  { path: '/admin/staff', element: admin(<AdminStaff />) },
  { path: '/admin/reports/hr', element: admin(<AdminHrReport />) },
  { path: '/admin/leave-requests', element: admin(<AdminLeaveRequests />) },
  { path: '/admin/settings/fee-structure', element: admin(<AdminFeeStructure />) },
  { path: '/admin/finance/dashboard', element: admin(<AdminFinanceDashboard />) },
  { path: '/admin/finance/invoices', element: admin(<AdminInvoices />) },
  { path: '/admin/students', element: admin(<AdminStudents />) },
  { path: '/admin/students/:id', element: admin(<AdminStudentDetail />) },
  { path: '/admin/parents', element: admin(<AdminParents />) },
  { path: '/admin/classrooms', element: admin(<AdminClassrooms />) },
  { path: '/admin/academic-years', element: admin(<AdminAcademicYears />) },
  { path: '/admin/settings/dismissal-cutoff', element: admin(<AdminDismissalSettings />) },
  { path: '/admin/audit-log', element: admin(<AdminAuditLog />) },
  { path: '/admin/consent-status', element: admin(<AdminConsentStatus />) },
  { path: '/admin/announcements', element: admin(<AdminAnnouncements />) },
  { path: '/guru/dashboard', element: guru(<GuruDashboard />) },
  { path: '/guru/attendance', element: guru(<GuruAttendance />) },
  { path: '/guru/attendance/history', element: guru(<GuruAttendanceHistory />) },
  { path: '/guru/pickup/verify', element: guru(<PickupVerify />) },
  { path: '/guru/attendance/self', element: guru(<SelfAttendance />) },
  { path: '/guru/leave-requests', element: guru(<LeaveRequests />) },
  { path: '/ortu/select-child', element: <OrtuGuard requireChildSelection={false}><SelectChild /></OrtuGuard> },
  { path: '/ortu/dashboard', element: ortu(<OrtuDashboard />) },
  { path: '/ortu/attendance', element: ortu(<OrtuAttendance />) },
  { path: '/ortu/pickups', element: ortu(<OrtuPickups />) },
  { path: '/ortu/pickup-history', element: ortu(<OrtuPickupHistory />) },
  { path: '/ortu/invoices', element: ortu(<OrtuInvoices />) },
  { path: '/ortu/invoices/:id', element: ortu(<OrtuInvoiceDetail />) },
  { path: '/ortu/payments/history', element: ortu(<OrtuPaymentHistory />) },
  { path: '/staff/dashboard', element: staff(<StaffDashboard />) },
  { path: '/staff/pickup/verify', element: staff(<PickupVerify />) },
  { path: '/staff/attendance/self', element: staff(<SelfAttendance />) },
  { path: '/staff/leave-requests', element: staff(<LeaveRequests />) },
  { path: '*', element: <NotFound /> },
])
