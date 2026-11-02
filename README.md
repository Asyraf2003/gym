# ForgeFit

Pelacak latihan Android untuk kardio, dada, punggung, kaki, dan latihan tambahan.

**Status:** pratinjau UI interaktif v0.5, belum aplikasi produksi.

## Instal dari GitHub Actions
1. Buka tab **Actions** repo ini.
2. Pilih **Bangun APK ForgeFit** lalu buka run terbaru yang **sukses**.
3. Unduh artifact **ForgeFit-pratinjau-APK**.
4. Ekstrak ZIP dan pasang **app-debug.apk** pada Android.

APK pratinjau ditandatangani dengan debug key runner CI yang bisa berubah; jangan mengandalkan update di tempat antarrun. Data di versi ini hanya simulasi (WebView localStorage), **belum SQLite** dan belum siap untuk data latihan penting.

## Cara kerja
- Tampilan dan seluruh interaksi utama dalam Bahasa Indonesia, kecuali nama gerakan.
- Tema gelap/terang/sistem, rutinitas, pencatatan set dan kardio, timer, riwayat simulasi.
- Berjalan lokal dari `app/src/main/assets/`, tanpa izin Internet.
- Backup GitHub privat hanya opsi desain masa depan, tidak ada pengunggahan data.

## Build
`gradle :app:assembleDebug` (Android SDK dan Java 17 diperlukan).

## Perlindungan kode lama
Aplikasi GymLog sebelumnya disimpan pada branch `archive/gymlog-before-forgefit-2026-11-02`. `main` sekarang ForgeFit.

## Rencana sesudah review
Native Jetpack Compose + Room SQLite (default), provider backup privat opsional, keystore signing stabil, CI tests Android.

## Guided Workout v0.5
- Pilih rutinitas → preparation screen dengan tombol Start, tanpa checklist.
- Setelah Start, hanya satu set/cardio step yang aktif; checklist tunggal berada pada dock bawah.
- Checklist → rest countdown otomatis → pindah ke set berikutnya tanpa mencentang otomatis.
- Saat ganti gerakan, perlu Start baru. Set/gerakan selesai readonly dan tidak bisa diedit lewat Tuning.
- Tuning hanya mengubah set sekarang dan langkah mendatang; OK kembali ke posisi sama.
- Data masih simulasi localStorage dan tidak ditujukan sebagai logger latihan produksi.
- Debug signing antar GitHub runner belum stabil. APK baru mungkin perlu uninstall preview lama; ini bukan mekanisme update produksi.


## v0.6: Launcher opening & version safety
- Opening animasi ForgeFit dengan nomor versi dan tombol Lewati.
- Badge v0.6.0 selalu terlihat pada header, dapat ditekan untuk informasi build.
- Nama launcher "ForgeFit Preview 0.6".
- Package ID preview terpisah: id.forgefit.preview, sehingga bisa dipasang tanpa menghapus preview v0.3 lama (id.forgefit.app).
- Data simulasi v0.3 **tidak otomatis pindah** ke preview v0.6. Jangan uninstall aplikasi lama jika datanya masih dibutuhkan.
- Debug APK runner CI tidak memakai signing key permanen. Update-in-place untuk preview berikutnya belum dijamin; release signing harus menggunakan key stabil secara aman nanti.

## v0.7: Progres aktual & Profil Tubuh (UI preview)
- Progress: tab Beban, Kardio, Tubuh, dan filter 7/30 hari/semua.
- Grafik hanya dari data yang benar-benar tercatat. Belum ada data berarti empty state, bukan grafik ilustrasi.
- Beban: completed sets, volume per exercise, puncak beban per session.
- Cardio: durasi aktual (timer) dan intensitas, bukan durasi target.
- Profil opsional: BB, TB, jenis kelamin, target latihan, serta catatan BB berkala.
- Penyimpanan masih localStorage per APK preview, tidak dikirim ke server.
- v0.7 memakai package preview terpisah (id.forgefit.preview.v07) untuk mencegah error debug signing dan menjaga instalasi v0.6.
- Fitur cloud dan database Room SQLite belum diintegrasikan.

## v0.8: Bottom sheet filter Progress

- Header: versi yang clickable tampil sebagai teks tanpa kotak. Settings icon transparan dengan tap area 44px.
- Progress: satu ikon filter di kanan, ringkasan filter aktif di kiri, tanpa chip filter inline.
- Ikon filter memunculkan bottom sheet dari bawah untuk Bagian (Beban/Kardio/Tubuh) dan Rentang (7/30 hari/Semua).
- Default **Beban + 7 hari**. Pilihan baru aktif setelah Terapkan; Batal, backdrop, Android Back, Escape atau swipe handle ke bawah membuang draft.
- Reset hanya mengatur draft ke Beban + 7 hari sampai Terapkan. Analytics dan Guided Workout v0.7 dipertahankan.
- Kedua tema terang/gelap tetap didukung. Ini UI preview localStorage, bukan SQLite native atau GitHub backup.
- Package preview v0.8 `id.forgefit.preview.v08` terpisah dari v0.7 karena debug signing GitHub runner belum stabil.

