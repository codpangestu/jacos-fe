const STORAGE_KEY = 'jacos-user'

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
}

export const ROLE_HOME = {
  admin: '/admin/dashboard',
  guru: '/guru/dashboard',
  orang_tua: '/ortu/dashboard',
  staff: '/staff/dashboard',
}

export const ROLE_LABEL = {
  admin: 'Administrator',
  guru: 'Guru',
  orang_tua: 'Orang Tua/Wali',
  staff: 'Staff',
}

// Subtitle di header sidebar — Figma "Left Organic Curve Sidebar" menulis
// "Admin Portal". Dipetakan per role supaya role lain tidak ikut tertulis
// "Admin". Seperti ROLE_LABEL di atas, teksnya belum lewat i18n.
export const ROLE_PORTAL_LABEL = {
  admin: 'Admin Portal',
  guru: 'Guru Portal',
  orang_tua: 'Orang Tua Portal',
  staff: 'Staff Portal',
}
