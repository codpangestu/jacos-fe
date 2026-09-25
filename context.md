# Context — Frontend JACOS

Dokumen ini adalah **turunan scoped-frontend** dari `../context.md` (root). Root context.md tetap source of truth untuk sejarah lengkap proyek (PRD, keputusan desain, backend, seeding data) — baca root context.md dulu kalau butuh gambaran penuh proyek atau kerja lintas backend/frontend. Dokumen ini isinya ringkasan yang relevan **khusus buat kerja di dalam folder `frontend/`**, plus temuan & keputusan desain terbaru.

---

## Stack & Setup

- React 19 + Vite 8 (JS murni, bukan TS — meski `@types/react` terpasang buat editor intellisense saja).
- **Tailwind CSS v4** (`@tailwindcss/vite`, bukan config file `tailwind.config.js` — semua token didefinisikan via `@theme` langsung di `src/index.css`).
- `react-router-dom` v7 (`createBrowserRouter`, semua route didaftarkan manual di `src/router.jsx` — tidak ada file-based routing).
- `@tanstack/react-query` v5 — dipasang via `QueryClientProvider` di `App.jsx`, dipakai di hampir semua halaman utk fetch data.
- `react-i18next` — bilingual ID/EN penuh, lihat bagian i18n di bawah.
- `qr-scanner` (scan kamera QR) + `qrcode.react` (generate QR) — dipakai di alur Jemput Anak.
- `vite-plugin-pwa` — manifest + service worker aktif.
- `lucide-react` — satu-satunya icon set yang dipakai, jangan campur dgn library ikon lain.
- Lint: `npm run lint` → `oxlint` (bukan ESLint). Build: `npm run build`. Dev: `npm run dev` (port 5173).
- `.env`: `VITE_API_URL` (base URL backend, default `http://localhost:8000`).
- Backend harus jalan bareng (`php artisan serve` di `:8000`) — CSRF-cookie flow Sanctum SPA butuh backend hidup, tidak bisa dites frontend-only.

---

## Struktur Direktori (`src/`)

```
pages/            — 1 file per layar, dikelompokkan per role: admin/, guru/, ortu/, staff/,
                    auth/, common/ (Profile, ConsentChild — dipakai lintas-role),
                    pickup/ (PickupVerify, dipakai guru & staff — shared component),
                    self-attendance/ (SelfAttendance, idem), leave/ (LeaveRequests, idem)

layouts/          — 3 file aktif:
                    DashboardLayout.jsx  — sidebar app shell, Admin/Guru
                    MobileAppShell.jsx   — shell mobile-first Orang Tua & Staff
                                           (header putih bersih + bottom tab bar, max-w-480px)
                    ResponsiveShell.jsx  — wrapper role-aware: Ortu/Staff → MobileAppShell,
                                           Admin/Guru → DashboardLayout

components/       — RoleGuard, AuthGuard, OrtuGuard (route guards);
                    NotificationBell + NotificationDrawer; LanguageSwitcher;
                    Navbar (Homepage publik saja, bukan dashboard);
                    dashboard/ (StatCard, ProgressCard, ChartCard, ListCard,
                                HighlightCard, TableCard, ActivityTimelineCard,
                                GreetingBanner, QuickActions, AttendanceByClassCard,
                                FinanceSummaryCard);
                    ortu/ (ActiveChildBar, ChildOverviewCard);
                    ui/ (DataTable, Drawer, ExportButton, FilterBar, FormField,
                         Modal, StatusBadge)

config/           — navigation.js (NAV_MENU_GROUPS sidebar per role),
                    mobileNav.js (MOBILE_TABS bottom-nav Ortu & Staff)

lib/              — api.js, auth.js, activeChild.js, format.js, statusLabels.js,
                    exportCsv.js, push.js

hooks/            — useDarkMode, useOrtuChildren

i18n/             — index.js + locales/{id,en}.json
```

---

## Routing & Guard Pattern (`router.jsx`)

Helper per-role membungkus elemen: `admin()`, `guru()`, `staff()` → `<RoleGuard role="...">`, `authed()` → `<AuthGuard>`, `ortu()` → `<OrtuGuard>`. `OrtuGuard` punya 2 tugas ekstra: redirect ke `/consent/child` kalau ada anak belum consent, dan ke `/ortu/select-child` kalau >1 anak belum ada yang dipilih aktif.

