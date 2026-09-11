import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Versi mobile dari DataTable — list vertikal kartu, bukan tabel lebar.
 * Dipakai di halaman Ortu/Staff (shell mobile, ~480px) tempat DataTable
 * generik (dipertahankan untuk Admin) tidak enak displit di layar sempit.
 */
export default function MobileCardList({
  rows = [],
  loading = false,
  rowKey = (row) => row.id,
  renderRow,
  pagination,
  emptyMessage,
  onRowClick,
}) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
      {loading ? (
        <p className="px-4 py-10 text-center text-sm text-text-secondary">{t('common.loading')}</p>
      ) : rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-text-secondary">{emptyMessage ?? t('common.noData')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={rowKey(row)}>
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="w-full px-4 py-3.5 text-left transition-colors hover:bg-bg-page/60"
                >
                  {renderRow(row)}
                </button>
              ) : (
                <div className="px-4 py-3.5">{renderRow(row)}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {pagination && pagination.lastPage > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
          <span>
            {pagination.currentPage}/{pagination.lastPage}
            {typeof pagination.total === 'number' ? ` • ${pagination.total}` : ''}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="rounded-lg border border-border p-1.5 text-text-primary hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('common.back')}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={pagination.currentPage >= pagination.lastPage}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="rounded-lg border border-border p-1.5 text-text-primary hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t('common.viewAll')}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
