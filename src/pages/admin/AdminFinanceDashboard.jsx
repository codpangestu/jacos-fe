import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, FileText, RefreshCw, TrendingDown, Wallet } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import StatCard from '../../components/dashboard/StatCard'
import ProgressCard from '../../components/dashboard/ProgressCard'
import DataTable from '../../components/ui/DataTable'
import ExportButton from '../../components/ui/ExportButton'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPost } from '../../lib/api'
import { downloadCsv } from '../../lib/exportCsv'
import { formatCurrency } from '../../lib/format'

const CHANNEL_COLOR = {
  qris: 'var(--color-primary-300)',
  gopay: 'var(--color-success-500)',
  credit_card: 'var(--color-accent-500)',
  bank_transfer: 'var(--color-primary-900)',
}

export default function AdminFinanceDashboard() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [result, setResult] = useState(null)

  const { data } = useQuery({
    queryKey: ['admin', 'finance', 'dashboard'],
    queryFn: () => apiGet('/api/admin/finance/dashboard'),
  })

  const generateMutation = useMutation({
    mutationFn: () => apiPost('/api/admin/finance/invoices/generate'),
    onSuccess: (res) => {
      setResult(res)
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance'] })
    },
  })

  const byGradeItems = (data?.by_grade ?? []).map((g) => ({
    label: g.grade_level,
    value: g.collection_rate,
    color: 'var(--color-primary-300)',
  }))

  const totalChannelCount = (data?.by_channel ?? []).reduce((sum, c) => sum + c.count, 0)
  const byChannelItems = (data?.by_channel ?? [])
    .filter((c) => c.method)
    .map((c) => ({
      label: t(`finance.channel.${c.method}`, c.method),
      value: totalChannelCount > 0 ? Math.round((c.count / totalChannelCount) * 100) : 0,
      color: CHANNEL_COLOR[c.method] ?? 'var(--color-primary-900)',
    }))

  function handleExport() {
    if (!data) return
    downloadCsv(`dashboard-keuangan-${new Date().toISOString().slice(0, 10)}.csv`, ['Ringkasan', ''], [
      [t('finance.totalInvoices'), data.total_invoices],
      [t('finance.totalPaid'), data.total_paid],
      [t('finance.totalOutstanding'), data.total_outstanding],
      [t('finance.overdueCount'), data.overdue_count],
      [t('finance.collectionRate'), `${data.collection_rate}%`],
      [],
      [t('finance.byGrade'), ''],
      ...(data.by_grade ?? []).map((g) => [g.grade_level, `${g.collection_rate}%`]),
      [],
      [t('finance.trendTitle'), ''],
      [t('finance.trendPeriod'), t('finance.trendBilled'), t('finance.trendPaid'), t('finance.trendRate')],
      ...(data.trend ?? []).map((r) => [r.period, r.billed, r.paid, `${r.collection_rate}%`]),
    ])
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('finance.dashboardTitle')} showSearch={false}>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setResult(null)
            setConfirmOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <RefreshCw size={16} />
          {t('finance.generateInvoices')}
        </button>
        <ExportButton onClick={handleExport} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={FileText} label={t('finance.totalInvoices')} value={data?.total_invoices ?? '-'} tone="primary" />
        <StatCard icon={Wallet} label={t('finance.totalPaid')} value={formatCurrency(data?.total_paid)} tone="success" />
        <StatCard icon={TrendingDown} label={t('finance.totalOutstanding')} value={formatCurrency(data?.total_outstanding)} tone="danger" />
        <StatCard icon={AlertCircle} label={t('finance.overdueCount')} value={data?.overdue_count ?? '-'} tone="accent" />
        <StatCard icon={Wallet} label={t('finance.collectionRate')} value={`${data?.collection_rate ?? 0}%`} tone="navy" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {byGradeItems.length > 0 && <ProgressCard title={t('finance.byGrade')} items={byGradeItems} />}
        {byChannelItems.length > 0 && <ProgressCard title={t('finance.byChannel')} items={byChannelItems} />}
      </div>

      <div>
        <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('finance.trendTitle')}</h3>
        <DataTable
          rows={data?.trend ?? []}
          rowKey={(row) => row.period}
          columns={[
            { key: 'period', label: t('finance.trendPeriod') },
            { key: 'billed', label: t('finance.trendBilled'), render: (r) => formatCurrency(r.billed) },
            { key: 'paid', label: t('finance.trendPaid'), render: (r) => formatCurrency(r.paid) },
            { key: 'rate', label: t('finance.trendRate'), render: (r) => `${r.collection_rate}%` },
          ]}
        />
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('finance.generateConfirmTitle')}
        description={t('finance.generateConfirmBody')}
        footer={
          result ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400"
            >
              {t('common.close')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-border px-5 py-2 text-sm font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={generateMutation.isPending}
                onClick={() => generateMutation.mutate()}
                className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
              >
                {generateMutation.isPending ? t('common.processing') : t('finance.generateSubmit')}
              </button>
            </>
          )
        }
      >
        {result && (
          <div className="space-y-2">
            <p className="rounded-lg bg-success-500/10 px-3 py-2 text-sm text-success-500">
              {result.created > 0
                ? t('finance.generateSuccess', { count: result.created, period: result.period })
                : t('finance.generateNoneNeeded', { period: result.period })}
            </p>
            {result.skipped?.length > 0 && (
              <p className="rounded-lg bg-accent-500/10 px-3 py-2 text-sm text-text-secondary">
                {t('finance.generateSkippedHint', { count: result.skipped.length })}
              </p>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