**41 route utama** terdaftar — Homepage publik `/`, auth `/login|/forgot-password|/reset-password`, per-role prefix `/admin/*`, `/guru/*`, `/ortu/*`, `/staff/*`, plus route lintas-role (`/account/profile`, `/consent/child`). Halaman shared (`PickupVerify`, `SelfAttendance`, `LeaveRequests`) di-mount 2x dengan guard beda tapi satu file yang sama.

---

## Design Tokens (`src/index.css`)

Semua di `@theme` block:

| Token | Nilai | Keterangan |
|---|---|---|
| `primary-100` | `#35AEFC` | Biru terang |
| `primary-200` | `#33A6F2` | |
| `primary-300` | `#2D94DA` | Warna utama CTA |
| `primary-400` | `#2782C1` | |
| `primary-900` | `#0C2B4C` | Navy gelap |
| `accent-500` | `#F59E0B` | Amber (approved, di luar brand resmi) |
| `success-500` | `#22C55E` | |
| `danger-500` | `#EF4444` | |
| `primary-fg` | `#1F6FA8` / dark `#69B3E6` | **Teks & ikon di atas tint 12%** (badge, chip, link) |
| `accent-fg` | `#92400E` / dark `#FCD34D` | idem |
| `success-fg` | `#166534` / dark `#86EFAC` | idem |
| `danger-fg` | `#991B1B` / dark `#FCA5A5` | idem |
| `neutral-fg` | `#475569` / dark `#CBD5E1` | idem |

**Aturan kontras (dari audit 2026-09-18):** shade 500 **jangan** dipakai sebagai teks/ikon di atas tint 12%-nya sendiri — hasil ukurnya 1.96–3.76:1, di bawah ambang AA (4.5:1 untuk teks, 3:1 untuk elemen non-teks), dan itu sempat jadi temuan P1. Pakai token `*-fg` yang auto-swap lewat `.dark` sehingga komponen **tidak perlu** varian `dark:` sendiri; ketiadaan varian dark itulah mode kegagalan yang sudah terbukti (`TableCard.STATUS_TONE` sebelumnya tidak punya varian dark sama sekali).

**Pengecualian penting:** di atas latar yang **tidak ikut ganti tema** (mis. pill putih CTA `HighlightCard`) pakai nilai tetap seperti `primary-900`, karena token `*-fg` berbalik jadi terang di dark dan justru gagal (terukur 2.06:1).

**Catatan pengukuran:** kontras harus dihitung terhadap backdrop tempat elemen benar-benar berada, bukan terhadap putih. Kesalahan ini pernah terjadi (ikon chip primary diukur ke putih → dikira 3.30:1, padahal di atas tint chip-nya 2.90:1).

**Sidebar tokens** (dipakai `DashboardLayout`): `bg-sidebar`, `sidebar-text`, `sidebar-text-muted`, `sidebar-border`, `sidebar-active-bg`, `sidebar-active-text`, `sidebar-hover-bg` — di-override di `.dark {}` supaya sidebar flip navy di dark mode (light mode sidebar putih, dark mode sidebar navy).

> **Konflik yang belum diputuskan (ditemukan 2026-09-18):** root `context.md` dan `PRODUCT.md` menyatakan sidebar **"selalu navy di kedua tema"**, sedangkan implementasi (dan dokumen ini) menyebut light mode = putih **secara sengaja**. Komentar di `index.css` juga masih menulis "always navy". Salah satu dari keduanya harus diperbaiki — belum diputuskan user.

Dark mode berbasis **class** (`@custom-variant dark`), toggle via `useDarkMode.js` (localStorage persist).

Font: **Plus Jakarta Sans** (`font-heading`) + **Inter** (`font-body`) via Google Fonts.

---

## Layout System — 2 Shell (PENTING)

