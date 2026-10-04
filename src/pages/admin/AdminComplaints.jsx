import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Clock } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet } from '../../lib/api'
import { formatDate } from '../../lib/format'

const TONES = {
  accent: 'text-accent-fg bg-accent-500/12',
  primary: 'text-primary-fg bg-primary-300/12',
  success: 'text-success-fg bg-success-500/12',
  danger: 'text-danger-fg bg-danger-500/12',
}

function SummaryTile({ label, value, tone }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-bg-surface px-4 py-3">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <span className={`w-fit rounded-lg px-2 py-0.5 text-lg font-bold ${TONES[tone] ?? TONES.primary}`}>
        {value}
      </span>
    </div>
  )
}

export default function AdminComplaints() {
  const { t } = useTranslation()
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [overdue, setOverdue] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  // Pencarian ditahan 350ms — tanpa ini tiap ketikan jadi satu request.
  const [debouncedQ, setDebouncedQ] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 350)
    return () => clearTimeout(id)
  }, [q])

  // Setiap kali filter berubah, kembali ke halaman 1 supaya tidak mendarat di
  // halaman yang sudah tidak ada isinya. Dilakukan di handler perubahan filter,
  // bukan lewat useEffect — setState langsung di dalam effect memicu render
  // berantai dan ditandai lint (react/set-state-in-effect).
  function changeFilter(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'complaints', { status, category, priority, overdue, q: debouncedQ, page }],
    queryFn: () =>
      apiGet('/api/admin/complaints', {
        status: status || undefined,
        category: category || undefined,
        priority: priority || undefined,
        overdue: overdue || undefined,
        q: debouncedQ || undefined,
        page,
      }),
  })

  const counts = data?.counts ?? {}

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('complaints.title')}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label={t('complaints.stats.open')} value={counts.open ?? 0} tone="accent" />
        <SummaryTile label={t('complaints.stats.inProgress')} value={counts.in_progress ?? 0} tone="primary" />
        <SummaryTile label={t('complaints.stats.resolved')} value={counts.resolved ?? 0} tone="success" />
        <SummaryTile label={t('complaints.stats.overdue')} value={counts.overdue ?? 0} tone="danger" />
      </div>

      <FilterBar
        filters={[
          {
            key: 'status',
            type: 'select',
            label: t('common.status'),
            value: status,
            onChange: changeFilter(setStatus),
            options: [
              { value: '', label: t('common.all') },
              { value: 'open', label: t('status.open') },
              { value: 'in_progress', label: t('status.in_progress') },
              { value: 'resolved', label: t('status.resolved') },
              { value: 'rejected', label: t('status.rejected') },
            ],
          },
          {
            key: 'category',
            type: 'select',
            label: t('complaints.category'),
            value: category,
            onChange: changeFilter(setCategory),
            options: [
              { value: '', label: t('common.all') },
              { value: 'akademik', label: t('complaints.categories.akademik') },
              { value: 'keuangan', label: t('complaints.categories.keuangan') },
              { value: 'sarana', label: t('complaints.categories.sarana') },
              { value: 'disiplin', label: t('complaints.categories.disiplin') },
              { value: 'lainnya', label: t('complaints.categories.lainnya') },
            ],
          },
          {
            key: 'priority',
            type: 'select',
            label: t('complaints.priority'),
            value: priority,
            onChange: changeFilter(setPriority),
            options: [
              { value: '', label: t('common.all') },
              { value: 'high', label: t('complaints.priorities.high') },
              { value: 'normal', label: t('complaints.priorities.normal') },
              { value: 'low', label: t('complaints.priorities.low') },
            ],
          },
          {
            key: 'overdue',
            type: 'select',
            label: t('complaints.overdue'),
            value: overdue,
            onChange: changeFilter(setOverdue),
            options: [
              { value: '', label: t('common.all') },
              { value: '1', label: t('complaints.overdue') },
            ],
          },
          {
            key: 'q',
            type: 'text',
            label: t('common.search'),
            value: q,
            onChange: changeFilter(setQ),
            placeholder: t('complaints.ticketNo'),
          },
        ]}
      />

      <DataTable
        loading={isLoading}
        rows={data?.data ?? []}
        pagination={{
          currentPage: data?.current_page ?? 1,
          lastPage: data?.last_page ?? 1,
          total: data?.total,
          onPageChange: setPage,
        }}
        columns={[
          {
            key: 'ticket_no',
            label: t('complaints.ticketNo'),
            render: (row) => (
              <Link to={`/admin/complaints/${row.id}`} className="font-mono text-xs font-semibold no-underline">
                {row.ticket_no ?? `#${row.id}`}
              </Link>
            ),
          },
          {
            key: 'subject',
            label: t('complaints.subject'),
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">{row.subject}</span>
                <span className="text-xs text-text-secondary">
                  {t(`complaints.categories.${row.category}`, row.category)}
                </span>
              </div>
            ),
          },
          {
            key: 'submitted_by',
            label: t('complaints.submittedBy'),
            render: (row) => (
              <div className="flex flex-col">
                <span>{row.submitted_by?.name ?? '-'}</span>
                {row.student && <span className="text-xs text-text-secondary">{row.student.name}</span>}
              </div>
            ),
          },
          {
            key: 'priority',
            label: t('complaints.priority'),
            render: (row) => t(`complaints.priorities.${row.priority}`, row.priority),
          },
          {
            key: 'due_at',
            label: t('complaints.dueAt'),
            render: (row) => (
              <span className="flex items-center gap-1.5">
                <span className={row.is_overdue ? 'font-semibold text-danger-fg' : ''}>
                  {row.due_at ? formatDate(row.due_at) : '-'}
                </span>
                {row.is_overdue && (
                  <span title={t('complaints.overdue')}>
                    <AlertTriangle size={14} className="text-danger-500" />
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'status',
            label: t('common.status'),
            render: (row) => (
              <span className="flex items-center gap-1.5">
                <StatusBadge code={row.status} />
                {row.assigned_to?.name && (
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock size={12} />
                    {row.assigned_to.name}
                  </span>
                )}
              </span>
            ),
          },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <Link
                to={`/admin/complaints/${row.id}`}
                className="rounded-lg bg-primary-300/12 px-2.5 py-1.5 text-xs font-semibold text-primary-fg no-underline hover:bg-primary-300/20"
              >
                {t('common.view')}
              </Link>
            ),
          },
        ]}
      />

      {!isLoading && (data?.data?.length ?? 0) === 0 && (
        <p className="text-sm text-text-secondary">{t('complaints.empty')}</p>
      )}
    </DashboardLayout>
  )
}
