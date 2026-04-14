"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories } from "@/context/CategoryContext";
import { Globe, Info, Tag, Plus, X } from "lucide-react";
import clsx from "clsx";

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const { categories, addCategory, removeCategory } = useCategories();
  const [newIncome, setNewIncome] = useState("");
  const [newExpense, setNewExpense] = useState("");

  const handleAdd = (type: "income" | "expense") => {
    const val = type === "income" ? newIncome : newExpense;
    if (!val.trim()) return;
    addCategory(type, val.trim());
    type === "income" ? setNewIncome("") : setNewExpense("");
  };

  return (
    <div className="page-content">
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
                lang === "ko" ? "bg-[#007AFF] text-white shadow-md shadow-blue-200" : "bg-[#F2F2F7] text-[#8E8E93]"
              )}
            >
              {t.settings.korean}
            </button>
            <button
              onClick={() => setLang("en")}
              className={clsx(
                "flex-1 py-3 rounded-2xl text-sm font-semibold transition-all",
                lang === "en" ? "bg-[#007AFF] text-white shadow-md shadow-blue-200" : "bg-[#F2F2F7] text-[#8E8E93]"
              )}
            >
              {t.settings.english}
            </button>
          </div>
        </div>

        {/* 카테고리 편집 — 수입 */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#F2F2F7]">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-[#34C759]" />
            </div>
            <p className="text-sm font-semibold text-[#1C1C1E]">
              {t.settings.incomeCategories}
            </p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.income.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                >
                  {t.categories[c] ?? c}
                  <button
                    onClick={() => removeCategory("income", c)}
                    className="ml-0.5 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd("income")}
                placeholder={t.settings.addCategory}
                className="input text-sm py-2 flex-1"
              />
              <button
                onClick={() => handleAdd("income")}
                className="w-9 h-9 rounded-xl bg-[#34C759] flex items-center justify-center flex-shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 카테고리 편집 — 지출 */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#F2F2F7]">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-[#FF3B30]" />
            </div>
            <p className="text-sm font-semibold text-[#1C1C1E]">
              {t.settings.expenseCategories}
            </p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {categories.expense.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-medium"
                >
                  {t.categories[c] ?? c}
                  <button
                    onClick={() => removeCategory("expense", c)}
                    className="ml-0.5 hover:text-red-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd("expense")}
                placeholder={t.settings.addCategory}
                className="input text-sm py-2 flex-1"
              />
              <button
                onClick={() => handleAdd("expense")}
                className="w-9 h-9 rounded-xl bg-[#FF3B30] flex items-center justify-center flex-shrink-0"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
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
