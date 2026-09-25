# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Admin Sekolah/TU — operator utama (dikonfirmasi user: role yang kepentingannya tidak boleh dikorbankan saat ada trade-off desain).** Staff tata usaha/yayasan. Satu role tunggal tanpa sub-role, akses penuh ke semua modul. Bekerja berjam-jam di workstation, berhadapan dengan data lintas modul (siswa, staff, absensi, jemput, keuangan, audit log). Keputusan sadar: Finance & HR tetap di bawah role Admin, tidak dipecah jadi role terpisah.

**Guru (wali kelas).** Satu guru memegang satu rombel pada MVP. Situasi pemakaian: di sela mengajar, sering dari HP — input absensi rombel yang diampu, koreksi absensi dalam jendela toleransi, verifikasi jemput anak, absensi pribadi (selfie), pengajuan cuti/izin.

**Orang tua/wali.** Satu akun bisa terhubung ke lebih dari satu anak (many-to-many). Pengguna paling awam dan paling jarang login: melihat absensi & riwayat jemput anak, mengelola daftar penjemput sah, melihat & membayar tagihan SPP, memberi/menarik consent data anak. Prioritas desainnya kejelasan, bukan kepadatan data.

**Staff non-guru (mis. satpam).** Absensi pribadi, cuti/izin, dan berperan sebagai verifikator di gerbang untuk modul jemput anak — sering dipakai satu tangan di HP sambil berdiri di gerbang.

**Siswa** adalah subjek data, bukan pengguna yang login pada MVP.

**Calon orang tua / pengunjung publik** — homepage publik sebelum login (FR-5.6), murni presentasional, tanpa data operasional.

## Product Purpose

Menggantikan proses manual (kertas, WhatsApp, Excel) di empat area operasional inti sebuah sekolah dasar internasional: absensi siswa, penjemputan siswa (digital dismissal), manajemen staff (HR non-payroll), dan keuangan (SPP/billing). Sistem ini bukan LMS akademik — materi, tugas, kuis, dan nilai/rapor eksplisit di luar MVP.

Sukses diukur dari: adopsi digital penuh (sistem jadi satu-satunya sumber kebenaran, guru/staff/orang tua berhenti memakai proses manual), proses jemput anak yang lebih cepat dan lebih aman daripada pencatatan manual, keterlambatan pembayaran SPP yang berkurang, dan administrasi HR yang lebih rapi serta terdokumentasi.

## Positioning

Yang membedakan produk ini dari sekadar "form digital": **mekanisme verifikasi penjemputan yang tegas dan bisa dicabut**, bukan pencatatan pasif.

- QR unik per kombinasi (penjemput × siswa) — satu orang yang menjemput dua anak punya dua QR terpisah, karena verifikasi dilakukan per anak meski dijemput bersamaan.
- Deny-by-default: penjemput yang tidak ada di daftar sah memblokir tombol konfirmasi checkout, bukan sekadar memunculkan peringatan; ada jalur eskalasi eksplisit ke admin & orang tua.
- Penjemput baru berstatus menunggu persetujuan admin sebelum QR-nya aktif, dan QR punya masa berlaku.
- Otorisasi bersifat hidup: begitu penjemput dicabut dari daftar sah, QR-nya langsung tidak valid.

Lapis kedua yang posisinya sama kuatnya: **consent orang tua (UU PDP) ditegakkan di kode, bukan dicatat sebagai formalitas** — menarik persetujuan langsung mencabut akses ke data anak (defense-in-depth di samping gate UI), dan seluruh perubahan data penting meninggalkan audit trail.

**Scope komersial (dikonfirmasi user): sistem internal untuk JACOS dulu, tapi arahnya disiapkan untuk bisa ditawarkan ke sekolah/yayasan lain.** Konsekuensi yang mengikat: jangan menempelkan identitas/asumsi satu sekolah di tempat yang nanti menghalangi sekolah lain, tapi jangan pula mengorbankan kebutuhan nyata JACOS hari ini demi generalisasi. MVP berjalan single-tenant (satu sekolah); multi-cabang/multi-tenant penuh adalah roadmap, bukan alasan membangun fitur sekarang.

## Operating Context

