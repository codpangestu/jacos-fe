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
