# Dokumentasi Database: prd_chat

File ini berisi ringkasan struktur tabel dan isi data dari database `prd_chat` per tanggal 3 Juni 2026.

## Ringkasan Tabel

| Nama Tabel | Deskripsi Singkat | Jumlah Data |
| :--- | :--- | :--- |
| **User** | Data pengguna aplikasi (Nama, Email, Password terenkripsi). | 0 |
| **Account** | Koneksi akun media sosial/provider (NextAuth). | 0 |
| **Session** | Sesi login aktif pengguna. | 0 |
| **Project** | Wadah proyek PRD yang dibuat user. | 0 |
| **Chat** | Sesi obrolan dalam sebuah proyek. | 0 |
| **Message** | Detail pesan dalam obrolan (User/Assistant). | 0 |
| **VerificationToken** | Token verifikasi email (NextAuth). | 0 |

---

## Struktur Detail & Data

### 1. User
Menyimpan identitas utama pengguna.
- **Kolom Utama**: `id`, `name`, `email`, `password`.
- **Status**: Database saat ini kosong.

### 2. Account & Session
Digunakan oleh NextAuth.js untuk mengelola autentikasi.
- **Status**: Tidak ada sesi atau akun tertaut saat ini.

### 3. Project, Chat, & Message
Inti dari aplikasi "PRD Factory".
- Proyek menampung banyak Chat.
- Chat menampung banyak Message.
- **Status**: Belum ada konten proyek atau pesan yang dibuat.

---

## Kesimpulan
Database `prd_chat` sudah memiliki skema yang lengkap dan benar sesuai dengan `schema.prisma`. Namun, saat ini **seluruh tabel masih dalam keadaan kosong**. Hal ini menunjukkan bahwa belum ada user yang berhasil terdaftar atau melakukan aktivitas (pembuatan proyek/chat) setelah sinkronisasi database terakhir.

Setelah registrasi berhasil, data akan mulai terisi pada tabel `User`.
