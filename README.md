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
