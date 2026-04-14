import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "쇼핑몰 가계부",
  description: "온라인 쇼핑몰 전용 가계부 & 매출 관리",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-[#F2F2F7]">
          <main className="max-w-lg mx-auto">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
