// Mapping kode/slug dari backend (FR-BE-5.3: backend kirim kode, bukan teks) ke
// key i18n `status.*` + tone warna badge, dipakai StatusBadge & widget dashboard.
export const STATUS_TONE = {
  hadir: 'success',
  izin: 'accent',
  sakit: 'primary',
  alpa: 'danger',
  belum_bayar: 'accent',
  lunas: 'success',
  terlambat: 'danger',
  dibatalkan: 'navy',
  pending: 'accent',
  approved: 'success',
  rejected: 'danger',
  revision_requested: 'accent',
  qr: 'primary',
  manual: 'navy',
  active: 'success',
  inactive: 'navy',
  settlement: 'success',
  failed: 'danger',
  expired: 'navy',
  pending_approval: 'accent',
  revoked: 'danger',
  not_started: 'danger',
  partial: 'accent',
  complete: 'success',
  holiday: 'navy',
  no_students: 'navy',
}

export function statusTone(code) {
  return STATUS_TONE[code] ?? 'navy'
}
