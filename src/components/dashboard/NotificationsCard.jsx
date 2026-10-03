import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Check, Clock, Info, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '../../lib/format'

/**
 * Kolom notifikasi — frame Figma "Notifications Column" (node 83:479, 380x270,
 * r24, border #ece7f6 1.2, shadow 0/4/14 #0d1438 @12%). Isinya persis dua kartu
 * bertumpuk seperti Figma:
 *
 * 1. Kartu agenda (Figma: "Swiped Notification Item" 83:486 → "White Event
 *    Card" 83:495, 300x92, r20, padding 11/14, gap 5) — judul 13/700 #0f172a
 *    dengan dot teal 6x6 #2dd4bf, baris deskripsi 10/400 #94a3b8, lalu baris
 *    meta (ikon kalender + tanggal, ikon jam + jam) 10.5/600 #1e293b.
 *    Kartu ini bisa DIGESER (swipe) untuk membuka panel aksi edit/hapus.
 * 2. Kartu notifikasi (Figma: "Message Notification Card" 83:515, 346x86, r20,
 *    padding 11/14, gap 6, shadow 0/3/10 #0d1438 @5%) — judul + baris pengirim
 *    + kotak cuplikan pesan #f3f3fa r8.
 *
 * Panel aksi swipe: di Figma kartu putih 300px duduk di dalam kontainer 344px
 * dengan panel "Action Container" #ebebf7 r20 dan ikon edit/hapus #1e1b4b, jadi
 * 52px panel terlihat. FRAME ITU ADALAH SNAPSHOT DI TENGAH SWIPE (kartu cuma
 * tergeser 8px dari tepi kiri, padahal panel aksinya sudah kebuka 52px). Di sini
 * yang diimplementasikan adalah perilaku sungguhannya: kartu menutup penuh saat
 * tertutup, digeser ke kiri sampai 52px untuk membuka (lihat ACTION_REVEAL),
 * lalu snap ke posisi terdekat saat jari/mouse dilepas.
 *
 * Endpoint agenda/acara belum ada di backend, jadi kartu agenda dirender dengan
 * struktur lengkap tapi mengosongkan diri saat `agenda` null: baris meta
 * disembunyikan, deskripsi jatuh ke pesan "belum ada agenda". Karena itu juga
 * `onAgendaEdit`/`onAgendaDelete` belum dipasang siapa pun — tombol aksinya
 * dirender `disabled` (bukan dihapus, dan bukan handler palsu), mengikuti
 * konvensi yang sama dengan tombol "Broadcast WA" di PickupMonitorCard.
 *
 * Hex Figma yang dipakai (literal, greppable): #ece7f6 (border), #0f172a (judul),
 * #64748b ("Clear"), #94a3b8 (deskripsi & cuplikan), #1e293b (baris meta),
 * #2dd4bf (dot agenda), #ebebf7 (panel aksi), #1e1b4b (ikon aksi), #f3f3fa
 * (kotak cuplikan).
 *
 * Sengaja beda dari Figma:
 * - "•••" di Figma berupa teks; di sini ikon lucide `MoreHorizontal` — pola yang
 *   sama dipakai ClassStatusCard yang mengganti glyph Figma jadi ikon lucide.
 * - Tautan "Lihat semua" di kartu notifikasi tidak ada di Figma; ditambahkan
 *   supaya kartunya bisa dipakai berpindah halaman.
 * - Tombol "Bersihkan" hanya muncul kalau ada notifikasi belum dibaca, sedangkan
 *   Figma selalu menampilkannya.
 */

// Lebar panel aksi yang tersingkap saat kartu digeser penuh (Figma: kontainer
// 344px - kartu putih 300px = 52px, dan lebar grup ikon aksinya 48px).
const ACTION_REVEAL = 52

/**
 * Geser-untuk-membuka. Dipakai kartu agenda supaya aksinya bisa dibuka tanpa
 * tombol tambahan di dalam kartu.
 *
 * `touch-pan-y` dipasang di kartu oleh pemanggil supaya scroll vertikal halaman
 * tetap jalan dan hanya gerakan horizontal yang ditangkap.
 */
