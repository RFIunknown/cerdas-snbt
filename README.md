# CERDAS (Cek Evaluasi Rata-rata Data Analisis SNBT)

**[Lihat Live Demo Aplikasi](.)**

## Tampilan Aplikasi

| Halaman Autentikasi | Input Skor UTBK | Analisis AI |
| :---: | :---: | :---: |
| ![Login](images/screenshot1.png) | ![Input](images/screenshot2.png) | ![Hasil](images/screenshot3.png) |

CERDAS adalah platform berbasis web yang dirancang untuk menganalisis peluang kelulusan Seleksi Nasional Berdasarkan Tes (SNBT). Aplikasi ini menggunakan integrasi Large Language Model (LLM) untuk memberikan umpan balik akademik yang personal berdasarkan skor TryOut pengguna.

## Fitur Utama

* **Analisis AI**: Evaluasi mendalam menggunakan LLaMA 3.1 via Groq SDK.
* **Autentikasi Google**: Sistem login aman menggunakan NextAuth.js.
* **Keamanan Tingkat Produksi**: Implementasi Rate Limiting, Input Sanitization, dan Security Headers.
* **Pencarian Pintar**: Navigasi otomatis untuk pangkalan data Universitas dan Program Studi.
* **Antarmuka Modern**: Desain responsif dengan dukungan Dark Mode.

## Teknologi Utama

* **Framework**: Next.js 14 (App Router)
* **Bahasa**: TypeScript
* **Styling**: Tailwind CSS
* **AI Engine**: Groq Cloud SDK
* **Autentikasi**: NextAuth.js

## Panduan Instalasi

1. Kloning repositori:
   ```bash
   git clone [https://github.com/RFIunknown/cerdas-snbt.git](https://github.com/RFIunknown/cerdas-snbt.git)
   cd cerdas
   ```

2. Instalasi dependensi:
   ```bash
   npm install
   ```

3. Konfigurasi Environment Variables (`.env.local`):
   ```env
   GROQ_API_KEY=kunci_api_anda
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=kunci_rahasia_anda
   GOOGLE_CLIENT_ID=google_id_anda
   GOOGLE_CLIENT_SECRET=google_secret_anda
   ```

4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## DISCLAIMER

Hasil prediksi ini bersifat simulasi berdasarkan algoritma heuristik dan data historis. Keputusan resmi kelulusan sepenuhnya merupakan wewenang panitia SNPMB.

## Kontributor

Dikembangkan oleh **Muhammad Rifai**.

Lisensi MIT