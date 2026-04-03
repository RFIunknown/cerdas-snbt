import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from "next-auth/next";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const rateLimitMap = new Map();
const MAX_REQUESTS = 3; // Batas spam 3 kali
const WINDOW_MS = 60 * 1000; // Per 1 Menit

const sanitizeText = (text: any) => {
  if (typeof text !== 'string') return '';
  return text.replace(/[^a-zA-Z0-9 -]/g, '').substring(0, 100).trim();
};

export async function POST(request: Request) {
  try {
    // 1. CEK AUTENTIKASI
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Akses Ditolak: Silakan login terlebih dahulu." }, { status: 401 });
    }

    // 2. ANTI SPAM / DDOS LITE
    const userEmail = session.user.email;
    const currentTime = Date.now();
    const userData = rateLimitMap.get(userEmail) || { count: 0, startTime: currentTime };

    if (currentTime - userData.startTime > WINDOW_MS) {
      userData.count = 1;
      userData.startTime = currentTime;
    } else {
      userData.count++;
      if (userData.count > MAX_REQUESTS) {
        return NextResponse.json({ 
          error: "Spam terdeteksi!", 
          peluang: 0, 
          pesan_ai: "Sistem mendeteksi terlalu banyak permintaan. Tunggu 1 menit sebelum mencoba lagi." 
        }, { status: 429 });
      }
    }
    rateLimitMap.set(userEmail, userData);

    const body = await request.json();
    const { modeInput, skor, rataRata, target } = body;
    
    const universitas = sanitizeText(target?.universitas);
    const prodi = sanitizeText(target?.prodi);
    const safeRataRata = Number(rataRata) || 0;

    if (!universitas || !prodi) {
      return NextResponse.json({ error: "Input target tidak valid." }, { status: 400 });
    }

    if (safeRataRata < 0 || safeRataRata > 1000) {
      return NextResponse.json({ error: "Skor tidak masuk akal." }, { status: 400 });
    }

    let targetSkorAman = 500; 
    const namaKampusLokal = universitas.toLowerCase();
    const namaProdiLokal = prodi.toLowerCase();

    if (namaKampusLokal.match(/indonesia|gadjah mada|institut teknologi bandung/)) targetSkorAman = 650;
    else if (namaKampusLokal.match(/airlangga|institut teknologi sepuluh nopember|diponegoro|padjadjaran|brawijaya|sebelas maret|pendidikan indonesia/)) targetSkorAman = 600;
    else if (namaKampusLokal.match(/hasanuddin|sumatera utara|andalas|sriwijaya|jenderal soedirman|pembangunan nasional veteran/)) targetSkorAman = 560;
    else targetSkorAman = 520;

    if (namaProdiLokal.match(/kedokteran$/)) targetSkorAman += 80;
    else if (namaProdiLokal.match(/informatika|ilmu komputer|sistem informasi|kedokteran gigi|aktuaria/)) targetSkorAman += 55;
    else if (namaProdiLokal.match(/farmasi|akuntansi|manajemen|psikologi|hukum|teknik industri|teknik pertambangan/)) targetSkorAman += 35;
    else if (namaProdiLokal.match(/teknik|komunikasi|hubungan internasional|arsitektur|gizi|keperawatan/)) targetSkorAman += 20;

    let peluang = 0;
    const selisih = safeRataRata - targetSkorAman;

    if (safeRataRata < 400) peluang = Math.floor(Math.random() * 8) + 2; 
    else if (selisih >= 50) peluang = 85 + Math.min(14, (selisih - 50) * 0.2); 
    else if (selisih >= 0) peluang = 65 + (selisih / 50) * 20; 
    else if (selisih >= -50) peluang = 40 + ((50 + selisih) / 50) * 25; 
    else if (selisih >= -100) peluang = 15 + ((100 + selisih) / 50) * 25; 
    else peluang = Math.max(5, 15 + (selisih / 10)); 

    peluang = Math.max(1, Math.min(99, Math.round(peluang)));

    let promptAI = "";
    const statusSkor = safeRataRata >= targetSkorAman 
      ? "SKOR SUDAH AMAN (Melampaui Target). Berikan pujian besar dan suruh dia pertahankan prestasinya." 
      : "SKOR MASIH KURANG (Di bawah Target). Berikan semangat ekstra agar dia mau belajar lebih keras lagi.";

    if (modeInput === 'detail') {
      const arraySkor = [
        { nama: "Penalaran Umum", nilai: Number(skor.pu) || 0 },
        { nama: "Pengetahuan Kuantitatif", nilai: Number(skor.pk) || 0 },
        { nama: "Pemahaman Bacaan", nilai: Number(skor.pbm) || 0 },
        { nama: "Literasi Bahasa Indonesia", nilai: Number(skor.litInd) || 0 },
        { nama: "Literasi Bahasa Inggris", nilai: Number(skor.litIng) || 0 }
      ];

      arraySkor.sort((a, b) => a.nilai - b.nilai);
      const terlemah1 = arraySkor[0];
      const terlemah2 = arraySkor[1];
      const terkuat = arraySkor[4];

      promptAI = `Kamu adalah AI Asisten Pendidikan dan Konsultan UTBK yang friendly dan penuh motivasi. 
      Siswa ingin masuk ${prodi} di ${universitas}.
      Skor rata-ratanya: ${safeRataRata}. (Target aman kampus ini: ${targetSkorAman}).
      
      FAKTA KONDISI SISWA:
      - Status Kelulusan: ${statusSkor}
      - Terkuat: ${terkuat.nama} (${terkuat.nilai}).
      - Terlemah: ${terlemah1.nama} (${terlemah1.nilai}) & ${terlemah2.nama} (${terlemah2.nilai}).

      Tugas (Maksimal 3-4 kalimat):
      1. Sapa dengan gaya santai.
      2. Berikan tanggapan sesuai "Status Kelulusan" di atas.
      3. Puji subtes terkuatnya, dan minta tingkatkan subtes terlemahnya.
      4. PENTING: JANGAN menyebut persentase peluang!
      5. PENTING: JANGAN menyebut kata "bimbel", "tutor", atau "kelas kita".
      6. Selesaikan kalimatmu dengan sempurna (jangan terpotong).
      7. SANGAT PENTING: JANGAN PERNAH MENGGUNAKAN EMOJI DALAM BALASANMU.`;

    } else {
      promptAI = `Kamu adalah AI Asisten Pendidikan dan Konsultan UTBK yang friendly dan penuh motivasi. 
      Siswa ingin masuk ${prodi} di ${universitas}.
      Skor rata-ratanya: ${safeRataRata}. (Target aman kampus ini: ${targetSkorAman}).

      FAKTA KONDISI SISWA:
      - Status Kelulusan: ${statusSkor}

      Tugas (Maksimal 3-4 kalimat):
      1. Sapa dengan gaya santai ala anak SMA (Halo Pejuang PTN!).
      2. Berikan tanggapan sesuai "Status Kelulusan" di atas.
      3. PENTING: JANGAN menyebut persentase peluang!
      4. PENTING: JANGAN menyebut kata "bimbel", "tutor", atau "kelas kita".
      5. Selesaikan kalimatmu dengan sempurna (jangan terpotong).
      6. SANGAT PENTING: JANGAN PERNAH MENGGUNAKAN EMOJI DALAM BALASANMU.`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: promptAI }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7, 
      max_tokens: 250   
    });

    const pesanAI = chatCompletion.choices[0]?.message?.content?.replace(/"/g, '').trim() || "Wah, terus gaspol belajarnya ya pejuang PTN!";

    return NextResponse.json({ peluang: peluang, pesan_ai: pesanAI });

  } catch (error) {
    console.error("Prediksi Error:", error);
    return NextResponse.json({ 
      peluang: 10, 
      pesan_ai: "Sistem AI Analisis kami sedang mengalami gangguan sementara. Silakan coba klik analisis sekali lagi." 
    }, { status: 500 });
  }
}