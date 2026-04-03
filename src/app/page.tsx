"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react"; 
import { 
  GraduationCap, Sparkles, ArrowRight, RefreshCcw, Loader2, 
  Search, Info, Moon, Sun, LogOut,
  BookOpen, Calculator, Compass, Trophy, Atom, LibraryBig
} from "lucide-react";

interface Kampus {
  id: string;
  nama: string;
}

// PERBAIKAN DI SINI: Ditambahkan h-full pada div, dan mt-auto pada input
const InputSkor = ({ label, ...props }: any) => (
  <div className="flex flex-col gap-1.5 w-full h-full">
    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 pl-1 transition-colors">{label}</label>
    <input 
      className="mt-auto w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-soft-inner focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-900/30 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
      {...props} 
    />
  </div>
);

export default function Home() {
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State untuk Custom Toast Notification
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const [modeInput, setModeInput] = useState<'detail' | 'ratarata'>('detail');
  const [skor, setSkor] = useState({ pu: "", ppu: "", pbm: "", pk: "", litInd: "", litIng: "", pm: "" });
  const [skorRataRata, setSkorRataRata] = useState("");
  
  const [daftarKampus, setDaftarKampus] = useState<Kampus[]>([]);
  const [daftarProdi, setDaftarProdi] = useState<string[]>([]);
  const [isFetchingKampus, setIsFetchingKampus] = useState(true);
  const [isFetchingProdi, setIsFetchingProdi] = useState(false);

  const [searchKampusText, setSearchKampusText] = useState("");
  const [selectedKampus, setSelectedKampus] = useState<{id: string, nama: string}>({ id: "", nama: "" });
  
  const [searchProdiText, setSearchProdiText] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  
  const [hasil, setHasil] = useState<{ peluang: number; rataRata: number; pesanAI: string } | null>(null);
  const [isLoadingPrediksi, setIsLoadingPrediksi] = useState(false);

  // State & Ref untuk Dropdown Custom Baru
  const [showKampusSuggest, setShowKampusSuggest] = useState(false);
  const [showProdiSuggest, setShowProdiSuggest] = useState(false);
  const kampusRef = useRef<HTMLDivElement>(null);
  const prodiRef = useRef<HTMLDivElement>(null);

  // Filter Data untuk Dropdown
  const filteredKampus = daftarKampus.filter(k => k.nama.toLowerCase().includes(searchKampusText.toLowerCase()));
  const filteredProdi = daftarProdi.filter(p => p.toLowerCase().includes(searchProdiText.toLowerCase()));

  // Fungsi untuk memunculkan Toast
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000); // Hilang otomatis dalam 4 detik
  };

  useEffect(() => {
    const fetchKampus = async () => {
      try {
        const res = await fetch('/api/kampus');
        const data = await res.json();
        if (data.length > 0) setDaftarKampus(data);
      } catch (error) {
        console.error("Gagal load kampus", error);
      } finally {
        setIsFetchingKampus(false);
      }
    };
    fetchKampus();
  }, []);

  useEffect(() => {
    const fetchProdi = async () => {
      if (!selectedKampus.id) return;
      setIsFetchingProdi(true);
      
      setSearchProdiText("");
      setSelectedProdi("");

      try {
        const res = await fetch(`/api/prodi?id=${selectedKampus.id}`);
        const data = await res.json();
        setDaftarProdi(data);
      } catch (error) {
        console.error("Gagal load prodi", error);
      } finally {
        setIsFetchingProdi(false);
      }
    };
    fetchProdi();
  }, [selectedKampus.id]);

  // Click Outside untuk Menutup Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kampusRef.current && !kampusRef.current.contains(event.target as Node)) {
        setShowKampusSuggest(false);
      }
      if (prodiRef.current && !prodiRef.current.contains(event.target as Node)) {
        setShowProdiSuggest(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKampusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKampusText(e.target.value);
    setShowKampusSuggest(true);
    // Reset state jika mengetik ulang
    if (selectedKampus.id) {
      setSelectedKampus({ id: "", nama: "" });
      setDaftarProdi([]);
      setSelectedProdi("");
      setSearchProdiText("");
    }
  };

  const handleProdiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchProdiText(e.target.value);
    setShowProdiSuggest(true);
    if (selectedProdi) setSelectedProdi("");
  };

  const selectKampus = (kampus: Kampus) => {
    setSearchKampusText(kampus.nama);
    setSelectedKampus(kampus);
    setShowKampusSuggest(false);
  };

  const selectProdi = (prodi: string) => {
    setSearchProdiText(prodi);
    setSelectedProdi(prodi);
    setShowProdiSuggest(false);
  };

  const hitungPrediksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKampus.id || !selectedProdi) {
      showToast("Pastikan Universitas dan Program Studi sudah dipilih dengan benar dari daftar!", "error");
      return;
    }

    setIsLoadingPrediksi(true);

    let finalRataRata = 0;
    if (modeInput === 'detail') {
      const totalSkor = Number(skor.pu) + Number(skor.ppu) + Number(skor.pbm) + Number(skor.pk) + Number(skor.litInd) + Number(skor.litIng) + Number(skor.pm);
      finalRataRata = Math.round(totalSkor / 7);
    } else {
      finalRataRata = Number(skorRataRata);
    }

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modeInput,
          skor, 
          rataRata: finalRataRata,
          target: { universitas: selectedKampus.nama, prodi: selectedProdi } 
        }),
      });

      const dataAI = await response.json();
      
      if (!response.ok) {
        if(response.status === 429 || response.status === 401) {
          showToast(dataAI.pesan_ai || dataAI.error || "Terjadi kesalahan!", "error");
          setIsLoadingPrediksi(false);
          return;
        }
        throw new Error("Gagal mengambil prediksi");
      }

      setHasil({ peluang: dataAI.peluang, rataRata: finalRataRata, pesanAI: dataAI.pesan_ai });
    } catch (error) {
      showToast("Koneksi ke sistem analisis sedang bermasalah. Coba lagi.", "error");
    } finally {
      setIsLoadingPrediksi(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} transition-colors duration-500`}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-x-hidden transition-colors duration-500">
        
        {/* CUSTOM TOAST NOTIFICATION */}
        {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-top-5 fade-in duration-300 ${
            toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/90 dark:text-red-100 dark:border-red-800' :
            toast.type === 'success' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/90 dark:text-green-100 dark:border-green-800' :
            'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/90 dark:text-blue-100 dark:border-blue-800'
          }`}>
            {toast.message}
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-all duration-700"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-all duration-700"></div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 hidden lg:block">
          <BookOpen className="absolute top-[15%] left-[10%] text-blue-500/10 dark:text-blue-400/5 rotate-12 animate-pulse w-32 h-32" />
          <Calculator className="absolute top-[60%] left-[8%] text-indigo-500/10 dark:text-indigo-400/5 -rotate-12 w-24 h-24" />
          <Compass className="absolute top-[80%] left-[20%] text-blue-500/10 dark:text-blue-400/5 rotate-45 w-16 h-16" />
          <Trophy className="absolute top-[20%] right-[10%] text-yellow-500/10 dark:text-yellow-400/5 -rotate-12 w-28 h-28" />
          <Atom className="absolute top-[55%] right-[12%] text-indigo-500/10 dark:text-indigo-400/5 rotate-45 animate-spin-slow w-32 h-32" style={{ animationDuration: '20s' }} />
          <LibraryBig className="absolute top-[85%] right-[25%] text-blue-500/10 dark:text-blue-400/5 -rotate-12 w-20 h-20" />
        </div>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-all duration-300 group"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={24} className="group-hover:text-yellow-400 transition-colors" /> : <Moon size={24} className="group-hover:text-blue-600 transition-colors" />}
        </button>


        {status === "unauthenticated" ? (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 sm:p-12 text-center relative z-10 border border-slate-100 dark:border-slate-800 transition-colors duration-500">
             <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-3xl inline-block mb-6 text-blue-600 dark:text-blue-400">
                <GraduationCap size={48} strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Masuk ke Sistem</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Gunakan akun Google-mu untuk mulai menggunakan AI Prediksi SNBT.</p>
              
              <button 
                onClick={() => signIn('google')}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-4 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                Lanjutkan dengan Google
              </button>
          </div>
        ) : status === "loading" ? (
          <Loader2 size={40} className="animate-spin text-blue-500 z-10" />
        ) : (
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl dark:shadow-blue-900/10 overflow-hidden relative z-10 border border-slate-100 dark:border-slate-800 transition-colors duration-500 my-8">
            
            <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-2 pr-4 rounded-full border border-white/20 dark:border-slate-700/50">
              <img src={session?.user?.image || ""} alt="Profile" className="w-8 h-8 rounded-full shadow-sm" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{session?.user?.name}</p>
              </div>
              <button onClick={() => signOut()} className="ml-2 text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-500/10 p-1.5 rounded-full transition-colors" title="Keluar">
                <LogOut size={14} />
              </button>
            </div>

            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 z-0 transition-colors duration-500"></div>

            <div className="relative z-10 p-6 sm:p-10 pt-16 sm:pt-20">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft dark:shadow-none border border-transparent dark:border-slate-700 mb-5 text-blue-600 dark:text-blue-400 transition-colors">
                  <GraduationCap size={40} strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Prediksi Lolos SNBT</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base transition-colors">Dianalisis oleh algoritma dengan data historis UTBK.</p>
              </div>

              {!hasil ? (
                <form onSubmit={hitungPrediksi} className="space-y-6">
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-4 mb-6 transition-colors">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Target Pendidikan 
                      {isFetchingKampus && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    </h3>
                    
                    {/* INPUT KAMPUS CUSTOM DROPDOWN */}
                    <div className="flex flex-col gap-1.5 w-full" ref={kampusRef}>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 pl-1">Nama Universitas</label>
                      <div className="relative">
                        <input 
                          type="text"
                          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-soft-inner focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-900/30 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-medium placeholder:text-slate-400"
                          value={searchKampusText}
                          onChange={handleKampusChange}
                          onFocus={() => setShowKampusSuggest(true)}
                          placeholder="Ketik untuk mencari kampus..."
                          disabled={isFetchingKampus || isLoadingPrediksi}
                          autoComplete="off"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                          <Search size={18} />
                        </div>
                        {showKampusSuggest && searchKampusText.length > 0 && filteredKampus.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl scrollbar-hide">
                            {filteredKampus.map((kampus) => (
                              <button
                                key={kampus.id}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 transition-colors border-b border-slate-200 dark:border-slate-700/50 last:border-0"
                                onClick={() => selectKampus(kampus)}
                              >
                                {kampus.nama}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* INPUT PRODI CUSTOM DROPDOWN */}
                    <div className="flex flex-col gap-1.5 w-full" ref={prodiRef}>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 pl-1 flex items-center gap-2">
                        Program Studi
                        {isFetchingProdi && <Loader2 size={12} className="animate-spin text-blue-500" />}
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-soft-inner focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-900/30 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-medium placeholder:text-slate-400"
                          value={searchProdiText}
                          onChange={handleProdiChange}
                          onFocus={() => setShowProdiSuggest(true)}
                          placeholder={!selectedKampus.id ? "Pilih kampus terlebih dahulu" : isFetchingProdi ? "Mencari jurusan..." : "Ketik untuk mencari jurusan..."}
                          disabled={isFetchingProdi || daftarProdi.length === 0 || isLoadingPrediksi}
                          autoComplete="off"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                          <Search size={18} />
                        </div>
                        {showProdiSuggest && searchProdiText.length > 0 && filteredProdi.length > 0 && (
                          <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl scrollbar-hide">
                            {filteredProdi.map((prodi, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 transition-colors border-b border-slate-200 dark:border-slate-700/50 last:border-0"
                                onClick={() => selectProdi(prodi)}
                              >
                                {prodi}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-1">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Skor TryOut</h3>
                      
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit transition-colors">
                        <button 
                          type="button"
                          onClick={() => setModeInput('detail')}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${modeInput === 'detail' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                          Detail
                        </button>
                        <button 
                          type="button"
                          onClick={() => setModeInput('ratarata')}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${modeInput === 'ratarata' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                          Rata-rata
                        </button>
                      </div>
                    </div>

                   {modeInput === 'detail' ? (
                      <div className="space-y-6">
                        {/* BAGIAN 1: TPS */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 pl-1">1. Tes Potensi Skolastik (TPS)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InputSkor 
                              label="Penalaran Umum (PU)" 
                              type="number" 
                              placeholder="0 - 1000" 
                              value={skor.pu} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, pu: e.target.value})} 
                              required 
                              disabled={isLoadingPrediksi} 
                              min="0" max="1000" 
                            />
                            <InputSkor 
                              label="Penge. & Pemahaman Umum (PPU)" 
                              type="number" 
                              placeholder="0 - 1000" 
                              value={skor.ppu} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, ppu: e.target.value})} 
                              required 
                              disabled={isLoadingPrediksi} 
                              min="0" max="1000" 
                            />
                            <InputSkor 
                              label="Pemahaman Bacaan & Menulis (PBM)" 
                              type="number" 
                              placeholder="0 - 1000" 
                              value={skor.pbm} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, pbm: e.target.value})} 
                              required 
                              disabled={isLoadingPrediksi} 
                              min="0" max="1000" 
                            />
                            <InputSkor 
                              label="Pengetahuan Kuantitatif (PK)" 
                              type="number" 
                              placeholder="0 - 1000" 
                              value={skor.pk} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, pk: e.target.value})} 
                              required 
                              disabled={isLoadingPrediksi} 
                              min="0" max="1000" 
                            />
                          </div>
                        </div>

                        {/* BAGIAN 2: LITERASI & PM */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 pl-1">2. Literasi & Penalaran Matematika</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InputSkor 
                              label="Literasi Bahasa Indonesia" 
                              type="number" 
                              placeholder="0 - 1000" 
                              value={skor.litInd} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, litInd: e.target.value})} 
                              required 
                              disabled={isLoadingPrediksi} 
                              min="0" max="1000" 
                            />
                            <InputSkor 
                              label="Literasi Bahasa Inggris" 
                              type="number" 
                              placeholder="0 - 1000" 
                              value={skor.litIng} 
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, litIng: e.target.value})} 
                              required 
                              disabled={isLoadingPrediksi} 
                              min="0" max="1000" 
                            />
                            <div className="sm:col-span-2">
                              <InputSkor 
                                label="Penalaran Matematika (PM)" 
                                type="number" 
                                placeholder="0 - 1000" 
                                value={skor.pm} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkor({...skor, pm: e.target.value})} 
                                required 
                                disabled={isLoadingPrediksi} 
                                min="0" max="1000" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/30 transition-colors">
                        <InputSkor 
                          label="Skor Rata-rata Keseluruhan" 
                          type="number" 
                          placeholder="0 - 1000" 
                          value={skorRataRata} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkorRataRata(e.target.value)} 
                          required 
                          disabled={isLoadingPrediksi} 
                          min="0" max="1000" 
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-700/50 mt-2 transition-colors">
                    <Info size={16} className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-400/90 leading-relaxed">
                      <strong>Catatan:</strong> Hasil ini hanyalah prediksi berbasis algoritma heuristik dan riwayat nilai keketatan tahun lalu. Bukan merupakan hasil atau Passing Grade resmi dari panitia SNPMB.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoadingPrediksi || !selectedKampus.id || !selectedProdi}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-blue-300 dark:hover:shadow-blue-900/80 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                  >
                    {isLoadingPrediksi ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Menganalisis Data...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                        Analisis Peluang Saya
                        <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                  <div className="w-48 h-48 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" className="stroke-slate-100 dark:stroke-slate-800 transition-colors" strokeWidth="12" fill="none" />
                      <circle 
                        cx="96" cy="96" r="88" 
                        className={`${hasil.peluang > 70 ? 'stroke-green-500' : hasil.peluang > 40 ? 'stroke-yellow-400' : 'stroke-red-500'} transition-all duration-1000 ease-out`} 
                        strokeWidth="12" 
                        fill="none" 
                        strokeDasharray="553" 
                        strokeDashoffset={553 - (553 * hasil.peluang) / 100}
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-5xl font-extrabold text-slate-800 dark:text-white transition-colors">{hasil.peluang}%</span>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Peluang Lolos</span>
                    </div>
                  </div>

                  <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 w-full p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 relative shadow-sm transition-colors">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 transition-colors">
                      <Sparkles size={12} />
                      Analisis AI
                    </div>
                    
                    <h4 className="text-slate-800 dark:text-white font-bold mb-1 mt-2 transition-colors">{selectedKampus.nama}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 transition-colors">{selectedProdi}</p>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 inline-block shadow-sm mb-4 border border-slate-100 dark:border-slate-700 transition-colors">
                      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Skor Rata-rata</p>
                      <p className="font-bold text-slate-800 dark:text-white text-lg">{hasil.rataRata}</p>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-700 w-full mb-4 transition-colors"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic transition-colors">
                      "{hasil.pesanAI}"
                    </p>
                  </div>

                  <button 
                    onClick={() => setHasil(null)}
                    className="w-full mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm font-semibold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={18} />
                    Analisis Ulang
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="relative mt-8 w-full text-center z-10 px-4 pb-4">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors duration-500">
            Dibuat Oleh{' '}
            <a 
              href="https://mrfai.web.id" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-blue-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
              Muhammad Rifai
            </a>
          </p>
        </div>

      </main>
    </div>
  );
}