- Sekolah Islam internasional jenjang SD, kelas 1–6, beberapa rombel per tingkat (mis. 3A/3B), satu wali kelas per rombel.
- Zona waktu **Asia/Jakarta (WIB)** untuk seluruh pencatatan waktu (absensi, jemput, invoice).
- **Dwibahasa Indonesia + English** di seluruh UI, pesan sistem, dan notifikasi.
- Tahun ajaran aktif + kalender hari libur; pada tanggal libur, absensi siswa dan proses jemput tidak relevan.
- Provisioning akun **invite-only oleh Admin** — tidak ada self-register. Reset password lewat link email.
- Siklus keuangan bulanan: invoice SPP digenerate otomatis per siswa aktif pada tanggal 1, jatuh tempo default 10 hari, pelunasan penuh dalam satu transaksi (tanpa cicilan), tanpa denda otomatis pada MVP.
- Notifikasi lewat PWA **Web Push (VAPID)** untuk kejadian penting (anak tidak hadir, anak dijemput, penjemput ditolak, tagihan terbit, pembayaran berhasil, hasil review cuti, pengumuman) plus bell/drawer di dalam app.
- Perangkat: kamera browser dipakai untuk scan QR di gerbang dan foto selfie absensi staff.
- Peran dokumentasi: `PRD.md` adalah single source of truth; `prd-backend.md`/`prd-frontend.md` adalah turunan satu arah yang tidak boleh menambah scope.

## Capabilities and Constraints

**Di dalam scope MVP (4 modul dibangun paralel, tanpa urutan prioritas):** absensi siswa (input manual wali kelas, catatan per siswa, jendela edit dengan audit, riwayat untuk orang tua, rekap + export admin); jemput anak (daftar penjemput sah + QR per anak, scan kamera oleh guru/satpam, fallback manual dengan catatan wajib, log jemput, cut-off dismissal + flag "belum dijemput", approval penjemput baru); HR non-payroll (data master staff, self check-in/out dengan foto wajib, koreksi admin dengan audit, cuti/izin dengan approval langsung oleh Admin termasuk opsi "minta revisi"); keuangan (struktur biaya per tingkat, generate invoice bulanan otomatis/idempotent, pembayaran online penuh via gateway, webhook settlement, tandai lunas manual, pembatalan invoice otomatis saat siswa keluar di tengah bulan). Ditambah lintas-modul: auth/RBAC, notifikasi, i18n ID/EN, consent data anak, audit log, pengumuman, dan homepage publik.

**Eksplisit di luar scope:** modul akademik (materi, tugas, kuis, nilai/rapor), payroll, arsitektur multi-tenant penuh, aplikasi mobile native, migrasi data dari sistem lama (greenfield), pembayaran sebagian, dan denda otomatis.

**Constraint teknis:** Laravel + React/Vite + MySQL; autentikasi Laravel Sanctum mode SPA/stateful (cookie, bukan token murni); RBAC middleware per modul + policy row-level (guru hanya rombelnya, orang tua hanya anaknya, dan hanya selama consent-nya aktif); audit log untuk perubahan data penting; retensi foto bukti (selfie absensi, foto penjemput) 1 tahun ajaran; foto bukti dipurge terjadwal.

**Fakta yang sengaja belum diputuskan — jangan diisi dengan asumsi di dokumen/UI baru:**

- **Payment gateway final belum dikonfirmasi** (Midtrans hanya rekomendasi, belum ada kredensial/kontrak). Integrasinya masih stub; UI wajib jujur menyatakan gateway belum terhubung ke akun produksi, bukan pura-pura sukses.
- **Format kwitansi/bukti bayar final** menunggu konfirmasi akuntan/legal yayasan. Yang berjalan sekarang adalah respons JSON sederhana yang ditampilkan di modal — bukan PDF resmi.
- **Kunci VAPID produksi belum ada** — subscription browser sudah tersimpan, job pengiriman push-nya belum dibuat.
- **Hosting/deployment belum ditentukan.**
- **Ekspor PDF/Excel belum diimplementasikan** (endpoint masih mengembalikan JSON; tombol export di UI sengaja dinonaktifkan). Format targetnya PDF & .xlsx.
- **Standar aksesibilitas belum ditetapkan** — belum ada keputusan tingkat WCAG atau kebutuhan aksesibilitas spesifik pengguna, jadi jangan mengklaim kepatuhan apa pun.

## Brand Commitments

