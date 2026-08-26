import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Tabel generik dipakai di layar list/CRUD Admin & riwayat Guru/Staff.
 * `rows` selalu array polos — kalau sumbernya paginator Laravel, ekstrak
 * `.data` di pemanggil dan teruskan `pagination` terpisah untuk kontrolnya.
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  rowKey = (row) => row.id,
  pagination,
  emptyMessage,
}) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-page/60 text-left text-xs font-semibold tracking-wide text-text-secondary uppercase">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-text-secondary">
                  {t('common.loading')}
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-text-secondary">
                  {emptyMessage ?? t('common.noData')}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-bg-page/50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text-primary">
                      {col.render ? col.render(row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.lastPage > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
          <span>
            {t('common.page', { defaultValue: 'Halaman' })} {pagination.currentPage}/{pagination.lastPage}
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
