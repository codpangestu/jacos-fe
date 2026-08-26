const STORAGE_KEY = 'jacos-active-child'

export function getStoredActiveChildId() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? Number(raw) : null
}

export function setActiveChildId(id) {
  localStorage.setItem(STORAGE_KEY, String(id))
}

/** Anak aktif: yang tersimpan kalau masih valid, atau satu-satunya anak kalau cuma 1. */
export function resolveActiveChild(children) {
  const stored = getStoredActiveChildId()
  const valid = children.find((c) => c.id === stored)
  if (valid) return valid
  if (children.length === 1) return children[0]
  return null
}
