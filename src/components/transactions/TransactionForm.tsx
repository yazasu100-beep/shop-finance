"use client";

import { useState } from "react";
import type { Transaction, TransactionType, Platform } from "@/types";
import { format } from "date-fns";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories } from "@/context/CategoryContext";

const PLATFORMS: Platform[] = ["스마트스토어", "쿠팡", "11번가", "G마켓", "옥션", "카카오쇼핑", "자사몰", "기타"];

interface TransactionFormProps {
  initial?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const { t } = useLanguage();
  const { categories } = useCategories();

  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<string>(
    initial?.category ?? categories.expense[0] ?? "기타지출"
  );
  const [amount, setAmount] = useState(initial?.amount?.toLocaleString() ?? "");
  const [date, setDate] = useState(initial?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [platform, setPlatform] = useState<Platform | "">(initial?.platform ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [loading, setLoading] = useState(false);

  const currentCategories = type === "income" ? categories.income : categories.expense;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const list = newType === "income" ? categories.income : categories.expense;
    setCategory(list[0] ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    setLoading(true);
    try {
      await onSubmit({
        type,
        category,
        amount: parseInt(amount.replace(/,/g, ""), 10),
        description: category,
        date,
        platform: platform || undefined,
        memo: memo || undefined,
      });
    } finally { setLoading(false); }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? parseInt(num).toLocaleString() : "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 유형 */}
      <div className="flex gap-2">
        {(["income", "expense"] as TransactionType[]).map((tp) => (
          <button
            key={tp}
            type="button"
            onClick={() => handleTypeChange(tp)}
            className={clsx(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors",
              type === tp
                ? tp === "income" ? "bg-[#34C759] text-white" : "bg-[#FF3B30] text-white"
                : "bg-[#F2F2F7] text-[#8E8E93]"
            )}
          >
            {tp === "income" ? t.form.incomeLabel : t.form.expenseLabel}
          </button>
        ))}
      </div>

      {/* 날짜 */}
      <div>
        <label className="label">{t.form.date}</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="label">{t.form.category}</label>
        <div className="flex flex-wrap gap-1.5">
          {currentCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={clsx(
                "py-2 px-3 rounded-xl text-xs font-medium transition-colors",
                category === c ? "bg-[#007AFF] text-white" : "bg-[#F2F2F7] text-[#8E8E93]"
              )}
            >
              {t.categories[c] ?? c}
            </button>
          ))}
        </div>
      </div>

      {/* 금액 */}
      <div>
        <label className="label">{t.form.amount}</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8E8E93]">RM</span>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(formatAmount(e.target.value))}
            placeholder="0"
            className="input pl-10 text-right text-lg font-bold"
            required
          />
        </div>
      </div>

      {/* 플랫폼 */}
      <div>
        <label className="label">{t.form.platform}</label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "")} className="input">
          <option value="">{t.form.none}</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* 메모 */}
      <div>
        <label className="label">{t.form.memo}</label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={t.form.memoPlaceholder} className="input resize-none" rows={2} />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1" disabled={loading}>{t.form.cancel}</button>
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? t.form.saving : t.form.save}
        </button>
      </div>
    </form>
  );
}
