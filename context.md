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
                    auth/, common/ (Profile, ConsentChild, AnnouncementHistory — lintas-role),
                    pickup/ (PickupVerify, dipakai guru & staff — shared component),
                    self-attendance/ (SelfAttendance, idem), leave/ (LeaveRequests, idem)

layouts/          — 3 file aktif:
                    DashboardLayout.jsx  — sidebar app shell, Admin/Guru (sidebar 240px default,
                                           collapsed → OrganicWaveSidebar 80px)
                    MobileAppShell.jsx   — shell mobile-first Orang Tua & Staff (max-w-480px,
                                           bottom tab bar, headerVariant greeting/title/none)
                    ResponsiveShell.jsx  — wrapper role-aware: Ortu/Staff → MobileAppShell,
                                           Admin/Guru → DashboardLayout

components/       — RoleGuard, AuthGuard, OrtuGuard (route guards);
                    NotificationBell + NotificationDrawer; LanguageSwitcher;
                    OrganicWaveSidebar (rail 80px untuk sidebar ciut);
                    Navbar (Homepage publik saja, bukan dashboard);
                    dashboard/ — legacy: StatCard, ProgressCard, TableCard, HighlightCard,
                                ListCard (masih dipakai Guru/Staff/Finance);
                                versi Admin Figma (2026-09-25): CommandHero, ActionTileCard,
                                NotificationsCard, AttendanceReminderCard, CalendarCard,
                                ClassStatusCard, GaugeCard, PickupMonitorCard,
                                AgendaHighlightCard;
                                orphan (tidak diimpor di mana pun): GreetingBanner, QuickActions,
                                AttendanceByClassCard, FinanceSummaryCard,
                                ActivityTimelineCard, ChartCard, ActionCards;
                    ortu/ (ActiveChildBar, ChildOverviewCard, InvoiceCard);
                    ui/ (DataTable, Drawer, ExportButton, FilterBar, FormField,
                         Modal, StatusBadge, MobileCardList, StatMiniGrid)

config/           — navigation.js (NAV_MENU_GROUPS sidebar per role + NAV_TOP_TABS tab topbar),
                    mobileNav.js (MOBILE_TABS bottom-nav Ortu & Staff)

lib/              — api.js, auth.js, activeChild.js, format.js, statusLabels.js,
                    exportCsv.js, push.js

hooks/            — useDarkMode, useOrtuChildren

