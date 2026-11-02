# ForgeFit

Pelacak latihan Android untuk kardio, dada, punggung, kaki, dan latihan tambahan.

**Status:** pratinjau UI interaktif v0.3, belum aplikasi produksi.

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
