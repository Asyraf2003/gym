# ForgeFit

Aplikasi latihan pribadi offline untuk Android, dengan rutinitas adaptif, pelacakan set/kardio, riwayat, profil, dan notifikasi pengingat.

## Penyimpanan dan upgrade

- **Sumber data tunggal di Android:** database SQLite internal bernama `forgefit.db`, menggunakan transaksi atomic, WAL, checksum SHA-256, revision counter, dan schema version. Tidak ada backend/cloud wajib.
- Data `localStorage` versi sebelumnya diimpor **sekali** saat database SQLite kosong, lalu seluruh perubahan berikutnya ditulis ke SQLite saja. Legacy localStorage sengaja dibiarkan sebagai rollback archive, bukan penyimpanan aktif.
- **Application ID `id.forgefit.preview.v093` sengaja dipertahankan** demi akses ke data dari instalasi v0.9.3/v0.10.0. Meski identitas lama mengandung kata preview, nama yang tampil di launcher hanya **ForgeFit**. Mengubah package ID sekarang akan memutus akses ke data lama.
- `versionCode` naik untuk pembaruan. **APK hanya bisa di-upgrade tanpa uninstall bila ditandatangani dengan sertifikat yang sama.** Debug signing GitHub Actions bersifat sementara, bukan mekanisme distribusi production. Jangan uninstall aplikasi berisi data tanpa backup.
- Menu Pengaturan menyediakan ekspor JSON melalui Android Storage Access Framework. Cadangan itu tidak diunggah otomatis dan belum memiliki fitur restore dari dalam aplikasi.
- Upgrade schema di masa depan wajib non-destructive. Migrasi yang belum didukung harus gagal tanpa DROP tabel.

## Notifikasi

- Rest timer menggunakan exact alarm ketika Android mengizinkan, fallback inexact dapat terlambat saat background/doze.
- Foreground: panel alert persisten ditambah audio/vibration. Background: high-importance notification channel baru dengan getaran.
- Perizinan notifikasi/exact alarm tetap dikendalikan Android; DND dan battery saver dapat memblokir sebagian feedback.

## Kode dan verifikasi

- UI WebView offline: `app/src/main/assets/`.
- Storage dan notifikasi native Android: `app/src/main/java/id/forgefit/app/`.
- GitHub Actions menjalankan test JavaScript, integrasi UI, validasi Android, dan kompilasi APK.
- **Distribusi production baru dapat dijamin setelah signing key stabil tersedia** di luar repository dan upgrade pada perangkat aktual diuji. Jangan menyimpan keystore/password di Git.