### `DashboardLayout` — Admin & Guru
- Sidebar kiri persisten (collapsible `lg:w-64` / `lg:w-18`)
- **Light mode sidebar: putih** dengan teks gelap, active item biru solid + chevron kanan
- **Dark mode sidebar: navy** `#0C2B4C` dengan teks putih
- Topbar sticky: judul halaman + subtitle, search bar pill (+ mic icon), theme toggle sun/moon, notif bell, user avatar + nama + role
- **Theme toggle sun**: saat light mode aktif, ikon Sun punya background putih + shadow + warna amber (`text-accent-500`) — persis referensi Academix
- Right rail (opsional, 320px) dan sidebar alert card (opsional gradient biru) diisi per-halaman via props
- Dipakai: semua halaman `/admin/*` dan `/guru/*`

### `MobileAppShell` — Orang Tua & Staff
- Max-w 480px, ter-center di semua breakpoint (bukan hanya mobile)
- **Header putih bersih** dengan border bottom tipis — tidak ada gradient
- Kiri: avatar inisial dengan gradient ring + green dot (online indicator)
- Tengah: judul halaman
- Kanan: theme toggle (rounded-full bg-bg-page) + NotificationBell
- Back button muncul saat `headerVariant="title"` (halaman bukan dashboard)
- **Bottom tab bar**: 5 tab, tab aktif punya dot indicator kecil di pojok atas kanan icon + background pill `bg-primary-300/12`, tab tengah elevated floating button gradient biru
- Dipakai via `ResponsiveShell` — semua halaman `/ortu/*` dan `/staff/*`

### `ResponsiveShell`
- Wrapper role-aware: cek `user.role`, kalau `orang_tua` atau `staff` render `MobileAppShell`, selain itu `DashboardLayout`
- Dipakai oleh semua halaman Ortu/Staff + halaman shared (PickupVerify, SelfAttendance, LeaveRequests, Profile, dll.)

---

## Homepage Publik (`/`)

- `Navbar.jsx` — sticky fixed, **default: frosted white** (`rgba(255,255,255,0.80)`) dengan teks gelap; **saat scroll >24px: floating pill dark navy glass** (`rgba(10,38,71,0.68)`) dengan teks putih — transisi smooth 350ms
- Hero card: `height: 100vh`, background biru `#33A6F2` solid, foto siswa bleed ke atas melalui wrapper padding-top, `border-radius: 24px`, gap tipis dari navbar (~12px atas, ~12px bawah)
- `homepage-container` padding kiri-kanan `20px` — card tidak mentok ke tepi layar

---

## Dashboard Orang Tua (`/ortu/dashboard`) — Redesign Lengkap

File: `src/pages/ortu/OrtuDashboard.jsx`

Semua logic/query **tidak berubah**. Hanya layout & komponen presentasional yang diganti total. Urutan section dari atas ke bawah:

1. **Greeting + child switcher pill** — nama orang tua kiri, pill anak aktif (tap → select-child atau profile) kanan
2. **School Banner** — gradient sky→blue→navy, ilustrasi SVG inline (gedung + dua siswa), headline + CTA "Lihat Aktivitas"
3. **Quick Actions** — 5 icon horizontal dalam card putih, tiap icon warna unik (biru/hijau/amber/ungu/merah)
4. **Payment Alert** — amber gradient jika ada tunggakan (dengan left accent strip + CTA pill gelap); green subtle jika semua lunas
5. **Today's Status card** — gradient biru `from-primary-400 to-#35AEFC`, live dot + nama anak + avatar + progress bar kehadiran bulan ini + 2 status pill (Jemput & SPP)
6. **Attendance Schedule** — 7-day WeekStrip (hari aktif bulat biru solid) + legend status dot + 3 entri terakhir
7. **Children Overview** — list per anak dengan avatar + status badge + action bar (Absensi / Jemput / Bayar)
8. **Authorized Pickups** — 2-column grid chip nama + hubungan
9. **Invoice Highlight** — dark navy→sky gradient, nominal besar + due date + CTA pill putih (hanya muncul kalau ada invoice aktif)
10. **Announcements** — timeline dot kiri + judul + body line-clamp-2

**Komponen internal `OrtuDashboard.jsx`** (bukan file terpisah):
- `ChildAvatar` — avatar foto atau inisial dengan ring, size `sm`/`md`
- `WeekStrip` — 7 hari terakhir dengan dot status per hari
- `QuickAction` — icon button + label vertikal
- `PickupChip` — chip penjemput 2-col grid
- `STATUS_DOT` — map status → warna dot (hadir=green, izin=amber, sakit=sky, alpa=red)

