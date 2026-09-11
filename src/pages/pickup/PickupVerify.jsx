import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import QrScanner from 'qr-scanner'
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url'
import { AlertTriangle, Camera, CheckCircle2, MessageCircleWarning, QrCode, Search, UserRound } from 'lucide-react'
import ResponsiveShell from '../../layouts/ResponsiveShell'
import { apiGet, apiPost, storageUrl, ApiError } from '../../lib/api'

QrScanner.WORKER_PATH = QrScannerWorkerPath

export default function PickupVerify() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('scan')

  return (
    <ResponsiveShell pageTitle={t('pickup.verifyTitle')} headerVariant="title" showSearch={false}>
      <div className="flex gap-2 rounded-xl bg-bg-page p-1 sm:w-fit">
        <button
          type="button"
          onClick={() => setTab('scan')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'scan' ? 'bg-bg-surface text-primary-300 shadow-sm' : 'text-text-secondary'
          }`}
        >
          <QrCode size={16} />
          {t('pickup.scanTab')}
        </button>
        <button
          type="button"
          onClick={() => setTab('manual')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'manual' ? 'bg-bg-surface text-primary-300 shadow-sm' : 'text-text-secondary'
          }`}
        >
          <Search size={16} />
          {t('pickup.manualTab')}
        </button>
      </div>

      {tab === 'scan' ? <ScanPanel /> : <ManualPanel />}
    </ResponsiveShell>
  )
}

