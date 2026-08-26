import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, CheckCircle2, RotateCcw } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout'
import { NAV_MENU_GROUPS } from '../../config/navigation'
import { apiGet, apiPostForm } from '../../lib/api'
import { formatTime } from '../../lib/format'
import { getUser } from '../../lib/auth'

export default function SelfAttendance() {
  const { t } = useTranslation()
  const user = getUser()
  const queryClient = useQueryClient()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [photoBlob, setPhotoBlob] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [success, setSuccess] = useState(false)

  const { data } = useQuery({
    queryKey: ['self-attendance', 'today'],
    queryFn: () => apiGet('/api/staff/attendance/today'),
  })
  const attendance = data?.attendance
  const nextAction = !attendance ? 'check-in' : !attendance.check_out_time ? 'check-out' : null

  const mutation = useMutation({
    mutationFn: () => {
      const form = new FormData()
      form.append('photo', photoBlob, 'attendance.jpg')
      return apiPostForm(`/api/staff/attendance/${nextAction === 'check-in' ? 'check-in' : 'check-out'}`, form)
    },
    onSuccess: () => {
      setSuccess(true)
      stopCamera()
      queryClient.invalidateQueries({ queryKey: ['self-attendance'] })
    },
  })

  async function startCamera() {
    setCameraError(null)
    setPhotoBlob(null)
    setPhotoPreview(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      setCameraOn(true)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setCameraError(t('selfAttendance.cameraDenied'))
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  function capture() {
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      setPhotoBlob(blob)
      setPhotoPreview(URL.createObjectURL(blob))
      stopCamera()
    }, 'image/jpeg', 0.9)
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <DashboardLayout
      menuGroups={NAV_MENU_GROUPS[user?.role] ?? []}
      pageTitle={t('selfAttendance.title')}
      showSearch={false}
    >
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-border bg-bg-surface p-6">
        <div className="text-center">
          {attendance?.check_in_time && (
            <p className="text-sm text-text-secondary">
              {t('selfAttendance.checkedInAt', { time: formatTime(attendance.check_in_time) })}
            </p>
          )}
          {attendance?.check_out_time && (
            <p className="text-sm text-text-secondary">
              {t('selfAttendance.checkedOutAt', { time: formatTime(attendance.check_out_time) })}
            </p>
          )}
        </div>

        {success || (!nextAction && attendance?.check_out_time) ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={32} className="text-success-500" />
            <p className="font-semibold text-success-500">
              {success ? t('selfAttendance.success') : t('selfAttendance.doneToday')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl bg-black">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="aspect-square w-full object-cover" />
              ) : cameraOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="aspect-square w-full scale-x-[-1] object-cover" />
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center gap-2 p-8 text-center">
                  <Camera size={32} className="text-white/50" />
                  {cameraError && <p className="text-sm text-white/80">{cameraError}</p>}
                </div>
              )}
            </div>

            {mutation.isError && (
              <p className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-500">
                {mutation.error.message}
              </p>
            )}

            {!photoBlob ? (
              cameraOn ? (
                <button
                  type="button"
                  onClick={capture}
                  className="w-full rounded-xl bg-primary-300 py-3 text-sm font-semibold text-white hover:bg-primary-400"
                >
                  {t('selfAttendance.takePhoto')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full rounded-xl bg-primary-300 py-3 text-sm font-semibold text-white hover:bg-primary-400"
                >
                  {t(nextAction === 'check-in' ? 'selfAttendance.checkIn' : 'selfAttendance.checkOut')}
                </button>
              )
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-semibold text-text-primary hover:bg-bg-page"
                >
                  <RotateCcw size={15} />
                  {t('selfAttendance.retake')}
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate()}
                  className="flex-1 rounded-xl bg-primary-300 py-3 text-sm font-semibold text-white hover:bg-primary-400 disabled:opacity-60"
                >
                  {mutation.isPending
                    ? t('common.processing')
                    : t(nextAction === 'check-in' ? 'selfAttendance.submitCheckIn' : 'selfAttendance.submitCheckOut')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