## v0.8.1: Filter bottom sheet tidak refresh ketika memilih opsi
- Tap Bagian/Rentang/Reset hanya mengubah state radio button dan aria-checked di DOM yang sama.
- Modal tidak di-render ulang, animasi tidak restart, posisi sheet tetap.
- Pilihan belum diterapkan sampai tombol Terapkan. Cancel/backdrop/swipe tetap membuang draft.
- Preview APK dipisahkan sebagai `id.forgefit.preview.v081` untuk menjaga data yang tersimpan di APK lama; riwayat tidak berpindah otomatis.

## ForgeFit v0.9: Notifikasi Android

- Meminta izin `POST_NOTIFICATIONS` saat membuka aplikasi pertama kali di Android 13+; Settings juga menyediakan tombol izin dan uji notifikasi.
- Rest selesai dapat mengirim notifikasi Android walau aplikasi ditutup/minimized; tidak menampilkan notifikasi ganda ketika aplikasi aktif.
- Rest alarm dibatalkan saat skip, waktu habis, sesi selesai, atau notifikasi rest dinonaktifkan; perubahan +15 detik menjadwalkan ulang.
- Reminder olahraga dapat diatur jam (default 18:00), hari Senin–Minggu, dan switch aktif/nonaktif di Pengaturan.
- AlarmManager + BroadcastReceiver menjalankan notifikasi walau WebView tidak berjalan. Jadwal diulang setelah reboot/time zone berubah.
- Rest timer menggunakan exact alarm hanya ketika izin "Alarms & reminders" tersedia. Jika tidak, fallback inexact `setAndAllowWhileIdle`, sehingga notifikasi bisa terlambat. Reminder memang memakai inexact alarm untuk hemat baterai.
- Tidak ada internet/background upload; pengaturan native di SharedPreferences dan workout UI di WebView localStorage. Masih preview, belum Room SQLite atau cloud backup.
- Preview dipasang terpisah sebagai `id.forgefit.preview.v09` untuk menjaga instalasi lama. Data preview sebelumnya tidak bermigrasi otomatis.

## v0.9.1: Edit nama gerakan dan katalog lebih lengkap

- Tuning pada sesi aktif mendukung mengubah nama gerakan secara manual, memilih dari katalog dan mengganti jenis pencatatan set/reps atau durasi cardio.
- Pencarian gerakan tersedia di Tuning dan modal tambah gerakan, dengan filter kategori. Hasil berubah tanpa merender ulang modal.
- Kategori Perut/Core dan 50 opsi tambahan untuk Dada, Punggung, Kaki, Perut, Kardio, Bahu, dan Lengan.
- Default rutinitas baru untuk 3 fokus utama menambahkan opsi core + cardio; rutinitas pengguna yang sudah dimodifikasi tidak ditimpa.
- Jika sebagian set sudah selesai, rename memisahkan sisa set ke gerakan baru. Catatan set yang selesai tetap menyimpan nama aslinya; gerakan lama menjadi read-only.
- Pergantian jenis pencatatan pada langkah yang sedang aktif harus menunggu sebelum Start (untuk mencegah kehilangan timer/set).
- Ini tetap UI preview dengan localStorage, belum SQLite maupun update APK bertanda tangan stabil.
- APK dipasang terpisah sebagai `id.forgefit.preview.v091` supaya data aplikasi lama tidak berubah.

## v0.9.2: Perbaikan UX Tuning / pencarian / Progress
- Bottom sheet tidak lagi mengekspos background putih: window Android bertema gelap, overscroll WebView dimatikan, dan body scroll dikunci saat dialog terbuka.
- Picker kini menggunakan pencarian langsung, satu dropdown kategori (tanpa chips terpotong), hasil maksimal enam dulu, penghitung hasil, tombol Tampilkan lagi, serta tombol hapus pencarian.
- Mengganti kategori atau mengetik tidak membuat ulang sheet; daftar selalu kembali ke awal ketika filter berubah. Tidak ada nested scrolling di daftar hasil.
- Setelah memilih gerakan dari katalog, nama di form diperbarui dan muncul konfirmasi sebelum tombol OK menyimpan perubahan.
- Progress Beban menggunakan dropdown nama gerakan agar pilihan aktif selalu terlihat, termasuk untuk banyak gerakan.
- Data dan pencatatan completed sets tetap mengikuti engine sebelumnya. Preview memakai application ID berbeda agar APK lama tidak tertimpa; data localStorage belum bermigrasi.

## v0.9.3: Picker UX & Progres lebih bermakna
- Halaman Progress Beban menampilkan **Set selesai** dan **Sesi Beban** (jumlah sesi unik yang memiliki set selesai). Total Volume dan volume tonase per baris tidak lagi menjadi metrik UI utama.
- Modal Tuning memakai backdrop gelap solid pada Android WebView untuk menutup white bleed pada sudut membulat.
- Pemilih gerakan mempertahankan dropdown kategori, pencarian langsung per karakter, enam hasil awal, dan tombol tampilkan berikutnya.
- Saat opsi katalog dipilih, konfirmasi muncul pada form sebelum menyimpan. State expand/collapse diberi aria-expanded dan tidak melakukan render ulang modal.
- Engine latihan, data completed sets, timer, profil, dan notifikasi dari versi sebelumnya tidak diubah.
- APK debug preview memakai package id `id.forgefit.preview.v093`, terpisah dari v0.9.2; data dari preview lama tidak otomatis berpindah.
