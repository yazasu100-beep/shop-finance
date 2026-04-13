"use client";

import { useState } from "react";
import type { Transaction, TransactionType, TransactionCategory, Platform } from "@/types";
import { format } from "date-fns";

const INCOME_CATEGORIES: TransactionCategory[] = ["상품판매", "환불수입", "기타수입"];
const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "상품매입",
  "배송비",
  "광고비",
  "플랫폼수수료",
  "포장재",
  "인건비",
  "임대료",
  "기타지출",
];
const PLATFORMS: Platform[] = [
  "스마트스토어",
  "쿠팡",
  "11번가",
  "G마켓",
  "옥션",
  "카카오쇼핑",
  "자사몰",
  "기타",
];

interface TransactionFormProps {
  initial?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  onCancel: () => void;
}

export default function TransactionForm({
  initial,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<TransactionCategory>(
    initial?.category ?? "기타지출"
  );
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(
    initial?.date ?? format(new Date(), "yyyy-MM-dd")
  );
  const [platform, setPlatform] = useState<Platform | "">(
    initial?.platform ?? ""
  );
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [loading, setLoading] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(
      newType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    setLoading(true);
    try {
      await onSubmit({
        type,
        category,
        amount: parseInt(amount.replace(/,/g, ""), 10),
        description,
        date,
        platform: platform || undefined,
        memo: memo || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? parseInt(num).toLocaleString() : "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 유형 */}
      <div>
        <label className="label">유형</label>
        <div className="flex gap-2">
          {(["income", "expense"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={
                type === t
                  ? t === "income"
                    ? "flex-1 py-2 rounded-lg text-sm font-medium bg-green-600 text-white"
                    : "flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white"
                  : "flex-1 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            >
              {t === "income" ? "수입" : "지출"}
            </button>
          ))}
        </div>
      </div>

      {/* 날짜 */}
      <div>
        <label className="label">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="label">카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          className="input"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 금액 */}
      <div>
        <label className="label">금액 (원)</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(formatAmount(e.target.value))}
          placeholder="0"
          className="input text-right"
          required
        />
      </div>

      {/* 내용 */}
      <div>
        <label className="label">내용</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="거래 내용을 입력하세요"
          className="input"
          required
        />
      </div>

      {/* 플랫폼 (선택) */}
      <div>
        <label className="label">플랫폼 (선택)</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform | "")}
          className="input"
        >
          <option value="">선택 안 함</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 메모 */}
      <div>
        <label className="label">메모 (선택)</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="추가 메모"
          className="input resize-none"
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={loading}
        >
          취소
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
