import i18n from '../i18n'

// Backend menyimpan & mengirim waktu dalam Asia/Jakarta (app.timezone), tapi
// Laravel/Carbon selalu menempel akhiran literal "Z" saat serialize ke JSON
// (kuirk Carbon::toJSON(), BUKAN berarti nilainya UTC asli). NFR §7.2 bilang
// frontend tidak boleh konversi timezone sendiri, jadi kita parse angka
// wall-clock-nya langsung tanpa lewat `new Date(isoString)` (yang akan salah
// menggeser jam kalau browser bukan di WIB).
function parseParts(isoString) {
  if (!isoString) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(isoString)
  if (!match) return null
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  }
}

const MONTHS = {
  id: [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
}

const MONTHS_SHORT = {
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const WEEKDAYS_SHORT = {
  id: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

export function weekdaysShort() {
  return WEEKDAYS_SHORT[lang()]
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function lang() {
  return i18n.language === 'en' ? 'en' : 'id'
}

export function formatDate(isoString, { withYear = true } = {}) {
  const p = parseParts(isoString)
  if (!p) return '-'
  const l = lang()
  return withYear
    ? `${p.day} ${MONTHS_SHORT[l][p.month - 1]} ${p.year}`
    : `${p.day} ${MONTHS_SHORT[l][p.month - 1]}`
}

export function formatDateLong(isoString, { withYear = true } = {}) {
  const p = parseParts(isoString)
  if (!p) return '-'
  const l = lang()
  return withYear
    ? `${p.day} ${MONTHS[l][p.month - 1]} ${p.year}`
    : `${p.day} ${MONTHS[l][p.month - 1]}`
}

export function formatTime(isoString) {
  const p = parseParts(isoString)
  if (!p) return '-'
  return `${pad2(p.hour)}:${pad2(p.minute)}`
}

export function formatDateTime(isoString) {
  const p = parseParts(isoString)
  if (!p) return '-'
  return `${formatDate(isoString)}, ${pad2(p.hour)}:${pad2(p.minute)}`
}

export function formatCurrency(amount) {
  const n = Number(amount ?? 0)
  return `Rp ${n.toLocaleString('id-ID')}`
}

export function formatPeriod(period) {
  const match = /^(\d{4})-(\d{2})$/.exec(period ?? '')
  if (!match) return period ?? '-'
  const [, year, month] = match
  return `${MONTHS[lang()][Number(month) - 1]} ${year}`
}

/** Selisih hari kalender (bukan jam) antara hari ini dan sebuah tanggal jatuh tempo. */
export function daysUntil(isoString) {
  const p = parseParts(isoString)
  if (!p) return null
  const due = new Date(p.year, p.month - 1, p.day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

export function toDateInputValue(isoString) {
  const p = parseParts(isoString)
  if (!p) return ''
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`
}

export function toDateTimeLocalValue(isoString) {
  const p = parseParts(isoString)
  if (!p) return ''
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`
}

export function todayInputValue() {
  const now = new Date()
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
}
