import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "쇼핑몰 가계부",
  description: "온라인 쇼핑몰 전용 가계부 & 매출 관리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <LanguageProvider>
          <div className="min-h-screen bg-[#F2F2F7]">
            <main className="max-w-lg mx-auto">
              {children}
            </main>
          </div>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
