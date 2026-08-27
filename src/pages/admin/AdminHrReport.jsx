import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, ShieldAlert } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import DataTable from '../../components/ui/DataTable'
import FilterBar from '../../components/ui/FilterBar'
import ExportButton from '../../components/ui/ExportButton'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import { apiGet, apiPatch, downloadFile } from '../../lib/api'
import { formatDate, formatTime, toDateTimeLocalValue } from '../../lib/format'

export default function AdminHrReport() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [staffId, setStaffId] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState(null)
  const [times, setTimes] = useState({ check_in_time: '', check_out_time: '' })

  const { data: staffData } = useQuery({
    queryKey: ['admin', 'staff', 'all'],
    queryFn: () => apiGet('/api/admin/staff'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'staff-attendances', staffId, page],
    queryFn: () => apiGet('/api/admin/staff-attendances', { staff_id: staffId || undefined, page }),
  })

  const correctMutation = useMutation({
    mutationFn: () =>
      apiPatch(`/api/admin/staff-attendances/${editing.id}`, {
        check_in_time: times.check_in_time || null,
        check_out_time: times.check_out_time || null,
      }),
    onSuccess: () => {
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff-attendances'] })
    },
  })

  function openEdit(row) {
    setTimes({
      check_in_time: toDateTimeLocalValue(row.check_in_time),
      check_out_time: toDateTimeLocalValue(row.check_out_time),
    })
    setEditing(row)
  }

  return (
    <DashboardLayout menuGroups={NAV_MENU_GROUPS.admin} pageTitle={t('hr.reportTitle')}>
      <FilterBar
        filters={[
          {
            key: 'staff',
            type: 'select',
            label: t('staff.title'),
            value: staffId,
            onChange: setStaffId,
            options: [
              { value: '', label: t('common.all') },
              ...(staffData?.data ?? []).map((s) => ({ value: s.id, label: s.name })),
            ],
          },
        ]}
        trailing={
          <ExportButton
            onClick={() => downloadFile('/api/admin/staff-attendances/export', { staff_id: staffId || undefined }, 'rekap-absensi-staff.csv')}
          />
        }
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
          { key: 'staff', label: t('staff.name'), render: (row) => row.staff?.name },
          { key: 'date', label: t('common.date'), render: (row) => formatDate(row.date) },
          {
            key: 'check_in',
            label: t('hr.checkIn'),
            render: (row) =>
              row.check_in_time ? (
                <span className={row.is_late ? 'font-semibold text-danger-500' : ''}>
                  {formatTime(row.check_in_time)}
                  {row.is_late && <span className="ml-1.5 text-xs">({t('hr.late')})</span>}
                </span>
              ) : (
                '-'
              ),
          },
          { key: 'check_out', label: t('hr.checkOut'), render: (row) => (row.check_out_time ? formatTime(row.check_out_time) : '-') },
          {
            key: 'corrected',
            label: t('hr.corrected'),
            render: (row) =>
              row.corrected_by_admin ? <ShieldAlert size={16} className="text-accent-500" title={t('hr.corrected')} /> : '-',
          },
          {
            key: 'actions',
            label: t('common.actions'),
            render: (row) => (
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-primary hover:bg-bg-page"
              >
                <Pencil size={13} />
                {t('common.edit')}
              </button>
            ),
          },
        ]}
      />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t('hr.correctTitle')}
        description={editing?.staff?.name}
        footer={
          <button
            type="button"
            disabled={correctMutation.isPending}
            onClick={() => correctMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {correctMutation.isPending ? t('common.processing') : t('common.save')}
          </button>
        }
      >
        <FormField
          label={t('hr.checkIn')}
          htmlFor="check_in_time"
          type="datetime-local"
          value={times.check_in_time}
          onChange={(e) => setTimes({ ...times, check_in_time: e.target.value })}
        />
        <FormField
          label={t('hr.checkOut')}
          htmlFor="check_out_time"
          type="datetime-local"
          value={times.check_out_time}
          onChange={(e) => setTimes({ ...times, check_out_time: e.target.value })}
        />
      </Modal>
    </DashboardLayout>
  )
}
