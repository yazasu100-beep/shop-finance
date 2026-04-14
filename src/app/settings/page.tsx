"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe, Info, ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="page-content">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
        <div className="px-4 py-3">
          <h1 className="text-base font-bold text-[#1C1C1E]">{t.settings.title}</h1>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {/* 언어 설정 */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#F2F2F7]">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-[#007AFF]" />
            </div>
            <p className="text-sm font-semibold text-[#1C1C1E]">{t.settings.language}</p>
          </div>
          <div className="px-4 py-3 flex gap-3">
            <button
              onClick={() => setLang("ko")}
              className={clsx(
                "flex-1 py-3 rounded-2xl text-sm font-semibold transition-all",
                lang === "ko"
                  ? "bg-[#007AFF] text-white shadow-md shadow-blue-200"
                  : "bg-[#F2F2F7] text-[#8E8E93]"
              )}
            >
              {t.settings.korean}
            </button>
            <button
              onClick={() => setLang("en")}
              className={clsx(
                "flex-1 py-3 rounded-2xl text-sm font-semibold transition-all",
                lang === "en"
                  ? "bg-[#007AFF] text-white shadow-md shadow-blue-200"
                  : "bg-[#F2F2F7] text-[#8E8E93]"
              )}
            >
              {t.settings.english}
            </button>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#F2F2F7]">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-[#AF52DE]" />
            </div>
            <p className="text-sm font-semibold text-[#1C1C1E]">{t.settings.appInfo}</p>
          </div>
          <div className="divide-y divide-[#F2F2F7]">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#1C1C1E]">{t.settings.appName}</span>
              <span className="text-sm text-[#8E8E93]">{t.settings.appDesc}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#1C1C1E]">{t.settings.version}</span>
              <span className="text-sm text-[#8E8E93]">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
