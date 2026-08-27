import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Pencil, Plus, UserCheck, UserX, UserRound, X } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import ExportButton from '../../components/ui/ExportButton'
import FormField from '../../components/ui/FormField'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/ui/StatusBadge'
import { apiGet, apiPostForm, apiPutForm, apiPatch, downloadFile, storageUrl } from '../../lib/api'

const EMPTY_FORM = {
  nis: '',
  name: '',
  classroom_id: '',
  birth_date: '',
  gender: '',
  blood_type: '',
  address: '',
  emergency_contact: '',
  photo: null,
}

export default function AdminStudents() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const [gradeLevelId, setGradeLevelId] = useState('')
  const [classroomId, setClassroomId] = useState('')
  const [gender, setGender] = useState('')
  const [sppStatus, setSppStatus] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [statusTarget, setStatusTarget] = useState(null)

  const { data: classroomsData } = useQuery({
    queryKey: ['admin', 'classrooms'],
    queryFn: () => apiGet('/api/admin/classrooms'),
  })
  const classrooms = classroomsData ?? []

  const { data: gradeLevelsData } = useQuery({
    queryKey: ['admin', 'grade-levels'],
    queryFn: () => apiGet('/api/admin/grade-levels'),
  })
  const gradeLevels = gradeLevelsData?.grade_levels ?? []

  const hasFilters = q || gradeLevelId || classroomId || gender || sppStatus || status

  function clearFilters() {
    setQ('')
    setGradeLevelId('')
    setClassroomId('')
    setGender('')
    setSppStatus('')
    setStatus('')
    setPage(1)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'students', q, gradeLevelId, classroomId, gender, sppStatus, status, page],
    queryFn: () =>
      apiGet('/api/admin/students', {
        q: q || undefined,
        grade_level_id: gradeLevelId || undefined,
        classroom_id: classroomId || undefined,
        gender: gender || undefined,
        spp_status: sppStatus || undefined,
        status: status || undefined,
        page,
      }),
  })
  const students = data?.data ?? []
  const total = data?.total ?? 0
  const lastPage = data?.last_page ?? 1
  const from = data?.from ?? 0
  const to = data?.to ?? 0

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') body.append(k, v)
      })
      return editing ? apiPutForm(`/api/admin/students/${editing.id}`, body) : apiPostForm('/api/admin/students', body)
    },
    onSuccess: () => {
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: () => apiPatch(`/api/admin/students/${statusTarget.id}/status`, {
      status: statusTarget.status === 'active' ? 'inactive' : 'active',
    }),
    onSuccess: () => {
      setStatusTarget(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] })
    },
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(row) {
    setForm({
      nis: row.nis,
      name: row.name,
      classroom_id: row.classroom_id ?? '',
      birth_date: row.birth_date ?? '',
      gender: row.gender ?? '',
      blood_type: row.blood_type ?? '',
      address: row.address ?? '',
      emergency_contact: row.emergency_contact ?? '',
      photo: null,
    })
    setEditing(row)
    setShowForm(true)
  }

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS.admin}
      pageTitle={t('students.title')}
      pageSubtitle={!isLoading ? t('students.matchCount', { count: students.length, total }) : undefined}
    >
      <div className="flex justify-end gap-2">
        <ExportButton
          onClick={() =>
            downloadFile(
              '/api/admin/students/export',
              {
                q: q || undefined,
                grade_level_id: gradeLevelId || undefined,
                classroom_id: classroomId || undefined,
                gender: gender || undefined,
                spp_status: sppStatus || undefined,
                status: status || undefined,
              },
              'data-siswa.csv'
            )
          }
        />
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-primary-300 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-400"
        >
          <Plus size={16} />
          {t('students.add')}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-surface">
        {/* Filter header — menyatu dalam 1 card, meniru layout jacos-react admin/Students.jsx */}
        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <FormField
            htmlFor="q"
            placeholder={t('students.searchPlaceholder')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className="w-full max-w-[280px]"
          />
          <div className="ml-auto flex flex-wrap gap-2">
            <select
              value={gradeLevelId}
              onChange={(e) => {
                setGradeLevelId(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
            >
              <option value="">{t('students.filterGrade')}</option>
              {gradeLevels.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              value={classroomId}
              onChange={(e) => {
                setClassroomId(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
            >
              <option value="">{t('students.filterClassroom')}</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={sppStatus}
              onChange={(e) => {
                setSppStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
            >
              <option value="">{t('students.filterSpp')}</option>
              <option value="belum_bayar">{t('status.belum_bayar')}</option>
              <option value="lunas">{t('status.lunas')}</option>
              <option value="terlambat">{t('status.terlambat')}</option>
            </select>
            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
            >
              <option value="">{t('students.filterGender')}</option>
              <option value="male">{t('status.male')}</option>
              <option value="female">{t('status.female')}</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
            >
              <option value="">{t('students.filterStatus')}</option>
              <option value="active">{t('status.active')}</option>
              <option value="inactive">{t('status.inactive')}</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text-secondary hover:bg-bg-page"
              >
                <X size={14} />
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <p className="px-5 py-16 text-center text-sm text-text-secondary">{t('common.loading')}</p>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-5 py-16 text-center">
            <p className="font-heading text-sm font-bold text-text-primary">{t('students.noMatch')}</p>
            <p className="text-sm text-text-secondary">{t('students.noMatchHint')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-page/60 text-left text-xs font-semibold tracking-wide text-text-secondary uppercase">
                    <th className="px-4 py-3 whitespace-nowrap">{t('students.nis')}</th>
                    <th className="px-4 py-3 whitespace-nowrap">{t('students.name')}</th>
                    <th className="px-4 py-3 whitespace-nowrap">{t('students.classroom')}</th>
                    <th className="px-4 py-3 whitespace-nowrap">{t('students.guardian')}</th>
                    <th className="px-4 py-3 whitespace-nowrap">{t('students.todayStatus')}</th>
                    <th className="px-4 py-3 text-right whitespace-nowrap">{t('students.attendanceRate')}</th>
                    <th className="px-4 py-3 whitespace-nowrap">{t('students.sppStatus')}</th>
                    <th className="px-4 py-3 whitespace-nowrap">{t('common.actions')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-bg-page/50"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">{s.nis}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {s.photo_path ? (
                            <img src={storageUrl(s.photo_path)} alt={s.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          ) : (
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                s.gender === 'female' ? 'bg-accent-500/12 text-accent-500' : 'bg-primary-300/12 text-primary-300'
                              }`}
                            >
                              {s.name
                                ? s.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                                : <UserRound size={14} />}
                            </span>
                          )}
                          <b className="whitespace-nowrap text-text-primary">{s.name}</b>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-primary">
                        {s.classroom ? `${s.classroom.name} · ${s.classroom.grade_level?.name ?? ''}` : '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-primary">{s.parent_name ?? '-'}</td>
                      <td className="px-4 py-3.5">
                        {s.today_status ? <StatusBadge code={s.today_status} /> : <span className="text-text-secondary">-</span>}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-text-primary">
                        {s.attendance_rate !== null ? `${s.attendance_rate}%` : '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        {s.spp_status ? <StatusBadge code={s.spp_status} /> : <span className="text-text-secondary">-</span>}
                      </td>
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            title={t('common.edit')}
                            onClick={() => openEdit(s)}
                            className="rounded-lg border border-border p-1.5 text-text-primary hover:bg-bg-page"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            title={t(s.status === 'active' ? 'students.deactivate' : 'students.activate')}
                            onClick={() => setStatusTarget(s)}
                            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold ${
                              s.status === 'active'
                                ? 'bg-danger-500/12 text-danger-500 hover:bg-danger-500/20'
                                : 'bg-success-500/12 text-success-500 hover:bg-success-500/20'
                            }`}
                          >
                            {s.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                            {t(s.status === 'active' ? 'students.deactivate' : 'students.activate')}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-text-secondary">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-bg-page/40 px-4 py-3 text-sm text-text-secondary">
              <span>{t('students.showingRange', { from, to, total })}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-border p-1.5 text-text-primary hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t('common.back')}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="tabular-nums">{t('students.pageOf', { page, last: lastPage })}</span>
                <button
                  type="button"
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-border p-1.5 text-text-primary hover:bg-bg-page disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t('common.viewAll')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? t('students.edit') : t('students.add')}
        footer={
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-primary-300 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
          >
            {t('common.save')}
          </button>
        }
      >
        <FormField
          label={t('students.nis')}
          htmlFor="nis"
          required
          disabled={!!editing}
          value={form.nis}
          onChange={(e) => setForm({ ...form, nis: e.target.value })}
        />
        <FormField label={t('students.name')} htmlFor="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <FormField
          as="select"
          label={t('students.classroom')}
          htmlFor="classroom_id"
          value={form.classroom_id}
          onChange={(e) => setForm({ ...form, classroom_id: e.target.value })}
        >
          <option value="">-</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FormField>
        <FormField
          label={t('students.birthDate')}
          htmlFor="birth_date"
          type="date"
          value={form.birth_date}
          onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
        />
        <FormField
          as="select"
          label={t('students.gender')}
          htmlFor="gender"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">-</option>
          <option value="male">{t('status.male')}</option>
          <option value="female">{t('status.female')}</option>
        </FormField>
        <FormField
          label={t('students.bloodType')}
          htmlFor="blood_type"
          value={form.blood_type}
          onChange={(e) => setForm({ ...form, blood_type: e.target.value })}
        />
        <FormField
          label={t('students.address')}
          htmlFor="address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <FormField
          label={t('students.emergencyContact')}
          htmlFor="emergency_contact"
          value={form.emergency_contact}
          onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
        />
        <FormField
          label={t('students.photo')}
          htmlFor="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, photo: e.target.files[0] ?? null })}
        />
      </Modal>

      <Modal
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        title={t(statusTarget?.status === 'active' ? 'students.deactivateConfirmTitle' : 'students.activateConfirmTitle')}
        description={statusTarget?.status === 'active' ? t('students.deactivateConfirmDescription') : undefined}
        footer={
          <button
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => statusMutation.mutate()}
            className="rounded-xl bg-danger-500 px-5 py-2 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:opacity-60"
          >
            {statusMutation.isPending ? t('common.processing') : t('common.confirm')}
          </button>
        }
      />
    </DashboardLayout>
  )
}