function useSwipeReveal(reveal) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef(null)

  const close = () => setOffset(0)
  const open = () => setOffset(-reveal)

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    drag.current = { x: event.clientX, base: offset, moved: false }
  }

  function onPointerMove(event) {
    if (!drag.current) return
    const dx = drag.current.x - event.clientX
    if (Math.abs(dx) > 4) drag.current.moved = true
    setDragging(true)
    setOffset(-Math.min(reveal, Math.max(0, drag.current.base + dx)))
  }

  function finish() {
    if (!drag.current) return
    const moved = drag.current.moved
    drag.current = null
    setDragging(false)
    // Tap tanpa geser bukan swipe — biarkan onClick yang menangani (menutup
    // panel kalau sedang terbuka).
    if (!moved) return
    setOffset((current) => (current < -reveal / 2 ? -reveal : 0))
  }

  useEffect(() => {
    if (offset === 0) return
    function onKeyDown(event) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [offset])

  return {
    offset,
    dragging,
    open,
    close,
    cardProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onPointerLeave: finish,
    },
  }
}

export default function NotificationsCard({
  items = [],
  unread = 0,
  isLoading = false,
  onMarkAllRead,
  onItemClick,
  agenda = null,
  onAgendaEdit,
  onAgendaDelete,
}) {
  const { t } = useTranslation()
  const latest = items[0]
  const payload = latest
    ? typeof latest.data === 'string'
      ? JSON.parse(latest.data)
      : (latest.data ?? {})
    : null

  const { offset, dragging, open, close, cardProps } = useSwipeReveal(ACTION_REVEAL)
  const hasAgendaMeta = Boolean(agenda?.dateLabel || agenda?.timeLabel)

  return (
    <div className="flex flex-col gap-[10px] rounded-3xl border-[1.2px] border-[#ece7f6] bg-bg-surface p-[15px] px-4 shadow-[0_4px_14px_rgba(13,20,56,0.12)] dark:border-border dark:border-solid">
      {/* Header — Figma 83:480: tinggi 19px, judul 16/700, "Clear" 12/500 */}
      <div className="flex h-[19px] shrink-0 items-center justify-between gap-3">
        <h3 className="font-body text-[16px] font-bold leading-[19px] text-[#0f172a] dark:text-text-primary">
          {t('dashboard.notificationsTitle')}
        </h3>
        {unread > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex cursor-pointer items-center gap-[5px] text-[12px] font-medium leading-[15px] text-[#64748b] transition-opacity hover:opacity-70"
          >
            <Check size={12} />
            {t('dashboard.notificationsClear')}
          </button>
        )}
      </div>

      {/* ── Kartu agenda + panel aksi (Figma 83:486) ── */}
      <div className="relative h-[92px] shrink-0 overflow-hidden rounded-[20px]">
        {/* Panel aksi di belakang kartu — Figma "Action Container" 83:487.
            `onFocus` membuka panel supaya aksinya tetap terjangkau keyboard. */}
        <div
          className="absolute inset-0 rounded-[20px] bg-[#ebebf7] dark:bg-white/10"
          onFocus={open}
        >
          <div className="absolute inset-y-0 right-0 flex w-[48px] flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={onAgendaEdit}
              disabled={!onAgendaEdit}
              aria-label={t('common.edit')}
              title={onAgendaEdit ? t('common.edit') : undefined}
              className="flex cursor-pointer items-center justify-center text-[#1e1b4b] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#cbd5e1]"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={onAgendaDelete}
              disabled={!onAgendaDelete}
              aria-label={t('common.delete')}
              title={onAgendaDelete ? t('common.delete') : undefined}
              className="flex cursor-pointer items-center justify-center text-[#1e1b4b] disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#cbd5e1]"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Kartu putih — Figma "White Event Card" 83:495 (tanpa stroke, hanya
            dua drop shadow: 0/4/12 #0d1438 @12% dan 2/12/28 #0d1438 @18%). */}
        <div
          {...cardProps}
          onClick={() => offset !== 0 && close()}
          className={`absolute inset-0 flex touch-pan-y flex-col gap-[5px] rounded-[20px] bg-bg-surface px-[14px] py-[11px] shadow-[0_4px_12px_rgba(13,20,56,0.12),2px_12px_28px_rgba(13,20,56,0.18)] ${
            dragging ? '' : 'transition-transform duration-200'
          }`}
          style={{ transform: `translateX(${offset}px)` }}
        >
          <div className="flex h-4 shrink-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-[6px]">
              <span className="truncate text-[13px] font-bold leading-4 text-[#0f172a] dark:text-text-primary">
                {agenda?.title ?? t('dashboard.agendaUpcoming')}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd4bf]" />
            </div>
            <MoreHorizontal size={16} className="shrink-0 text-[#94a3b8]" />
          </div>

          <p className="truncate text-[10px] leading-3 text-[#94a3b8]">
            {agenda?.description ?? t('dashboard.agendaEmpty')}
          </p>

          {/* Baris meta hanya muncul kalau memang ada acara (Figma 83:502) */}
          {hasAgendaMeta && (
            <div className="flex shrink-0 items-center gap-4">
              {agenda.dateLabel && (
                <span className="flex items-center gap-[5px]">
                  <Calendar size={12} className="shrink-0 text-[#1e293b] dark:text-[#cbd5e1]" />
                  <span className="text-[10.5px] font-semibold leading-[13px] text-[#1e293b] dark:text-[#cbd5e1]">
                    {agenda.dateLabel}
                  </span>
                </span>
              )}
              {agenda.timeLabel && (
                <span className="flex items-center gap-[5px]">
                  <Clock size={12} className="shrink-0 text-[#1e293b] dark:text-[#cbd5e1]" />
                  <span className="text-[10.5px] font-semibold leading-[13px] text-[#1e293b] dark:text-[#cbd5e1]">
                    {agenda.timeLabel}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Kartu notifikasi — Figma 83:515 ── */}
      <div className="flex flex-col gap-[6px] rounded-[20px] border-[1.2px] border-[#ece7f6] bg-bg-surface p-[11px] px-[14px] shadow-[0_3px_10px_rgba(13,20,56,0.05)] dark:border-border dark:border-solid">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[12.5px] font-bold leading-[15px] text-[#0f172a] dark:text-text-primary">
            {payload?.title ?? t('dashboard.notificationsEmpty')}
          </p>
          <MoreHorizontal size={16} className="shrink-0 text-[#94a3b8]" />
        </div>

        {isLoading && <p className="text-[10px] text-[#94a3b8]">{t('common.loading')}</p>}

        {!isLoading && payload && (
          <>
            <div className="flex items-center gap-[5px]">
              <Info size={12} className="shrink-0 text-[#94a3b8]" />
              <span className="truncate text-[10px] font-medium leading-3 text-[#94a3b8]">
                {t('dashboard.notificationFrom', { time: formatDateTime(latest.created_at) })}
              </span>
            </div>
            <div className="rounded-lg bg-[#f3f3fa] p-[6px] px-[10px] dark:bg-white/5">
              <p className="line-clamp-1 text-[9.5px] leading-[11px] text-[#94a3b8]">
                {payload.message ?? payload.body ?? '-'}
              </p>
            </div>
            <Link
              to={payload.url || '/admin/dashboard'}
              onClick={() => !latest.read_at && onItemClick?.(latest.id)}
              className="text-[10px] font-semibold text-primary-fg no-underline hover:underline"
            >
              {t('common.viewAll')}
            </Link>
          </>
        )}

        {!isLoading && !payload && (
          <p className="text-[10px] leading-3 text-[#94a3b8]">{t('dashboard.notificationsEmpty')}</p>
        )}
      </div>
    </div>
  )
}
