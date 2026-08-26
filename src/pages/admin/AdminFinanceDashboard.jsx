import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, FileText, TrendingDown, Wallet } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import StatCard from '../../components/dashboard/StatCard'
import ExportButton from '../../components/ui/ExportButton'
import { apiGet } from '../../lib/api'
import { formatCurrency } from '../../lib/format'

export default function AdminFinanceDashboard() {
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: ['admin', 'finance', 'dashboard'],
    queryFn: () => apiGet('/api/admin/finance/dashboard'),
  })

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('finance.dashboardTitle')} showSearch={false}>
      <div className="flex justify-end">
        <ExportButton />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label={t('finance.totalInvoices')} value={data?.total_invoices ?? '-'} tone="primary" />
        <StatCard icon={Wallet} label={t('finance.totalPaid')} value={formatCurrency(data?.total_paid)} tone="success" />
        <StatCard icon={TrendingDown} label={t('finance.totalOutstanding')} value={formatCurrency(data?.total_outstanding)} tone="danger" />
        <StatCard icon={AlertCircle} label={t('finance.overdueCount')} value={data?.overdue_count ?? '-'} tone="accent" />
      </div>
    </DashboardLayout>
  )
}