- **Nama resmi: Jakarta Cosmopolite Islamic School (JACOS)** — dipakai di produk, bukan nama generik.
- **Tone: "Ramah & Hangat"** — hangat dan bersahabat, tapi tetap profesional dan tepercaya; bukan playful, bukan kekanak-kanakan.
- **Identitas visual yang sudah diikat sebagai keputusan, bukan usulan:** palet biru brand dengan aksen amber (dipakai hemat, hanya untuk highlight/CTA), Plus Jakarta Sans untuk heading + Inter untuk body, sudut membulat dengan ruang putih lega, **sidebar selalu navy di kedua tema** (tidak ikut toggle), **dark mode termasuk scope sejak awal** (bukan pasca-MVP), dan motif geometris islami hanya di homepage/auth — layar operasional dibiarkan bersih. Detail lengkap ada di `design-dashboard.md` dan token di `frontend/src/index.css`.
- **Aset brand asli tersedia** di `frontend/src/assets/guide/` (logo, palet warna, referensi layout dashboard & homepage & hero section) dan foto asli di `frontend/src/assets/picture/`.
- **Tidak ada sub-role Admin** dan tidak ada role Principal/Finance/HR terpisah — keputusan user yang harus dihormati (referensi eksternal `jacos-react/` memakai role lebih granular; itu bukan arah sistem ini).
- `jacos-react/` hanya referensi fitur/logika: desain visualnya **bukan** referensi, dan scope-nya tidak menambah role atau modul.

## Evidence on Hand

- **`PRD.md` v0.3** — single source of truth fungsional: functional requirements + acceptance criteria, ringkasan data model, daftar layar per role, NFR (keamanan, UU PDP, platform). Turunannya `prd-backend.md` (endpoint, business logic, scheduled jobs per FR) dan `prd-frontend.md` (routing, perilaku layar, state, validasi client per FR).
- **`context.md`** — riwayat keputusan & status implementasi per sesi, termasuk daftar jujur bagian yang masih stub.
- **`design-dashboard.md`** — spesifikasi dashboard + app shell untuk 4 role (reskin dari referensi layout ke palet JACOS).
- **`context-design-handoff.md`** — prompt siap pakai untuk generate ulang layar dashboard via AI design tool.
- **Aplikasi yang benar-benar berjalan**, bukan konsep: implementasi backend penuh (≈62 endpoint API, 20 migration + 19 model, 3 scheduled command) dan frontend penuh (≈50 route dengan app shell, sidebar per role, guard per role, i18n, dark mode, PWA).
- **Data demo nyata** dari `DemoDataSeeder`: 6 rombel, 30 siswa dengan akun orang tua, 18 hari sekolah berisi absensi siswa & staff, 8 pengajuan cuti lintas status, penjemput sah + ratusan log jemput historis, 91 invoice lintas tiga bulan dengan status bervariasi. Akun demo `*@jacos.sch.id`, password `password`.
- **Verifikasi yang sudah dijalankan:** kontrak API diuji langsung via curl (login → aksi → verifikasi state berubah, termasuk alur negatif seperti withdraw consent → 403 → re-consent); sebagian alur diuji klik langsung di browser; `npm run build` hijau di setiap fase. Catatan: klik-test browser belum menyeluruh ke semua layar.
- **Yang TIDAK ada dan tidak boleh dikarang:** konten pemasaran publik asli — profil sekolah, visi/misi, alur & syarat admisi, alamat/kontak, akreditasi, prestasi, testimoni orang tua, angka kelulusan, atau biaya pendaftaran. Homepage saat ini memakai foto asli + teks pengantar saja dan boleh disusun ulang begitu materi resmi sekolah tersedia. Tidak ada testimoni, kasus pelanggan, benchmark, atau angka press nyata yang bisa dikutip.

## Product Principles

1. **Satu sumber kebenaran digital.** Kalau satu langkah masih harus diselesaikan lewat kertas, WhatsApp, atau Excel, alur itu belum selesai — pekerjaannya adalah menutup celah terakhir, bukan menambah fitur baru di sebelahnya.
2. **Keselamatan anak di atas kenyamanan.** Verifikasi per anak, penolakan default untuk penjemput tak terdaftar, dan otorisasi yang bisa dicabut seketika selalu menang atas alur yang lebih cepat atau lebih sedikit klik.
3. **Admin/TU adalah operator prioritas; role lain harus cukup sederhana untuk dipakai sambil mengajar atau berdiri di gerbang.** Saat trade-off muncul, throughput admin menang — tapi guru, staff, dan orang tua tetap pengguna sungguhan, bukan kasus tepi.
4. **Jejak dan persetujuan adalah warga kelas satu.** Audit log dan consent UU PDP ditegakkan di kode dan di UI, bukan hanya dicatat di dokumen.
5. **Bangun untuk JACOS hari ini, tanpa menutup pintu untuk sekolah lain.** Generalisasi yang belum dibutuhkan tidak boleh menjadi alasan menahan perbaikan nyata, dan identitas satu sekolah tidak boleh tertanam di tempat yang nanti menghalangi.

<!-- Salinan manual dari ../PRODUCT.md — master ada di root project. Re-sync manual kalau master direvisi (pola sama seperti PRD.md). -->
