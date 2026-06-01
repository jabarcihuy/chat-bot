# Nexus AI: Vibe Coder's PRD Factory

Nexus AI adalah chatbot cerdas yang dirancang khusus untuk Vibe Coder. Platform ini berfungsi sebagai "Pabrik Instruksi" yang mengubah ide-ide mentah menjadi Dokumen Persyaratan Produk (PRD) yang terstruktur dan siap dieksekusi oleh AI Coding Agent (seperti Cursor, Windsurf, atau Gemini CLI).

## Fitur Utama

- **Vibe-to-PRD Workflow**: Mode khusus yang mengubah ide singkat menjadi dokumen teknis mendalam.
- **Task-Focused AI**: Gemini bertindak sebagai Senior Technical PM, Architect, atau Data Scientist tergantung target tugas Anda.
- **Indonesian First**: Antarmuka dan instruksi sistem sepenuhnya dalam Bahasa Indonesia.
- **Retro Pop UI**: Tampilan modern, berkarakter, dan responsif di semua browser.
- **Clean Export**: Unduh hasil kerja langsung ke format .md murni tanpa basa-basi chat.

## Penjelasan Fitur PRD

Setiap target fokus di Mode PRD dirancang untuk mengekstrak informasi spesifik yang dibutuhkan oleh AI Coding Agent:

1. **Struktur PRD**: Gemini bertindak sebagai Technical PM Senior. Fitur ini mengubah ide kasar Anda menjadi kerangka dokumen formal yang mencakup konteks proyek, pernyataan masalah, dan persyaratan fungsional utama.
2. **User Stories**: Gemini berfokus pada Pengalaman Pengguna. Fitur ini menjabarkan skenario interaksi secara detail menggunakan format standard "Sebagai... Saya ingin... Sehingga...".
3. **Tech Stack**: Gemini bertindak sebagai Software Architect. Fitur ini memberikan rekomendasi teknologi terbaru, struktur folder, dan batasan arsitektur.
4. **Metrik Sukses**: Gemini bertindak sebagai Product Analyst. Fitur ini membantu Anda menentukan tolok ukur keberhasilan proyek (KPI) serta mengantisipasi berbagai edge cases (skenario error).

## Alur Kerja (Flowchart)

Berikut adalah bagaimana Nexus AI menjembatani ide Anda hingga menjadi kode nyata:

```mermaid
graph TD
    A[User / Vibe Coder] -->|Ide Kasar / Vibe| B(Nexus AI - Mode PRD)
    B --> C{Pilih Fokus Tugas}
    C -->|Struktur| D[Gemini Technical PM]
    C -->|User Stories| E[Gemini Product Manager]
    C -->|Tech Stack| F[Gemini System Architect]
    C -->|Metrik| G[Gemini Data Scientist]
    D & E & F & G --> H[Dokumen PRD Terstruktur]
    H -->|Unduh .md| I[File PRD Selesai]
    I -->|Prompting| J[AI Coding Agent]
    J -->|Eksekusi| K[Project / Aplikasi Jadi]
```

## Cara Menggunakan

### 1. Persiapan
Clone repositori ini dan instal dependensinya:
```bash
git clone https://github.com/username/chat-bot.git
cd chat-bot
npm install
```

### 2. Konfigurasi API
Buat file .env.local di root folder dan masukkan API Key Google AI Studio Anda:
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

### 3. Jalankan Aplikasi
```bash
npm run dev
```

### 4. Mulai Membangun
1. Beralih ke Mode PRD melalui toggle di Header.
2. Pilih target fokus (misal: Struktur PRD).
3. Ketik ide Anda (misal: "Aplikasi pengelola stok gudang sepatu").
4. Gemini akan menyusun dokumennya.
5. Klik Unduh .md untuk menyimpan hasilnya.

## Tips untuk Vibe Coder
Gunakan file .md hasil download dari Nexus AI sebagai Konteks Utama saat memulai chat dengan AI Coding Agent Anda. Ini akan mencegah AI Agent berhalusinasi dan memastikan struktur kode sesuai dengan visi Anda.

## Teknologi
- Framework: Next.js 15+ (App Router)
- AI SDK: Vercel AI SDK (Google Generative AI)
- Styling: Tailwind CSS 4 & Shadcn/UI
- State Management: Zustand (Persisted)
- Icons: Lucide React
- Animations: Framer Motion

## Kontribusi
Kami menerima kontribusi dalam bentuk apa pun! Baik itu perbaikan bug, penambahan fitur persona baru, atau sekadar saran desain.

---
Dibuat untuk komunitas Open Source.
