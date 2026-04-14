"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import TransactionForm from "@/components/transactions/TransactionForm";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Transaction, TransactionType } from "@/types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";

const CATEGORY_ICONS: Record<string, string> = {
  상품판매: "🛍️", 환불수입: "↩️", 기타수입: "💰",
  상품매입: "📦", 배송비: "🚚", 광고비: "📣",
  플랫폼수수료: "💳", 포장재: "📫", 인건비: "👤",
  임대료: "🏢", 기타지출: "📌",
};

const CATEGORY_COLORS: Record<string, string> = {
  상품판매: "bg-blue-100", 환불수입: "bg-purple-100", 기타수입: "bg-green-100",
  상품매입: "bg-orange-100", 배송비: "bg-yellow-100", 광고비: "bg-pink-100",
  플랫폼수수료: "bg-red-100", 포장재: "bg-teal-100", 인건비: "bg-indigo-100",
  임대료: "bg-gray-100", 기타지출: "bg-slate-100",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [startDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch { setTransactions([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTransactions(); }, []); // eslint-disable-line

  useEffect(() => {
    let result = transactions;
    if (typeFilter !== "all") result = result.filter((t) => t.type === typeFilter);
    if (search) result = result.filter((t) =>
      t.description.includes(search) || t.category.includes(search)
    );
    setFiltered(result);
  }, [transactions, typeFilter, search]);

  const handleCreate = async (data: Omit<Transaction, "id" | "createdAt">) => {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    await fetchTransactions();
  };

  const handleUpdate = async (data: Omit<Transaction, "id" | "createdAt">) => {
    if (!editTarget) return;
    await fetch(`/api/transactions?id=${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditTarget(null);
    await fetchTransactions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    await fetchTransactions();
  };

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page-content">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
        <div className="px-4 py-3">
          <h1 className="text-base font-bold text-[#1C1C1E] mb-2">거래 내역</h1>
          {/* 탭 필터 */}
          <div className="flex gap-1.5 mb-2">
            {(["all", "income", "expense"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={clsx(
                  "flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                  typeFilter === f
                    ? f === "income"
                      ? "bg-[#34C759] text-white"
                      : f === "expense"
                      ? "bg-[#FF3B30] text-white"
                      : "bg-[#007AFF] text-white"
                    : "bg-[#F2F2F7] text-[#8E8E93]"
                )}
              >
                {f === "all" ? "전체" : f === "income" ? "수입" : "지출"}
              </button>
            ))}
          </div>
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className="input pl-9 text-sm py-2"
            />
          </div>
        </div>
      </header>

      {/* 요약 */}
      <div className="px-4 pt-3 grid grid-cols-3 gap-2">
        {[
          { label: "수입", value: totalIncome, color: "text-[#34C759]" },
          { label: "지출", value: totalExpense, color: "text-[#FF3B30]" },
          { label: "순이익", value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? "text-[#007AFF]" : "text-[#FF3B30]" },
        ].map((item) => (
          <div key={item.label} className="card text-center py-3">
            <p className="text-[10px] text-[#8E8E93] mb-0.5">{item.label}</p>
            <p className={`text-sm font-bold ${item.color}`}>
              {item.value >= 0 && item.label === "순이익" && item.value > 0 ? "+" : ""}
              {item.value.toLocaleString()}원
            </p>
          </div>
        ))}
      </div>

      {/* 거래 목록 */}
      <div className="px-4 pt-3">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[#8E8E93] text-sm">거래 내역이 없습니다</p>
            <p className="text-xs text-[#C7C7CC] mt-1">+ 버튼으로 추가하세요</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden divide-y divide-[#F2F2F7]">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3 active:bg-[#F2F2F7]"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${CATEGORY_COLORS[t.category] ?? "bg-gray-100"}`}>
                  {CATEGORY_ICONS[t.category] ?? (t.type === "income" ? "💰" : "📌")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1C1E] truncate">{t.description}</p>
                  <p className="text-xs text-[#8E8E93]">
                    {t.category}{t.platform ? ` · ${t.platform}` : ""} · {t.date}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={clsx("text-sm font-bold", t.type === "income" ? "text-[#34C759]" : "text-[#FF3B30]")}>
                    {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}원
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditTarget(t)}
                      className="p-1 text-[#C7C7CC] hover:text-[#007AFF]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 text-[#C7C7CC] hover:text-[#FF3B30]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 플로팅 + 버튼 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#007AFF] rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {showModal && (
        <Modal title="거래 추가" onClose={() => setShowModal(false)}>
          <TransactionForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="거래 수정" onClose={() => setEditTarget(null)}>
          <TransactionForm initial={editTarget} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} />
        </Modal>
      )}
    </div>
  );
}
