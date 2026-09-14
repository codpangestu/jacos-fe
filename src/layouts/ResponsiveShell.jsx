import { getUser } from '../lib/auth'
import { NAV_MENU_GROUPS } from '../config/navigation'
import { MOBILE_TABS } from '../config/mobileNav'
import DashboardLayout from './DashboardLayout'
import MobileAppShell from './MobileAppShell'

const MOBILE_ROLES = ['orang_tua', 'staff']

/**
 * Wrapper role-aware dipakai oleh SEMUA halaman Ortu/Staff (termasuk yang shared
 * dengan Guru/Admin, mis. PickupVerify/SelfAttendance/LeaveRequests/Profile):
 * Orang Tua & Staff dapat MobileAppShell (kolom sempit ~480px, bottom nav),
 * role lain tetap DashboardLayout (sidebar lebar penuh) — tidak ada perubahan
 * untuk Admin/Guru sama sekali.
 */
export default function ResponsiveShell({
  pageTitle,
  pageSubtitle,
  headerVariant,
  fullBleed = false,
  showSearch = true,
  sidebarAlert,
  rightRail,
  children,
}) {
  const user = getUser()
  const role = user?.role

  if (MOBILE_ROLES.includes(role)) {
    return (
      <MobileAppShell
        tabs={MOBILE_TABS[role] ?? []}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        headerVariant={headerVariant}
        fullBleed={fullBleed}
      >
        {children}
      </MobileAppShell>
    )
  }

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS[role] ?? []}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      showSearch={showSearch}
      sidebarAlert={sidebarAlert}
      rightRail={rightRail}
    >
      {children}
    </DashboardLayout>
  )
}
