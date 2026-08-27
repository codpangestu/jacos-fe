import { clearUser } from './auth'

const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  constructor(message, status, errors, data) {
    super(message)
    this.status = status
    this.errors = errors
    this.data = data
  }
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

let csrfReady = null
function ensureCsrfCookie() {
  if (!csrfReady) {
    csrfReady = fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: 'include' })
  }
  return csrfReady
}

async function parseJsonSafe(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function buildQuery(params) {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  const qs = new URLSearchParams(entries).toString()
  return qs ? `?${qs}` : ''
}

async function request(method, path, { json, form, params } = {}) {
  await ensureCsrfCookie()

  const headers = {
    Accept: 'application/json',
    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') ?? '',
  }

  let body
  if (form) {
    body = form
  } else if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  const res = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
    method,
    credentials: 'include',
    headers,
    body,
  })

  const data = await parseJsonSafe(res)

  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    clearUser()
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    throw new ApiError(data?.message ?? 'Sesi berakhir, silakan login kembali.', 401, data?.errors)
  }

  if (!res.ok) {
    const message = data?.errors
      ? Object.values(data.errors).flat().join(' ')
      : (data?.message ?? 'Terjadi kesalahan. Coba lagi.')
    throw new ApiError(message, res.status, data?.errors, data)
  }

  return data
}

export const apiGet = (path, params) => request('GET', path, { params })
export const apiPost = (path, json) => request('POST', path, { json })
export const apiPut = (path, json) => request('PUT', path, { json })
export const apiPatch = (path, json) => request('PATCH', path, { json })
export const apiDelete = (path) => request('DELETE', path)

export const apiPostForm = (path, form) => request('POST', path, { form })
export const apiPatchForm = (path, form) => {
  form.append('_method', 'PATCH')
  return request('POST', path, { form })
}
export const apiPutForm = (path, form) => {
  form.append('_method', 'PUT')
  return request('POST', path, { form })
}

/** Unduh file dari endpoint auth (mis. export CSV) — beda dari request() krn respons bukan JSON. */
export async function downloadFile(path, params, fallbackFilename) {
  await ensureCsrfCookie()

  const res = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
    credentials: 'include',
    headers: { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') ?? '' },
  })

  if (!res.ok) {
    const data = await parseJsonSafe(res)
    throw new ApiError(data?.message ?? 'Gagal mengunduh file.', res.status)
  }

  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = /filename="?([^";]+)"?/i.exec(disposition)
  const filename = match?.[1] ?? fallbackFilename

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function storageUrl(path) {
  if (!path) return null
  return `${API_URL}/storage/${path}`
}

export async function login(email, password) {
  const data = await apiPost('/api/auth/login', { email, password })
  return data.user
}

export async function logout() {
  await apiPost('/api/auth/logout')
}
