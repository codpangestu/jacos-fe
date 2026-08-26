import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPost } from '../../lib/api'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function OrtuInvoiceDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['ortu', 'invoice', id],
    queryFn: () => apiGet(`/api/ortu/invoices/${id}/receipt`),
  })

  const payMutation = useMutation({
    mutationFn: () => apiPost(`/api/ortu/invoices/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ortu', 'invoice', id] })
    },
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['ortu', 'invoice', id] })
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.orang_tua} pageTitle={t('ortu.invoiceDetailTitle')} showSearch={false}>
      {isLoading || !invoice ? (
        <p className="py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
      ) : (
        <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-border bg-bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-bold text-text-primary">{invoice.invoice_number}</p>
            <StatusBadge code={invoice.status} />
          </div>

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">{t('finance.period')}</dt>
              <dd className="font-medium text-text-primary">{invoice.period}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">{t('finance.amount')}</dt>
              <dd className="font-heading text-lg font-bold text-primary-300">{formatCurrency(invoice.amount)}</dd>
            </div>
            {invoice.paid_at && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">{t('ortu.receiptPaidAt')}</dt>
                <dd className="font-medium text-text-primary">{formatDateTime(invoice.paid_at)}</dd>
              </div>
            )}
          </dl>

          {invoice.status === 'belum_bayar' && (
            <div className="space-y-3 border-t border-border pt-4">
              <button
                type="button"
                disabled={payMutation.isPending}
                onClick={() => payMutation.mutate()}
                className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
              >
                {payMutation.isPending ? t('common.processing') : t('ortu.payNow')}
              </button>

              {payMutation.isError && (
                <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                  {payMutation.error.message}
                </p>
              )}

              {payMutation.isSuccess && (
                <div className="rounded-xl bg-accent-500/10 p-4 text-xs text-text-secondary">
                  <p className="mb-2 font-medium text-text-primary">{t('ortu.paymentMethodNotReady')}</p>
                  <p className="break-all font-mono">token: {payMutation.data?.token}</p>
                  {payMutation.data?.redirect_url && (
                    <p className="mt-1 break-all font-mono">redirect_url: {payMutation.data.redirect_url}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={refresh}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-medium text-text-secondary hover:bg-bg-page"
          >
            <RefreshCw size={14} />
            {t('ortu.refreshStatus')}
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