---

## Dashboard Admin (`/admin/dashboard`)

File: `src/pages/admin/AdminDashboard.jsx`  
Layout: `DashboardLayout` dengan `rightRail` dan `sidebarAlert` (pending leaves jika ada).

**Main content** (urutan dari atas ke bawah):
1. **`GreetingBanner`** — sapaan dinamis (pagi/siang/sore/malam) + nama admin dari `getUser()` + badge academic year (dari `financeData.academic_year` jika ada)
2. **`QuickActions`** — 4 tombol shortcut: Absensi Hari Ini, Approve Cuti (badge count dari `pendingLeaves.length`), Log Penjemputan, Invoice
3. **4× `StatCard`** grid 2-col (lg: 4-col): Absensi hari ini (delta persentase kehadiran), Belum dijemput (delta "Semua terjemput" jika 0), Cuti pending, Invoice overdue
4. Grid 2-col: **`ProgressCard`** distribusi absensi (items sudah dikonversi ke persentase, dengan caption `hadir/total siswa (x%)`) + **`TableCard`** siswa belum dijemput
5. **`AttendanceByClassCard`** — breakdown kehadiran per kelas hari ini, bar + persentase, color-coded: hijau ≥90%, kuning ≥70%, merah <70%
6. **`ListCard`** announcements (kondisional, tetap di main area)

**Data fetching — PENTING:**  
Dashboard tidak lagi pakai pola N+1 `useQueries` per rombel. Semua data absensi diambil dari **1 endpoint agregasi**:
- `GET /api/admin/reports/attendance/today-summary?date=YYYY-MM-DD`  
  Response: `{ date, total_students, hadir, izin, sakit, alpa, by_classroom[] }`  
  Backend hanya melakukan 2 hit DB (bukan 1+N). Lihat `AttendanceController::todaySummary()`.

**Right rail** (dari atas ke bawah):
- Pending leave list (kondisional, hanya jika ada)
- `HighlightCard` overdue invoice (kondisional, hanya jika `overdue_count > 0`)
- `FinanceSummaryCard` — collection rate bar + 3 angka (tagihan/terbayar/sisa) + warning overdue count (ditampilkan jika `financeData` tersedia)
- `ActivityTimelineCard` — selalu tampil sebagai fallback, tidak bergantung kondisi apapun

---

## Komponen Dashboard Generic (`components/dashboard/`)

| Komponen | Props utama | Keterangan |
|---|---|---|
| `StatCard` | `icon, label, value, tone, delta` | `delta = { value, direction: 'up'|'down' }` — tampil pill hijau/merah di pojok kanan atas |
| `ProgressCard` | `title, caption?, items[]` | `items[].value` **harus persentase 0–100**, bukan count mentah. `caption` untuk denominator teks |
| `AttendanceByClassCard` | `title, rows[]` | `rows = [{ className, hadir, total }]` — kalkulasi pct + warna dilakukan internal. Warna: ≥90% hijau, ≥70% amber, <70% merah |
| `FinanceSummaryCard` | `totalBilled, totalPaid, totalOutstanding, overdueCount, periodLabel` | Collection rate bar + 3 angka keuangan. Format angka internal (juta/ribu). |
| `GreetingBanner` | `name, dateLabel, academicYear?` | Greeting otomatis (pagi/siang/sore/malam) berdasarkan `new Date().getHours()` |
| `QuickActions` | `actions[]` | `actions = [{ label, to, icon: LucideIcon, badge? }]` — badge muncul di pojok kanan atas tombol jika `> 0` |
| `HighlightCard` | `title, description, ctaLabel, ctaTo, badges?` | Gradient biru, pill CTA putih. Teks di atas putih pakai nilai tetap `primary-900` (bukan token `*-fg`) |
| `ActivityTimelineCard` | `title, viewAllTo, items[]` | `items = [{ time, who, action }]` |
| `TableCard` | `title, viewAllTo, columns[], rows[]` | Kolom `status` mendukung `{ label, tone }` untuk `StatusBadge` |
| `ListCard` | `title, viewAllTo, items[]` | `items = [{ initials, primary, secondary }]` |
| `ChartCard` | — | Belum dipakai di halaman manapun |

---



