"use client";

import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "대시보드",
  "/transactions": "수입/지출 관리",
  "/platforms": "플랫폼 매출 관리",
  "/reports": "통계 & 리포트",
};

export default function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "쇼핑몰 가계부";

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CalendarDays className="w-4 h-4" />
        <span>{format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko })}</span>
      </div>
    </header>
  );
}