i18n/             — index.js + locales/{id,en}.json
```

---

## Routing & Guard Pattern (`router.jsx`)

Helper per-role membungkus elemen: `admin()`, `guru()`, `staff()` → `<RoleGuard role="...">`, `authed()` → `<AuthGuard>`, `ortu()` → `<OrtuGuard>`. `OrtuGuard` punya 2 tugas ekstra: redirect ke `/consent/child` kalau ada anak belum consent, dan ke `/ortu/select-child` kalau >1 anak belum ada yang dipilih aktif.

**55 route utama** terdaftar (56 entri termasuk `*` → `NotFound`) — Homepage publik `/`, auth `/login|/forgot-password|/reset-password`, per-role prefix `/admin/*`, `/guru/*`, `/ortu/*`, `/staff/*`, plus route lintas-role (`/account/profile`, `/consent/child`). Halaman shared (`PickupVerify`, `SelfAttendance`, `LeaveRequests`) di-mount 2x dengan guard beda tapi satu file yang sama. Empat terakhir bertema pengaduan: `/admin/complaints` + `/admin/complaints/:id` (2026-09-28), lalu `/ortu/complaints` + `/ortu/complaints/:id` (2026-09-30, dipasang `<OrtuGuard requireChildSelection={false} requireConsent={false}>` — lihat bagian Fitur Pengaduan).

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

**Sidebar tokens** (dipakai `DashboardLayout`): `bg-sidebar`, `sidebar-text`, `sidebar-text-muted`, `sidebar-border`, `sidebar-active-bg`, `sidebar-active-text`, `sidebar-hover-bg` — di-override di `.dark {}` supaya sidebar flip navy di dark mode (light mode sidebar putih, dark mode sidebar navy). Sejak redesain expanded 2026-09-28, nav expanded **tidak lagi** memakai token ini — ia pakai hex literal Figma (lihat bagian Sidebar Expanded). Token tinggal dipakai untuk latar kolom sidebar dan oleh `OrganicWaveSidebar`.

> **Konflik yang belum diputuskan (ditemukan 2026-09-18):** root `context.md` dan `PRODUCT.md` menyatakan sidebar **"selalu navy di kedua tema"**, sedangkan implementasi (dan dokumen ini) menyebut light mode = putih **secara sengaja**. Komentar di `index.css` juga masih menulis "always navy". Salah satu dari keduanya harus diperbaiki — belum diputuskan user.
>
> **Catatan 2026-09-28:** nav expanded sekarang **selalu biru** di kedua tema (panel Figma), jadi kontradiksi ini tinggal relevan untuk latar kolom sidebar dan `OrganicWaveSidebar`.

**Warna Figma literal (belum dimigrasi ke token).** Redesain Dashboard Admin (2026-09-25) dan Dashboard Ortu v1.0 memakai hex persis Figma — `#5B61F6` (indigo), `#2082F5` (biru), `#0F1220` (pill gelap), plus gray Tailwind — alih-alih token di atas. Ini keputusan sadar ("warna persis Figma") dan komponennya dikomentari sebagai greppable sampai migrasi token global dijalankan. Konsekuensi kontras yang sudah tercatat di komentar kode: putih di atas `#2082F5` **3,77:1** (AgendaHighlightCard, di bawah AA 4.5:1 untuk teks kecil), cincin gauge `#5B61F6` di dark **2,93:1**, fill bar ClassStatusCard juga <3:1 di dark. Sidebar expanded (2026-09-28) menambah `#2082F5 → #1466CA` (panel), `#0c2b4c` / `#64748b` (header), `#f1f5f9` / `#475569` (tombol collapse) — semuanya literal.

Dark mode berbasis **class** (`@custom-variant dark`), toggle via `useDarkMode.js` (localStorage persist).

Font: **Plus Jakarta Sans** (`font-heading`) + **Inter** (`font-body`) via Google Fonts.

---

## Layout System — 2 Shell (PENTING)

### `DashboardLayout` — Admin & Guru
- Sidebar kiri persisten; **default EXPANDED 256px** (`w-64`). State collapse disimpan di `localStorage.sidebar_collapsed` (bug lama: default-nya rail karena `!== 'false'`, jadi sidebar 256px praktis tidak pernah terlihat).
- Sidebar **collapsed** → merender **`OrganicWaveSidebar`** (80px): rail ikon dengan bentuk "organic wave" (`#2082F5`, 2 SVG cap + badan ribbon), **satu ikon per grup menu** (item aktif grup itu, atau item pertamanya), tooltip saat hover, item aktif = squircle putih dengan glyph "app grid", settings/logout/avatar di bawah wave. (Versi lama meratakan semua item lalu `slice(0, 8)` sehingga membuang menu penting.)
- **Expanded (redesain 2026-09-28)**: panel biru gradient `#2082F5 → #1466CA` yang **sama di light maupun dark** (tidak ikut tema), full-bleed dengan lengkung organik di kanan-atas. Angka Figma lengkap + daftar penyimpangan yang disengaja ada di bagian **Sidebar Expanded — Redesign Figma** di bawah.
- **Topbar (redesign 2026-09-25)**: judul halaman + subtitle **sudah tidak** dirender di sini — dipindah ke `document.title` (`pageSubtitle` sekarang hanya dipakai untuk itu). Isinya sekarang: tab lintas-seksi `NAV_TOP_TABS` per role (Admin/Guru), search box (ikon mic dihapus), pill toggle **Light/Dark** berlabel, link Pengaturan, `LanguageSwitcher variant="figma"`, dan CTA "Pengumuman +" khusus admin. Di bawah `lg`: hamburger.
- Right rail (opsional, 320px) & sidebar alert card (opsional) masih didukung via props — tapi `rightRail` sekarang **tidak dikirim halaman mana pun** (dashboard Admin lama yang memakainya sudah di-redesain).
- Dipakai: semua halaman `/admin/*` dan `/guru/*`, dan `ResponsiveShell` untuk role selain Ortu/Staff

### `MobileAppShell` — Orang Tua & Staff
- Max-w 480px, ter-center di semua breakpoint (bukan hanya mobile)
- `headerVariant`:
  - `"greeting"` — header gradient biru literal (`#007BFF → #35AEFC → #B0E0E6`) + layer lingkaran dekoratif, avatar inisial + dot hijau, judul/subjudul putih, toggle tema & bell di lingkaran translucent.
  - `"title"` — topbar minimalis sticky: back button + judul + subtitle + toggle tema + bell.
  - `"none"` — tanpa header shell; halaman menyediakan hero sendiri (mis. `OrtuDashboard` yang punya hero biru custom + bell sendiri).
- `fullBleed` — mematikan padding `<main>` supaya hero halaman bisa nempel ke tepi.
- **Bottom tab bar**: 5 tab; **tab aktif naik jadi bubble bundar biru 56px** (`-top-8` + ring putih), tab lain ikon + label biasa. Flag `central: true` di `mobileNav.js` **belum dipakai** oleh shell ini.
- Dipakai via `ResponsiveShell` — semua halaman `/ortu/*` dan `/staff/*`

### `ResponsiveShell`
- Wrapper role-aware: cek `user.role`, kalau `orang_tua` atau `staff` render `MobileAppShell`, selain itu `DashboardLayout`
- Dipakai oleh semua halaman Ortu/Staff + halaman shared (PickupVerify, SelfAttendance, LeaveRequests, Profile, dll.)

---

## Sidebar Expanded (`DashboardLayout`) — Redesign Figma "Left Organic Curve Sidebar" (2026-09-28)

File: `src/layouts/DashboardLayout.jsx`, blok `<aside>` expanded saja. Frame Figma **node 83:768** (file key `FTR1cd10409XotFDmBFy0m`). State collapse tetap `OrganicWaveSidebar` dan **tidak disentuh** — keduanya branch eksklusif (`collapsed ? 'lg:hidden' : …`), jadi terpisah bersih.

**Cara ambil angkanya — catat, ini yang bikin bolak-balik:** `/v1/files/:key/nodes?ids=…` **kena rate limit keras** (`Retry-After` ≈ 205.000 detik), sedangkan `/v1/files/:key` biasa jalan normal; pakai yang terakhir. Bentuk kurva, radius, dan opacity **tidak ada** di response JSON — itu cuma muncul lewat `GET /v1/images/:key?ids=…&format=svg`, yang mengembalikan URL S3 berisi path SVG asli. JSON-nya tetap perlu untuk teks, font, posisi absolut, dan ukuran kotak.

**Struktur (kolom 256px, full-bleed):**

1. **Header `h-[82px]`** (`83:770`) — logo 38×40 di x=20; wordmark "JACOS" **Plus Jakarta Sans 16/700 `#0c2b4c`** (lh 20); subtitle Inter 10.5/400 `#64748b` (lh 13); tombol collapse **32×33** `#F1F5F9` radius 10 berisi `ChevronLeft` (glyph 6×12, stroke `#475569`) di x=202. Blok ini duduk di **atas** panel biru, jadi latarnya tetap ikut tema.
2. **Panel biru** (`83:777`) — FULL-BLEED, x=0..256 mulai y=82; **bukan** kartu ber-margin. Path aslinya `M0 0 H176 C220.183 0 256 38.7048 256 86.45 V925.015 C256 939.339 245.255 950.95 232 950.95 H0 Z`: sudut kiri siku, lengkung organik kanan-atas dari x=176 ke x=256 setinggi 86, radius kanan-bawah 24×26. Diimplementasikan sebagai `borderTopRightRadius: '80px 86px'` — titik ujungnya identik dengan kurva kubik itu, cuma kontrolnya beda tipis (Figma 38.70 vs 47.75 untuk elips murni). Radius kanan-bawah **sengaja tidak dipakai**: di frame aslinya panel overflow (82+951 > tinggi frame 988) sehingga lengkung itu tidak pernah terlihat, dan di sini panel full-height. Gradient `linear-gradient(162.5deg, #2082F5, #1466CA)`; sudut 162.5° dihitung dari vektor `<linearGradient>` Figma (0,0)→(295.082, 938.664) `userSpaceOnUse`.
3. **Pill putih** (`83:779`) — 168×40 radius 20 (stadium), di **x=22 rata kiri** (bukan di tengah), teks 23px dari tepi dalam, **PJS 13/700 `#2082f5`**. Isinya **label grup nav yang sedang aktif** (`sidebarSection`), bukan judul halaman — kalau judul halaman, teksnya jadi sama persis dengan item nav aktif di bawahnya. Fallback ke `pageTitle` untuk halaman di luar menu.
4. **Baris nav** — tinggi **41px**, radius **12.35**, gap **6.5** → pitch **47.5px**, sama dengan Figma. Padding ditaruh di `<nav>` (`pl-[22px] pr-[18px]`), bukan di panel; baris pertama mendarat di **y=179** persis Figma (panel 82 + `pt-8` 32 + pill 40 + `mt-[25px]` 25). Item aktif = `bg-white/[0.18]` — angka 0.18 diambil dari `fill-opacity="0.18"` di SVG, bukan tebakan — + teks 700; non-aktif 400 + `hover:bg-white/[0.08]`. Teks **Inter 13.5px mulai x=64** = 22 margin + 13 padding + ikon 20 + gap 9.
5. **Footer** (`83:973`) — divider 216px putih **25%** (dari `stroke-opacity="0.25"`), ikon Pengaturan 18×18 di x=25, teks di x=54 (Inter 14/400), pitch antar baris **44px**. `px-5` di wrapper bikin divider mendarat tepat di x=20..236 seperti Figma.

**Accordion + garis tree dipertahankan** meski Figma-nya flat — ini permintaan eksplisit. Grup collapsible dan sub-item bertree-line hanya di-restyle ke bahasa visual panel (garis `white/25`). Konsekuensinya: dengan pitch 47.5px, menu Admin yang tergrup panjang **akan scroll** di dalam `<nav>`.

**Subtitle "Admin Portal"** dari Figma dipetakan per role lewat `ROLE_PORTAL_LABEL` di `lib/auth.js` (`Admin Portal`/`Guru Portal`/`Staff Portal`/`Orang Tua Portal`) — belum lewat i18n, sama seperti `ROLE_LABEL` yang sudah ada di sana.

**Sengaja beda dari Figma (semua ada komentarnya di kode):**

- **Ikon** pakai lucide 20px `strokeWidth={1.8}`. Ikon Figma path custom (mis. "Data Siswa" 22×18) yang rasionya tidak sama dengan lucide; identik hanya kalau path-nya dipindah jadi komponen SVG sendiri.
- **Logo**: Figma menggambar placeholder (shield *outline* `#2082F5` di dalam kotak biru 10%), di sini dipakai `logo baru.svg` asli di kotak 38×40 yang sama.
- **Kartu `sidebarAlert`** tidak ada di Figma; tetap kartu putih solid (`ml-[22px] mr-[18px]`) karena gradient lamanya tabrakan warna dengan panel biru.
- **`border-r` 1px** dipertahankan (Figma tidak punya) supaya area header putih tetap terpisah dari `bg-page` di light mode.
- **Isi pill**: Figma menulis "Homepage" — nama halaman mockup-nya, bukan label UI nyata.

**Dark mode:** file Figma cuma punya 1 frame (light), jadi tidak ada acuan. Panel birunya dibiarkan **konstan di kedua tema**; yang ikut tema hanya header/tombol collapse/border (`#F1F5F9` & `#475569` adalah nilai light-mode → di dark jadi `bg-white/10` dan `text-sidebar-text`).

---

## Fitur Pengaduan / Tiket — UI Admin (2026-09-28)

Fitur **baru** (bukan penyambungan fitur lama): `pengaduan`/`complaint`/`chat` nol hasil di seluruh repo. Bentuknya tiket berstatus dengan nomor `PGD-<tahun>-<5 digit>`. User memilih mulai dari **backend + UI Admin dulu**; **UI Ortu belum ada**. Backend-nya (migration, model, policy, 8 route, SLA, notifikasi, audit, 12 test) dicatat di root `context.md` §Fitur Pengaduan.

- `src/pages/admin/AdminComplaints.jsx` (`/admin/complaints`) — 4 tile ringkasan (Baru/Diproses/Selesai/Lewat Target) diambil dari `counts` yang ikut di response list (tanpa request kedua), `FilterBar` (status, kategori, prioritas, overdue, pencarian **debounce 350 ms**), lalu `DataTable` + `StatusBadge`. Reset halaman ditaruh di `changeFilter` (handler), **bukan** `useEffect`, supaya tidak memicu warning `react/set-state-in-effect`.
- `src/pages/admin/AdminComplaintDetail.jsx` (`/admin/complaints/:id`) — isi + lampiran, thread percakapan (balasan Admin dibedakan latarnya), panel tindak lanjut (priority dengan hint SLA, assignee, catatan penyelesaian, tombol Proses/Selesaikan/Tolak/Buka Kembali), kotak balasan, dan hapus dengan `Modal` konfirmasi. Draft catatan disimpan per-id pengaduan supaya tidak bocor antar tiket.
- `src/config/navigation.js` — grup menu **`navMenu.complaints`** (ikon `Inbox`) ditaruh tepat setelah Menu Utama. **Menu ini tidak ada di frame Figma**; ditambahkan bersama fiturnya dan itu ditulis di komentar kode.
- `src/lib/statusLabels.js` — tone baru: `open` → `accent`, `in_progress` → `primary`, `resolved` → `success`.
- i18n: blok `complaints.*` (**33 key**) + `status.open`/`in_progress`/`resolved` + `navMenu.complaints` di `id.json` & `en.json`. Kedua file itu **CRLF** — kalau menyisipkan key, sertakan `\r\n` eksplisit atau line ending-nya jadi campur.

**UI Ortu juga sudah ada (2026-09-30)** — melengkapi fitur ini:

- `src/pages/ortu/OrtuComplaints.jsx` (`/ortu/complaints`) — kartu pengantar + tombol "Ajukan Pengaduan" (modal: anak opsional dengan opsi "Umum", kategori, subjek, isi, lampiran via `apiPostForm`) di atas `MobileCardList` + badge status/"Lewat Target". Sukses submit → langsung pindah ke detail tiket barunya.
- `src/pages/ortu/OrtuComplaintDetail.jsx` (`/ortu/complaints/:id`) — breadcrumb, isi + lampiran, thread balasan (balasan pihak sekolah = role ≠ `orang_tua` yang ditandai latar `primary-300/10` — **kebalikan** dari halaman Admin yang justru menandai pengadu), kotak balas, kartu "Informasi Tiket". Tidak ada panel triase/hapus (wewenang Admin).
- Semua memakai endpoint yang sudah ada (`GET/POST /api/ortu/complaints`, `GET /api/complaints/{id}`, `POST /api/complaints/{id}/replies`) — tidak ada route backend baru.
- **Pintu masuknya**: baris "Hubungi Tata Usaha" di `OrtuAccount.jsx`, yang sebelumnya cuma placeholder modal "segera hadir", sekarang `<Link to="/ortu/complaints">`. Key i18n barunya `complaints.accountRowHint` (key lama `ortu.contactAdminHint` jadi tidak terpakai). `OrtuDashboard.jsx` tidak disentuh (layout plek Figma).
- `OrtuGuard` dapat prop `requireConsent` (default `true`); route pengaduan memakai `requireConsent={false}` + `requireChildSelection={false}` supaya sejalan dengan keputusan policy backend (consent bukan syarat menyampaikan keluhan) dan deep-link notifikasi tidak nyangkut di child-switcher/consent gate.
- Notifikasi yang tadinya ber-`url` `null` sekarang terisi `/ortu/complaints/{id}` (balasan Admin & perubahan status) — lihat root `context.md` §UI Ortu Pengaduan. 15 key i18n baru di blok `complaints.*` (file CRLF).

---

## Homepage Publik (`/`)

- `Navbar.jsx` — sticky fixed, **default: frosted white** (`rgba(255,255,255,0.80)`) dengan teks gelap; **saat scroll >24px: floating pill dark navy glass** (`rgba(10,38,71,0.68)`) dengan teks putih — transisi smooth 350ms
- Hero card: `height: 100vh`, background biru `#33A6F2` solid, foto siswa bleed ke atas melalui wrapper padding-top, `border-radius: 24px`, gap tipis dari navbar (~12px atas, ~12px bawah)
- `homepage-container` padding kiri-kanan `20px` — card tidak mentok ke tepi layar

---

## Dashboard Orang Tua (`/ortu/dashboard`) — Redesign v1.0

File: `src/pages/ortu/OrtuDashboard.jsx` (~790 baris). Logic/query **tidak berubah** — yang diganti total adalah layout & presentasi. Urutan section (sesuai komentar seksi di file):

1. **Hero sticky** — header biru yang mengecil saat scroll + layer lingkaran dekoratif + floating pill (sapaan + avatar anak) dengan dropdown child-switcher.
2. **Quick Actions** — 3 ikon bulat putih: Absensi, Izin Sakit, Agenda. "Agenda" **scroll** ke kartu Agenda Mendatang via `ref` (bukan navigasi) — penutup bug lama salah rute.
3. **Banner Slideshow** — 3 slide (`banner.png`, `banner (1).png`, `banner (2).png`) + dot indicator; komponen internal `BannerSlideshow`.
4. **Attendance Schedule & WeekStrip** — 7 hari terakhir + daftar entri absensi terbaru, data asli.
5. **Status Hari Ini** — sadar status izin/sakit (tidak salah bilang "belum dijemput"), dari `/api/ortu/children`.
6. **Ringkasan Tagihan** — dari `/api/ortu/children/{id}/invoices`.
7. **Children Overview** — kartu per anak + 3 tombol aksi cepat (Absensi / Jemput / Bayar).
8. **Authorized Pickups (QR)** — kartu penjemput sah, layout mengikuti Figma.
9. **Agenda Mendatang** — hari libur/perayaan dari kalender akademik yang diinput Admin.

**Fungsi internal:** `BannerSlideshow`, `relationshipEmoji`. Warna halaman ini **hardcode** (gray Tailwind + hex), bukan token tema — pola "persis Figma" yang sama seperti Dashboard Admin.

---

## Dashboard Admin (`/admin/dashboard`) — Redesign Figma "Modern Command Center"

File: `src/pages/admin/AdminDashboard.jsx`  
Layout: `DashboardLayout` (`sidebarAlert` = cuti pending; **tanpa** `rightRail` lagi). Mengikuti frame Figma **node 33:567** — brief: isi tetap data JACOS yang sekarang, bentuknya plek Figma. Komponennya pakai hex Figma literal (lihat bagian Design Tokens).

**Susunan (3 blok):**
1. **`CommandHero`** — sapaan dinamis + badge role "TU" + headline + subjudul; chip "+" dekoratif (`aria-hidden`). Berisi 3 **`ActionTileCard`**: Approval Cuti (meta = jumlah cuti pending), Konfirmasi Bayar SPP (meta = jumlah overdue), dan **Guru Pengganti** yang `unavailable` (dashed, bukan link).
2. **Baris tengah 3 kolom**: **`NotificationsCard`** (kartu agenda kosong + kartu notifikasi terbaru; "Bersihkan" = mark-all-read, klik item → mark-read + buka `payload.url`) · **`AttendanceReminderCard`** (rombel `not_started`/`partial`, tombol "Ingatkan" per rombel + kirim ke semua) · **`CalendarCard`** (header bulan + strip 7 hari, ‹ › pindah minggu; daftar jadwal dikosongkan).
3. **Baris bawah grid 12 kolom**: `ClassStatusCard` (6) · `AgendaHighlightCard` (2) · kolom 4 = 2× `GaugeCard` (kehadiran & SPP) + `PickupMonitorCard`.

**Sengaja dibiarkan kosong** (backend belum punya endpoint; brief: "modul tanpa endpoint tetap kosong"): kartu agenda di `NotificationsCard`; daftar jadwal `CalendarCard`; isi `AgendaHighlightCard` (CTA disembunyikan karena tidak ada halaman tujuan); tombol **"Broadcast WA"** di `PickupMonitorCard` dirender **disabled** (bukan dihapus) supaya bentuknya plek tanpa jadi kontrol palsu.

**Data fetching — PENTING:**  
Dashboard tidak pakai pola N+1 `useQueries` per rombel. Absensi diambil dari **1 endpoint agregasi** `GET /api/admin/reports/attendance/today-summary?date=YYYY-MM-DD` — response `{ date, total_students, hadir, izin, sakit, alpa, by_classroom[] }`, backend cuma 2 hit DB (lihat `AttendanceController::todaySummary()`). Endpoint lain yang dipanggil: `submission-status`, `students/not-picked-up`, `staff/leave-requests?status=pending`, `admin/finance/dashboard`, `notifications`, `admin/settings/dismissal-cutoff` — **belum ada endpoint summary terpusat** (catatan FR-BE §10 masih berlaku). Status error dibedakan dari nilai 0 (komponen menerima `isLoading` → tampil "-", bukan "0 siswa").

**Versi layout lama** (`GreetingBanner`/`QuickActions`/`AttendanceByClassCard`/`FinanceSummaryCard`/`ActivityTimelineCard` + right rail, commit 2026-09-25 `32b4031`) sudah **digantikan** redesign ini; komponen-komponen itu sekarang orphan (lihat tabel di bawah).

---

## Komponen Dashboard Generic (`components/dashboard/`)

| Komponen | Props utama | Keterangan |
|---|---|---|
| **Figma Admin (2026-09-25)** | | |
| `CommandHero` | `name, roleBadge, headline, subtitle, children` | Blok hero; chip "+" dekoratif `aria-hidden` |
| `ActionTileCard` | `icon, image, title, meta, to, tone?, unavailable?` | Kartu aksi berilustrasi; `unavailable` → dashed + non-link. (`tone` saat ini tak terpakai — warning lint) |
| `NotificationsCard` | `items, unread, isLoading, onMarkAllRead, onItemClick` | Kartu agenda (kosong) + kartu notifikasi terbaru |
| `AttendanceReminderCard` | `classes, reminded, onRemind, onRemindAll, isPending, isBulkPending, viewAllTo` | Daftar rombel belum/sebagian input + tombol ingatkan |
| `CalendarCard` | — | Header bulan + strip 7 hari, pager minggu; daftar jadwal masih kosong |
| `ClassStatusCard` | `title, rows[], viewAllTo` | `rows = [{ id, name, meta, pct, trailing }]` |
| `GaugeCard` | `overline, value, label, subLines[], tone, ctaLabel?, ctaTo?, isLoading?` | Ring gauge SVG; `isLoading` → "-" |
| `PickupMonitorCard` | `cutoffTime, students[], logTo, settingsTo, isLoading, isError` | Mode error dibedakan dari "semua terjemput"; tombol Broadcast WA disabled |
| `AgendaHighlightCard` | `title, emptyMessage, ctaLabel?, ctaTo?` | Kartu biru `#2082F5`; isi kosong, CTA disembunyikan |
| **Legacy (masih dipakai Guru/Staff/Finance)** | | |
| `StatCard` | `icon, label, value, tone, delta` | `delta = { value, direction: 'up'|'down' }` — pill hijau/merah di pojok kanan atas |
| `ProgressCard` | `title, caption?, items[]` | `items[].value` **harus persentase 0–100**, bukan count mentah |
| `TableCard` | `title, viewAllTo, columns[], rows[]` | Kolom `status` mendukung `{ label, tone }` untuk `StatusBadge` |
| `HighlightCard` | `title, description, ctaLabel, ctaTo, badges?` | Gradient biru, pill CTA putih pakai nilai tetap `primary-900` (bukan token `*-fg`) |
| `ListCard` | `title, viewAllTo, items[]` | `items = [{ initials, primary, secondary }]` |
| **Orphan — tidak diimpor di mana pun** | | |
| `GreetingBanner`, `QuickActions`, `AttendanceByClassCard`, `FinanceSummaryCard`, `ActivityTimelineCard`, `ChartCard`, `ActionCards` | — | Sisa layout Admin lama (`32b4031`) + `ActionCards` (baru, belum disambungkan). Kandidat hapus. |

---



## Internasionalisasi (i18n)

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
- **Warna persis Figma** (redesain Admin 2026-09-25, Ortu v1.0, Sidebar Expanded 2026-09-28) → boleh pakai hex literal langsung di JSX; **jangan** diam-diam "dibetulkan" jadi token tema tanpa diskusi, karena bentuk plek Figma adalah permintaan eksplisit. Kalau menambah, tulis komentar singkat berisi hex-nya supaya gampang di-grep saat migrasi token.

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
- **Redesain Sidebar Expanded Figma (2026-09-28) belum pernah diklik-test di browser.** Perlu dicek mata: lengkung organik kanan-atas di ukuran viewport berbeda, scroll nav saat semua grup terbuka (pitch 47.5px), dark mode (panel biru konstan vs header yang ikut tema), dan posisi pill saat label seksi panjang. Utang kontras yang **sengaja dibiarkan** supaya plek Figma: putih di atas `#2082F5` **4,31:1** dan di atas item aktif putih 18% **≈3,4:1** — keduanya di bawah AA 4.5:1 untuk teks 13.5px.
- **Redesain Dashboard Admin Figma (2026-09-25/26) belum pernah diklik-test di browser.** Perlu dicek mata: responsive 3 kolom → 1 kolom, tab `NAV_TOP_TABS` di layar sempit, `OrganicWaveSidebar` saat collapse/hover, dark mode (banyak warna hardcode), dan aksi "Ingatkan"/"Ingatkan semua".
- **Direkonstruksi dari kode, bukan catatan sesi**: deskripsi supaya shell mobile, Dashboard Ortu v1.0, dan redesain Admin di dokumen ini diturunkan dari membaca kode + `git log` (bukan dari transkrip sesi yang menyentuhnya). Kalau ada detail perilaku yang tidak sesuai, perlakukan kode sebagai sumber kebenaran.
- **Kontradiksi sidebar belum diputuskan**: dokumen ini (dan implementasi `--color-bg-sidebar: #ffffff` di light + komentar `index.css`) menyebut light = putih, tapi `PRODUCT.md` & root `context.md` masih menulis "sidebar selalu navy di kedua tema". Salah satu harus diperbaiki. Sejak 2026-09-28 nav expanded selalu biru, jadi sisa persoalannya cuma latar kolom + `OrganicWaveSidebar`.
- **Fitur Pengaduan (Admin 2026-09-28 + Ortu 2026-09-30) belum pernah diklik-test di browser.** Perlu dicek mata: tile ringkasan vs `counts`, filter overdue, alur Proses → Selesaikan (wajib isi catatan penyelesaian), serta di sisi Ortu modal pengajuan di layar sempit, lampiran, dan thread balasan dua arah. Verifikasi yang sudah dilakukan hanya `php artisan test --filter=Complaint` (12 passed / 53 assertions) + `npm run build`/`lint` bersih.
- **Utang kecil**: `ActionCards.jsx` + 6 komponen dashboard orphan belum dihapus; prop `rightRail` sudah tidak dipakai; SVG ilustrasi >1 MB (`boy`/`girl`/`logo baru`) ikut precache PWA; lint masih 5 warning (0 error).
