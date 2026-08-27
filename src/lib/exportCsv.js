function escapeCell(value) {
  const str = String(value ?? '')
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

/**
 * Export CSV sisi client — dipakai utk layar yang datanya sudah termuat penuh
 * di memory (bukan dipaginasi), jadi tidak perlu bolak-balik ke backend.
 * `headers`: array label kolom. `rows`: array of array nilai per kolom.
 */
export function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
