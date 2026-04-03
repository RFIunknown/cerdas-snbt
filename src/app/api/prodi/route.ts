import { NextResponse } from 'next/server';
import { PDDikti } from '@x403/pddikti';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const namaKampus = searchParams.get('id'); 

  if (!namaKampus) return NextResponse.json(["Pilih kampus terlebih dahulu"]);

  try {
    const pddikti = new PDDikti({ cacheEnabled: true });

    const searches = await pddikti.search.all(namaKampus);
    
    let prodiList: string[] = [];

    // Mengekstrak hasil program studi dari objek pencarian
    if (searches && searches.programs) {
      prodiList = searches.programs.map((p: any) => p.name);
    }

    const uniqueProdi = Array.from(new Set(prodiList)).sort();

    if (uniqueProdi.length > 0) {
      return NextResponse.json(uniqueProdi);
    } else {
      throw new Error("Prodi kosong di database PDDikti");
    }

  } catch (error) {
    console.error(`PDDIKTI Module Error untuk ${namaKampus}:`, error);
    
    return NextResponse.json(
      { error: "Gagal mengambil data program studi dari server PDDikti." }, 
      { status: 500 }
    );
  }
}