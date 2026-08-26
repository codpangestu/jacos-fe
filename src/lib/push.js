const ASKED_KEY = 'jacos-push-permission-asked'

// FR-FE-5.2 — minta izin notifikasi browser sekali setelah login pertama.
// Backend belum punya VAPID key server-side (lihat context.md), jadi langkah
// pushManager.subscribe() + POST /api/push/subscribe menyusul setelah itu
// tersedia — di sini cuma request permission-nya (bagian yang murni FE).
export async function requestPushPermissionOnce() {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return
  if (localStorage.getItem(ASKED_KEY)) return
  if (Notification.permission !== 'default') return

  localStorage.setItem(ASKED_KEY, '1')
  try {
    await Notification.requestPermission()
  } catch {
    // Izin ditolak/gagal — fitur tetap jalan tanpa push (FR-FE-5.2).
  }
}
