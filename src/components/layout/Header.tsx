"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";

const staticTitles: Record<string, string> = {
  "/transactions": "거래 내역",
  "/platforms": "플랫폼 매출",
  "/reports": "인사이트",
};

interface HeaderProps {
  onMonthChange?: (date: Date) => void;
  currentMonth?: Date;
}

export default function Header({ onMonthChange, currentMonth }: HeaderProps) {
  const pathname = usePathname();
  const [localMonth, setLocalMonth] = useState(new Date());
  const month = currentMonth ?? localMonth;

  const isHome = pathname === "/";
  const title = staticTitles[pathname];

  const prev = () => {
    const d = subMonths(month, 1);
    setLocalMonth(d);
    onMonthChange?.(d);
  };
  const next = () => {
    const d = addMonths(month, 1);
    setLocalMonth(d);
    onMonthChange?.(d);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {isHome ? (
          <>
            <button onClick={prev} className="p-1.5 text-[#8E8E93] hover:text-[#1C1C1E] rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-[#1C1C1E]">
              {format(month, "yyyy년 M월", { locale: ko })}
            </h1>
            <button onClick={next} className="p-1.5 text-[#8E8E93] hover:text-[#1C1C1E] rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-base font-bold text-[#1C1C1E]">{title}</h1>
            <button className="p-1.5 text-[#8E8E93] hover:text-[#1C1C1E] rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
