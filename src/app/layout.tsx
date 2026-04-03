import "./globals.css";
import SessionProvider from "@/components/SessionProvider"; // Import Provider

export const metadata = {
  title: "Prediksi SNBT AI",
  description: "Dianalisis oleh algoritma dengan data historis UTBK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {/* Bungkus children di sini */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}