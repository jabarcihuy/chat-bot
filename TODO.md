# Nexus AI: Vibe Coder's PRD Factory - Todo List

Daftar tugas ini disusun berdasarkan hasil analisis proyek untuk mengubah Nexus AI dari status *MVP/Prototype* menjadi aplikasi skala produksi (*Production-Ready*).

## 🔴 Prioritas Tinggi (Fundamental & Stabilitas)
Fokus pada perbaikan teknis inti dan pencegahan hilangnya data.

- [x] **Perbaiki Bug Sinkronisasi State (React Hooks):**
  - [x] Audit file `src/app/page.tsx`.
  - [x] Perbaiki *dependency array* pada `useMemo` atau `useEffect` yang menangani perubahan `mode` dan `prdTask`.
  - [x] Pastikan perubahan *task* (misal dari "Structure" ke "Tech") segera merefleksikan perubahan *System Prompt* sebelum *user* mengirim pesan.
- [x] **Implementasi *Error Handling* & Notifikasi UI:**
  - [x] Tambahkan komponen *Toast* (dari Shadcn UI atau Sonner).
  - [x] Tangani error *Timeout* atau *Rate Limit* pada `src/app/api/chat/route.ts` dan tampilkan pesan ramah kepada *user*.
  - [x] Tangani skenario koneksi internet terputus saat *streaming chat*.

## 🟠 Prioritas Menengah (Penyimpanan Data & Autentikasi)
Fokus agar aplikasi memiliki retensi data jangka panjang untuk *user*.

- [x] **Setup Skema Database (Pilih salah satu: Supabase / Prisma+Postgres / Vercel KV):**
  - [x] Buat tabel/koleksi `Users`.
  - [x] Buat tabel/koleksi `Projects` (Satu *user* memiliki banyak proyek/ide).
  - [x] Buat tabel/koleksi `Chats` atau `PRD_Documents` (Terkait dengan sebuah proyek).
- [x] **Implementasi Autentikasi User:**
  - [x] Integrasikan `NextAuth.js` (Auth.js v5) or `Clerk`.
  - [x] Buat halaman Login/Register sederhana.
  - [x] Proteksi halaman utama aplikasi (hanya bisa diakses jika sudah login).
- [x] **Manajemen Riwayat Obrolan (Chat History):**
  - [x] Ubah arsitektur agar setiap sesi *chat* di-*save* otomatis ke database.
  - [x] Buat *Sidebar* untuk menampilkan "Riwayat Proyek" (seperti riwayat *chat* di ChatGPT).

## 🟡 Prioritas Normal (Pengalaman Pengguna & Fitur Inti)
Fokus menyempurnakan konsep "Pabrik PRD".

- [x] **Buat Komponen "PRD Canvas" (Split-Pane View):**
  - [x] Rancang ulang *layout* desktop: Kiri (Area Obrolan), Kanan (Kanvas Editor Dokumen).
  - [x] Integrasikan Text Editor berbasis Markdown (seperti `Novel` atau `TipTap`) pada Kanvas.
  - [x] Buat logika: Saat *user* puas dengan *output* AI di obrolan, tambahkan tombol "Masukkan ke PRD Utama".
- [x] **Fitur Eksport Terintegrasi:**
  - [x] Alih-alih mengunduh 4 file terpisah, buat tombol "Eksport PRD Lengkap" dari PRD Canvas.
  - [x] (Opsional) Dukungan ekspor ke format PDF selain `.md`.
- [x] **Perbaikan Konteks AI (Memory Management):**
  - [x] Modifikasi API di `route.ts`. Jika *user* berpindah dari "Structure" ke "User Stories", ambil hasil "Structure" dan kirim ke AI sebagai `context` agar "User Stories" yang dihasilkan relevan.

## 🟢 Prioritas Rendah (Polishing & Peningkatan)
Fokus pada estetika, kenyamanan ekstra, dan keamanan.

- [x] **Keamanan (Security Check):**
  - [x] Pastikan API key AI SDK diakses via `process.env` secara eksklusif di server.
  - [ ] Implementasi batasan limit (*Rate Limiting*) untuk API internal guna menghindari spamming token LLM.
- [x] **Fitur "Edit Prompt" Persona:**
  - [x] Berikan *user* (mungkin via halaman *Settings*) opsi untuk memodifikasi sedikit bagaimana AI bertindak (misal: "Saya ingin Tech Architect lebih condong menyarankan Node.js").
- [x] **Mobile Responsiveness Check:**
  - [x] Pastikan UI PRD Canvas (jika sudah jadi) bisa ditutup/dibuka (*toggle*) dengan rapi di layar HP.
- [ ] **Cleanup Kode:**
  - [ ] Hapus file-file *dummy* atau kode *unused* yang tersisa di `osrc/chat-bot`.

