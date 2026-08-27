import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ExternalLink, UserRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, storageUrl } from '../../lib/api'
import { formatCurrency, formatDate, todayInputValue } from '../../lib/format'

const TABS = ['overview', 'attendance', 'pickup', 'finance', 'activity']

export default function AdminStudentDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [tab, setTab] = useState('overview')

  const { data } = useQuery({
    queryKey: ['admin', 'students', id],
    queryFn: () => apiGet(`/api/admin/students/${id}`),
  })
  const student = data?.student

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('students.detailTitle')} showSearch={false}>
      <nav className="flex items-center gap-1.5 text-sm">
        <Link to="/admin/students" className="font-semibold text-primary-300 hover:underline">
          {t('students.title')}
        </Link>
        <ChevronRight size={14} className="text-text-secondary" />
        <span className="truncate text-text-secondary">{student?.name ?? '-'}</span>
      </nav>

      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          {student?.photo_path ? (
            <img src={storageUrl(student.photo_path)} alt={student.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
              <UserRound size={28} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-bold text-text-primary">{student?.name ?? '-'}</h2>
            <p className="text-sm text-text-secondary">
              {student?.nis} · {student?.classroom?.name ?? '-'}
            </p>
          </div>
          {student && <StatusBadge code={student.status} />}
        </div>

        <div className="mt-4 flex gap-1 border-b border-border">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === key ? 'border-b-2 border-primary-300 text-primary-300' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t(`students.tab${key[0].toUpperCase()}${key.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <OverviewTab student={student} />}
      {tab === 'attendance' && <AttendanceTab studentId={id} />}
      {tab === 'pickup' && <PickupTab studentId={id} />}
      {tab === 'finance' && <FinanceTab studentId={id} />}
      {tab === 'activity' && <ActivityTab studentId={id} />}
    </DashboardLayout>
  )
}

function OverviewTab({ student }) {
  const { t } = useTranslation()
  if (!student) return null

  const guardian = student.parents?.[0]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('students.studentInfo')}</h3>
        <dl className="space-y-2 text-sm">
          <Row label={t('students.nis')} value={student.nis} />
          <Row label={t('students.classroom')} value={student.classroom?.name ?? '-'} />
          <Row label={t('students.birthDate')} value={student.birth_date ? formatDate(student.birth_date) : '-'} />
          <Row label={t('students.gender')} value={student.gender ? t(`status.${student.gender}`) : '-'} />
          <Row label={t('students.bloodType')} value={student.blood_type || '-'} />
          <Row label={t('students.address')} value={student.address || '-'} />
          <Row label={t('students.emergencyContact')} value={student.emergency_contact || '-'} />
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('students.guardian')}</h3>
        {guardian ? (
          <div className="space-y-2 text-sm">
            <Row label={t('parents.name')} value={guardian.name} />
            <Row label={t('parents.email')} value={guardian.email} />
            <Row label={t('parents.relationship')} value={guardian.pivot?.relationship || '-'} />
          </div>
        ) : (
          <p className="text-sm text-text-secondary">{t('students.noGuardian')}</p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1.5 last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-right font-medium text-text-primary">{value}</dd>
    </div>
  )
}

function AttendanceTab({ studentId }) {
  const { t } = useTranslation()
  const month = todayInputValue().slice(0, 7)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', studentId, 'attendance', month],
    queryFn: () => apiGet(`/api/admin/students/${studentId}/attendance`, { month }),
  })

  return (
    <div>
      <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('students.recentAttendance')}</h3>
      <DataTable
        loading={isLoading}
        rows={data?.attendances ?? []}
        rowKey={(row) => row.date}
        columns={[
          { key: 'date', label: t('common.date'), render: (row) => formatDate(row.date) },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          { key: 'note', label: t('common.note'), render: (row) => row.note || '-' },
        ]}
      />
    </div>
  )
}

function PickupTab({ studentId }) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', studentId, 'pickups'],
    queryFn: () => apiGet(`/api/admin/students/${studentId}/pickups`),
  })
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['admin', 'students', studentId, 'pickup-logs'],
    queryFn: () => apiGet(`/api/admin/students/${studentId}/pickup-logs`),
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('students.recentPickups')}</h3>
        <DataTable
          loading={isLoading}
          rows={data?.pickups ?? []}
          columns={[
            { key: 'name', label: t('pickup.pickupPerson') },
            { key: 'relationship', label: t('ortu.pickupRelationship') },
            { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
          ]}
        />
      </div>
      <div>
        <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('pickup.logsTitle')}</h3>
        <DataTable
          loading={logsLoading}
          rows={logsData?.data ?? []}
          columns={[
            { key: 'pickup', label: t('pickup.pickupPerson'), render: (row) => row.authorized_pickup?.name ?? '-' },
            { key: 'method', label: t('pickup.method'), render: (row) => <StatusBadge code={row.method} /> },
            { key: 'verified_by', label: t('pickup.verifiedBy'), render: (row) => row.verified_by?.name ?? '-' },
            { key: 'checked_out_at', label: t('pickup.time'), render: (row) => formatDate(row.checked_out_at) },
          ]}
        />
      </div>
    </div>
  )
}

function FinanceTab({ studentId }) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', studentId, 'invoices'],
    queryFn: () => apiGet(`/api/admin/students/${studentId}/invoices`),
  })

  return (
    <div>
      <h3 className="mb-3 font-heading text-sm font-bold text-text-primary">{t('students.recentInvoices')}</h3>
      <DataTable
        loading={isLoading}
        rows={data?.invoices ?? []}
        columns={[
          { key: 'invoice_number', label: t('finance.invoiceNumber') },
          { key: 'period', label: t('finance.period') },
          { key: 'amount', label: t('finance.amount'), render: (row) => formatCurrency(row.amount) },
          { key: 'due_date', label: t('finance.dueDate'), render: (row) => formatDate(row.due_date) },
          { key: 'status', label: t('common.status'), render: (row) => <StatusBadge code={row.status} /> },
        ]}
      />
    </div>
  )
}

function ActivityTab({ studentId }) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', studentId, 'activity'],
    queryFn: () => apiGet('/api/admin/audit-log', { entity_type: 'App\\Models\\Student', entity_id: studentId }),
  })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-text-primary">{t('students.tabActivity')}</h3>
        <Link to="/admin/audit-log" className="flex items-center gap-1 text-xs font-semibold text-primary-300 hover:underline">
          {t('students.viewFullAuditLog')}
          <ExternalLink size={12} />
        </Link>
      </div>
      <p className="mb-3 text-xs text-text-secondary">{t('students.activityHint')}</p>
      <DataTable
        loading={isLoading}
        rows={data?.data ?? []}
        columns={[
          { key: 'action', label: t('auditLog.action') },
          { key: 'user', label: t('auditLog.user'), render: (row) => row.user?.name ?? '-' },
          { key: 'created_at', label: t('common.date'), render: (row) => formatDate(row.created_at) },
        ]}
      />
    </div>
  )
}
