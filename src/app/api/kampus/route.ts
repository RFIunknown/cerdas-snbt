import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Data Cadangan (Fallback) Kalau Scrape Nya EngRor
const fallbackKampusNegeri = [
  // --- UNIVERSITAS ---
  "Universitas Gadjah Mada", "Universitas Indonesia", "Universitas Sumatera Utara", 
  "Universitas Airlangga", "Universitas Hasanuddin", "Universitas Andalas", 
  "Universitas Padjadjaran", "Universitas Diponegoro", "Universitas Sriwijaya", 
  "Universitas Lambung Mangkurat", "Universitas Syiah Kuala", "Universitas Sam Ratulangi", 
  "Universitas Udayana", "Universitas Nusa Cendana", "Universitas Mulawarman", 
  "Universitas Mataram", "Universitas Riau", "Universitas Cenderawasih", 
  "Universitas Brawijaya", "Universitas Jambi", "Universitas Pattimura", 
  "Universitas Tanjungpura", "Universitas Jenderal Soedirman", "Universitas Palangka Raya", 
  "Universitas Jember", "Universitas Lampung", "Universitas Sebelas Maret", 
  "Universitas Tadulako", "Universitas Halu Oleo", "Universitas Bengkulu", 
  "Universitas Terbuka", "Universitas Negeri Padang", "Universitas Negeri Malang", 
  "Universitas Pendidikan Indonesia", "Universitas Negeri Manado", "Universitas Negeri Makassar", 
  "Universitas Negeri Jakarta", "Universitas Negeri Yogyakarta", "Universitas Negeri Surabaya", 
  "Universitas Negeri Medan", "Universitas Negeri Semarang", "Universitas Sultan Ageng Tirtayasa", 
  "Universitas Trunojoyo Madura", "Universitas Khairun", "Universitas Papua", 
  "Universitas Malikussaleh", "Universitas Negeri Gorontalo", "Universitas Pendidikan Ganesha", 
  "Universitas Bangka Belitung", "Universitas Borneo Tarakan", "Universitas Musamus Merauke", 
  "Universitas Maritim Raja Ali Haji", "Universitas Samudra", "Universitas Sulawesi Barat", 
  "Universitas Sembilanbelas November Kolaka", "Universitas Tidar", "Universitas Siliwangi", 
  "Universitas Teuku Umar", "Universitas Pembangunan Nasional Veteran Jawa Timur", 
  "Universitas Timor", "Universitas Pembangunan Nasional Veteran Jakarta", 
  "Universitas Pembangunan Nasional Veteran Yogyakarta", "Universitas Singaperbangsa Karawang",

  // --- INSTITUT ---
  "Institut Teknologi Bandung", "Institut Teknologi Sepuluh Nopember", "Institut Pertanian Bogor", 
  "Institut Seni Indonesia Yogyakarta", "Institut Seni Indonesia Bali", "Institut Seni Indonesia Surakarta", 
  "Institut Seni Indonesia Padang Panjang", "Institut Seni Budaya Indonesia Bandung", 
  "Institut Seni Budaya Indonesia Aceh", "Institut Seni Budaya Indonesia Tanah Papua", 
  "Institut Teknologi Kalimantan", "Institut Teknologi Sumatera", "Institut Teknologi Bacharuddin Jusuf Habibie", 
  "Institut Seni Budaya Indonesia Kalimantan Timur", "Institut Seni Budaya Indonesia Sulawesi Selatan",

  // --- POLITEKNIK ---
  "Politeknik Manufaktur Bandung", "Politeknik Negeri Jakarta", "Politeknik Negeri Medan", 
  "Politeknik Negeri Bandung", "Politeknik Negeri Semarang", "Politeknik Negeri Sriwijaya", 
  "Politeknik Negeri Lampung", "Politeknik Negeri Ambon", "Politeknik Negeri Padang", 
  "Politeknik Negeri Bali", "Politeknik Negeri Pontianak", "Politeknik Negeri Ujung Pandang", 
  "Politeknik Negeri Manado", "Politeknik Perkapalan Negeri Surabaya", "Politeknik Negeri Banjarmasin", 
  "Politeknik Negeri Lhokseumawe", "Politeknik Negeri Kupang", "Politeknik Elektronika Negeri Surabaya", 
  "Politeknik Negeri Jember", "Politeknik Pertanian Negeri Pangkajene Kepulauan", 
  "Politeknik Pertanian Negeri Kupang", "Politeknik Perikanan Negeri Tual", "Politeknik Negeri Malang", 
  "Politeknik Pertanian Negeri Samarinda", "Politeknik Pertanian Negeri Payakumbuh", 
  "Politeknik Negeri Samarinda", "Politeknik Negeri Media Kreatif", "Politeknik Manufaktur Negeri Bangka Belitung", 
  "Politeknik Negeri Batam", "Politeknik Negeri Nusa Utara", "Politeknik Negeri Bengkalis", 
  "Politeknik Negeri Balikpapan", "Politeknik Negeri Madura", "Politeknik Maritim Negeri Indonesia", 
  "Politeknik Negeri Banyuwangi", "Politeknik Negeri Madiun", "Politeknik Negeri Fakfak", 
  "Politeknik Negeri Sambas", "Politeknik Negeri Tanah Laut", "Politeknik Negeri Subang", 
  "Politeknik Negeri Ketapang", "Politeknik Negeri Cilacap", "Politeknik Negeri Indramayu", 
  "Politeknik Negeri Nunukan",

  // --- AKADEMI KOMUNITAS ---
  "Akademi Komunitas Negeri Pacitan", "Akademi Komunitas Negeri Putra Sang Fajar Blitar", 
  "Akademi Komunitas Negeri Aceh Barat", "Akademi Komunitas Negeri Rejang Lebong", 
  "Akademi Komunitas Negeri Seni dan Budaya Yogyakarta"
].sort();

// Ini Scrape Data Kampus dari Wikipedia
export async function GET() {
  try {
    const url = 'https://id.wikipedia.org/wiki/Daftar_perguruan_tinggi_negeri_di_Indonesia';
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
    const kampusList: string[] = [];

    $('.wikitable tbody tr').each((i, element) => {
      let namaKampus = $(element).find('td').eq(2).text().trim();
      namaKampus = namaKampus.replace(/\[.*?\]/g, '').trim();

      if (namaKampus && namaKampus.length > 5 && !namaKampus.toLowerCase().includes('nama')) {
        kampusList.push(namaKampus);
      }
    });

    const uniqueKampus = Array.from(new Set(kampusList)).sort();

    if (uniqueKampus.length === 0) {
      throw new Error("Sistem Error");
    }

    const formatData = uniqueKampus.map(nama => ({
      id: nama,
      nama: nama
    }));

    return NextResponse.json(formatData);

  } catch (_) {
    console.warn("Mengaktifkan database kampus sekunder");
    
    const formatFallback = fallbackKampusNegeri.map(nama => ({
      id: nama,
      nama: nama
    }));

    return NextResponse.json(formatFallback);
  }
}