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
                                HighlightCard, TableCard, ActivityTimelineCard);
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

**Sidebar tokens** (dipakai `DashboardLayout`): `bg-sidebar`, `sidebar-text`, `sidebar-text-muted`, `sidebar-border`, `sidebar-active-bg`, `sidebar-active-text`, `sidebar-hover-bg` — di-override di `.dark {}` supaya sidebar flip navy di dark mode (light mode sidebar putih, dark mode sidebar navy).

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
Layout: `DashboardLayout` dengan `rightRail` (pending leave list + overdue invoice card) dan `sidebarAlert` (pending leaves jika ada).

Main content:
- Grid 2-col (lg: 4-col): 4× StatCard (Absensi hari ini, Belum dijemput, Cuti pending, Invoice overdue)
- Grid 2-col: ProgressCard distribusi absensi + TableCard siswa belum dijemput

---

## i18n

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

---

## Yang Belum Klik-Test / Belum Selesai

- Halaman yang paling perlu dicek ulang: `PickupVerify` (panel eskalasi), `GuruAttendance` (baris terkunci), `AdminFinanceDashboard`, `AdminLeaveRequests`, `AdminStudentDetail` (5 tab), `AdminDismissalSettings`.
- `getUserMedia()` (kamera scan QR & selfie) belum pernah dites sampai user klik Allow/Deny beneran — perlu tes manual.
- Export masih CSV saja, bukan PDF/Excel asli.
- `lib/push.js` baru sampai request permission, belum `pushManager.subscribe()` (backend belum ada VAPID key asli).
- Midtrans masih sandbox stub — tombol Bayar di `OrtuInvoiceDetail.jsx` menampilkan token sandbox.
