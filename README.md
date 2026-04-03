# Prediksi Lolos SNBT AI

Aplikasi berbasis web untuk membantu calon mahasiswa memprediksi peluang kelulusan SNBT (Seleksi Nasional Berdasarkan Tes) menggunakan algoritma heuristik dan kecerdasan buatan (AI) dari Groq.

## Fitur Utama

* **Autentikasi Aman**: Login terintegrasi menggunakan Google (NextAuth.js).
* **Analisis AI Pintar**: Menggunakan model LLaMA 3.1 via Groq SDK untuk evaluasi skor TryOut.
* **Keamanan Ketat**: Dilengkapi Rate Limiting (Anti-Spam), Input Sanitization, dan Security Headers.
* **UI/UX Modern**: Pencarian prodi otomatis, opsi input detail/rata-rata, dan fitur Dark Mode.

## Teknologi

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* NextAuth.js
* Groq SDK

## Persiapan Instalasi

1. Clone repositori ini:
   ```bash
   git clone [https://github.com/username-anda/nama-repo.git](https://github.com/username-anda/nama-repo.git)
   cd nama-repo
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Buat file `.env.local` pada direktori utama dan tambahkan kredensial berikut:
   ```env
   GROQ_API_KEY=kunci_api_groq_anda
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=kunci_rahasia_acak_anda
   GOOGLE_CLIENT_ID=client_id_google_anda
   GOOGLE_CLIENT_SECRET=client_secret_google_anda
   ```

4. Jalankan aplikasi di tahap pengembangan:
   ```bash
   npm run dev
   ```

## Catatan

Hasil yang diberikan oleh aplikasi ini bersifat simulasi dan prediksi. Skor dan peluang yang ditampilkan bukan merupakan keputusan resmi dari panitia SNPMB.

## Pembuat

Dibuat oleh **Muhammad Rifai**. 
Kunjungi portofolio selengkapnya di [mrfai.web.id](https://mrfai.web.id).

Lisensi MIT.