`react-i18next`, key terpusat di `src/i18n/locales/{id,en}.json`. **Wajib**: semua teks lewat `t('key')`, tidak boleh hardcode. Beberapa string minor di komponen dashboard generik (`ListCard` dll.) masih hardcode — boleh dirapikan kalau menyentuh file itu.

---

## Data Fetching & Auth Pattern

- `lib/api.js` — `apiGet/apiPost/apiPut/apiPatch/apiDelete` + varian `...Form` (multipart). CSRF Sanctum SPA sudah dibungkus, jangan fetch manual di luar helper ini.
- 401 → auto-redirect ke `/login`.
- `storageUrl()` — prefix URL foto dari `storage/` backend.
- `lib/auth.js` — `getUser()` dari localStorage (bukan httpOnly cookie murni, Sanctum cookie tetap yang otorisasi).
- **`lib/format.js` — JANGAN pakai `new Date(isoString)` langsung.** Backend Carbon selalu tambahkan `Z` meski timezone `Asia/Jakarta`, jadi `new Date()` native geser jam. Selalu pakai helper di file ini.
- `lib/activeChild.js` + `hooks/useOrtuChildren.js` — pola "anak aktif" Ortu: localStorage kalau masih valid, atau auto-pilih kalau cuma 1 anak.

---

## Konvensi yang Sudah Terbukti (ikuti kalau bikin halaman baru)

- **Halaman list Admin** → reuse `FilterBar` + `DataTable` + `ExportButton`.
- **Notifikasi baru** → lewat `App\Services\NotificationService` backend, `NotificationDrawer` + `NotificationBell` sudah generic terhadap field `url`.
- **Badge status** → selalu `StatusBadge` + mapping di `lib/statusLabels.js`, jangan warna manual per halaman.
- **Halaman scoped-per-anak (Ortu)** → pasang `ActiveChildBar` + pakai `useOrtuChildren()`.
- **Warna baru di halaman** → pakai token `primary-*`, `accent-500`, `success-500`, `danger-500`. Boleh pakai hex literal untuk warna-warna dekoratif satu-off (banner, ilustrasi) tapi jangan buat token baru di `index.css` tanpa diskusi.
- **Teks atau ikon di atas tint berwarna** → pakai token `*-fg` (`text-danger-fg`, `text-primary-fg`, dst), **bukan** shade 500. Token `*-fg` sudah lengkap untuk 5 tone dan otomatis berganti di dark mode, jadi jangan menambah varian `dark:` per-komponen. Detail & rasio terukurnya ada di bagian **Design Tokens** di atas.

---

## Yang Belum Klik-Test / Belum Selesai

- Halaman yang paling perlu dicek ulang: `PickupVerify` (panel eskalasi), `GuruAttendance` (baris terkunci), `AdminFinanceDashboard`, `AdminLeaveRequests`, `AdminStudentDetail` (5 tab), `AdminDismissalSettings`.
- `getUserMedia()` (kamera scan QR & selfie) belum pernah dites sampai user klik Allow/Deny beneran — perlu tes manual.
- Export masih CSV saja, bukan PDF/Excel asli.
- `lib/push.js` baru sampai request permission, belum `pushManager.subscribe()` (backend belum ada VAPID key asli).
- **Dashboard Guru pasca-perbaikan P1 (2026-09-18)**: skeleton `animate-pulse` saat muat pertama, `-` saat data memang tidak ada, banner error + tombol "Coba lagi", dan caption denominator di kartu distribusi ("28 dari 30 siswa sudah diinput"). Perlu dicek mata dengan API sengaja dimatikan.
- **`Drawer` (NotificationDrawer) pasca-perbaikan a11y (2026-09-18)**: `inert` saat tertutup, fokus masuk/keluar, trap `Tab`, `Escape`. Sifat `inert` baru dibuktikan lewat output render (`renderToStaticMarkup`), **belum** di a11y tree browser sungguhan.
- **Tone `primary-fg` yang lebih gelap** (light) perlu dilihat mata: link "Lihat semua" dan label CTA sekarang `#1F6FA8`, bukan `#2D94DA`.
- Midtrans masih sandbox stub — tombol Bayar di `OrtuInvoiceDetail.jsx` menampilkan token sandbox.