function ScanPanel() {
  const { t } = useTranslation()
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [scanError, setScanError] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [showEscalate, setShowEscalate] = useState(false)
  const [escalateNote, setEscalateNote] = useState('')
  const [escalated, setEscalated] = useState(false)

  const scanMutation = useMutation({
    mutationFn: (token) => apiPost('/api/verify/pickup/scan', { token }),
    onSuccess: (data) => {
      setScanResult(data)
      setScanError(null)
    },
    onError: (err) => {
      setScanError(
        err instanceof ApiError
          ? { message: err.message, reason: err.data?.reason, student: err.data?.student }
          : { message: t('pickup.notRegistered') },
      )
      setScanResult(null)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () => apiPost(`/api/verify/pickup/${scanResult.authorized_pickup_id}/confirm`),
    onSuccess: () => setConfirmed(true),
  })

  const escalateMutation = useMutation({
    mutationFn: () => apiPost('/api/verify/pickup/escalate', { student_id: scanError.student.id, note: escalateNote }),
    onSuccess: () => setEscalated(true),
  })

  useEffect(() => {
    if (!videoRef.current || scanResult) return

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        scanner.pause()
        scanMutation.mutate(result.data)
      },
      { highlightScanRegion: true, highlightCodeOutline: true },
    )
    scannerRef.current = scanner
    scanner.start().catch(() => setCameraError(t('pickup.cameraDenied')))

    return () => {
      scanner.destroy()
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanResult])

  function reset() {
    setScanResult(null)
    setScanError(null)
    setConfirmed(false)
    setShowEscalate(false)
    setEscalateNote('')
    setEscalated(false)
    scanMutation.reset()
    confirmMutation.reset()
    escalateMutation.reset()
    scannerRef.current?.start()
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-black">
        {cameraError ? (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 p-8 text-center">
            <Camera size={32} className="text-white/50" />
            <p className="text-sm text-white/80">{cameraError}</p>
          </div>
        ) : (
          <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
        )}
      </div>

      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        {!scanResult && !scanError && (
          <p className="flex h-full items-center justify-center text-center text-sm text-text-secondary">
            {t('pickup.cameraStarting')}
          </p>
        )}

        {scanError && !escalated && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertTriangle size={32} className="text-danger-500" />
            <p className="font-semibold text-danger-500">{scanError.message || t('pickup.notRegistered')}</p>
            <p className="text-sm text-text-secondary">{t('pickup.notRegisteredHint')}</p>

            {!showEscalate ? (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {scanError.student && (
                  <button
                    type="button"
                    onClick={() => setShowEscalate(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-danger-500 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-500/90"
                  >
                    <MessageCircleWarning size={16} />
                    {t('pickup.contactAdmin')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-page"
                >
                  {t('pickup.scanAnother')}
                </button>
              </div>
            ) : (
              <div className="mt-2 w-full space-y-2 text-left">
                <textarea
                  value={escalateNote}
                  onChange={(e) => setEscalateNote(e.target.value)}
                  placeholder={t('pickup.escalateNotePlaceholder')}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:outline-none"
                />
                {escalateMutation.isError && (
                  <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                    {escalateMutation.error.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!escalateNote || escalateMutation.isPending}
                    onClick={() => escalateMutation.mutate()}
                    className="flex-1 rounded-xl bg-danger-500 py-2.5 text-sm font-semibold text-white hover:bg-danger-500/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {escalateMutation.isPending ? t('common.processing') : t('pickup.escalateSubmit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEscalate(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-page"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {scanError && escalated && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={32} className="text-success-500" />
            <p className="font-semibold text-success-500">{t('pickup.escalateSuccess')}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 rounded-xl bg-primary-300 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-400"
            >
              {t('pickup.scanAnother')}
            </button>
          </div>
        )}

        {scanResult && !confirmed && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {scanResult.pickup_photo_path ? (
                <img
                  src={storageUrl(scanResult.pickup_photo_path)}
                  alt={scanResult.pickup_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-300/12 text-primary-300">
                  <UserRound size={28} />
                </span>
              )}
              <div>
                <p className="font-heading text-base font-bold text-text-primary">{scanResult.pickup_name}</p>
                <p className="text-sm text-text-secondary">{scanResult.relationship}</p>
              </div>
            </div>
            <div className="rounded-xl bg-bg-page px-4 py-3">
              <p className="text-xs text-text-secondary">Siswa</p>
              <p className="font-semibold text-text-primary">{scanResult.student.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => confirmMutation.mutate()}
                disabled={confirmMutation.isPending}
                className="flex-1 rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
              >
                {confirmMutation.isPending ? t('common.processing') : t('pickup.confirmPickup')}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-page"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {confirmed && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={32} className="text-success-500" />
            <p className="font-semibold text-success-500">{t('pickup.confirmSuccess')}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-2 rounded-xl bg-primary-300 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-400"
            >
              {t('pickup.scanAnother')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ManualPanel() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [studentId, setStudentId] = useState(null)
  const [pickupId, setPickupId] = useState('')
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)

  const { data: notPickedUpData } = useQuery({
    queryKey: ['pickup', 'not-picked-up'],
    queryFn: () => apiGet('/api/students/not-picked-up'),
  })
  const students = notPickedUpData?.students ?? []
  const filtered = search ? students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) : students

  const { data: pickupsData } = useQuery({
    queryKey: ['student', studentId, 'authorized-pickups'],
    queryFn: () => apiGet(`/api/students/${studentId}/authorized-pickups`),
    enabled: !!studentId,
  })
  const pickups = pickupsData?.pickups ?? []

  const manualMutation = useMutation({
    mutationFn: () =>
      apiPost('/api/verify/pickup/manual', {
        student_id: studentId,
        authorized_pickup_id: Number(pickupId),
        note,
      }),
    onSuccess: () => setSuccess(true),
  })

  function reset() {
    setStudentId(null)
    setPickupId('')
    setNote('')
    setSuccess(false)
    manualMutation.reset()
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg-surface py-12 text-center">
        <CheckCircle2 size={32} className="text-success-500" />
        <p className="font-semibold text-success-500">{t('pickup.confirmSuccess')}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 rounded-xl bg-primary-300 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-400"
        >
          {t('pickup.scanAnother')}
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="rounded-2xl border border-border bg-bg-surface p-5">
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-bg-page px-3.5 py-2.5">
          <Search size={16} className="text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('pickup.searchStudent')}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-secondary">{t('pickup.allPickedUp')}</p>
        )}

        <ul className="max-h-80 space-y-1 overflow-y-auto">
          {filtered.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => {
                  setStudentId(s.id)
                  setPickupId('')
                }}
                className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                  studentId === s.id ? 'bg-primary-300/12 font-semibold text-primary-300' : 'hover:bg-bg-page text-text-primary'
                }`}
              >
                {s.name}
                <span className="ml-2 text-xs text-text-secondary">{s.classroom?.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-bg-surface p-5">
        {!studentId ? (
          <p className="flex h-full items-center justify-center text-center text-sm text-text-secondary">
            {t('pickup.selectStudent')}
          </p>
        ) : (
          <>
            {pickups.length === 0 ? (
              <p className="rounded-xl bg-bg-page px-4 py-3 text-sm text-text-secondary">
                {t('pickup.noPickupsForStudent')}
              </p>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('pickup.selectPickup')}</label>
                <select
                  value={pickupId}
                  onChange={(e) => setPickupId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-primary-300 focus:outline-none"
                >
                  <option value="">-</option>
                  {pickups.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.relationship})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">{t('pickup.noteRequired')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('pickup.notePlaceholderManual')}
                rows={3}
                className="w-full rounded-xl border border-border bg-bg-page px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-300 focus:outline-none"
              />
            </div>

            {manualMutation.isError && (
              <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                {manualMutation.error.message}
              </p>
            )}

            <button
              type="button"
              disabled={!pickupId || !note || manualMutation.isPending}
              onClick={() => manualMutation.mutate()}
              className="w-full rounded-xl bg-primary-300 py-2.5 text-sm font-semibold text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {manualMutation.isPending ? t('common.processing') : t('pickup.submitManual')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
