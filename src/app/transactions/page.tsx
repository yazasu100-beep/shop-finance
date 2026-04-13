"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionForm from "@/components/transactions/TransactionForm";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Transaction, TransactionType } from "@/types";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/transactions?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  useEffect(() => {
    let result = transactions;
    if (typeFilter !== "all")
      result = result.filter((t) => t.type === typeFilter);
    if (search)
      result = result.filter(
        (t) =>
          t.description.includes(search) ||
          t.category.includes(search) ||
          (t.platform ?? "").includes(search)
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
    if (!confirm("이 거래를 삭제하시겠습니까?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    await fetchTransactions();
  };

  const totalIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* 상단 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">총 수입</p>
          <p className="text-base font-bold text-blue-600">
            {totalIncome.toLocaleString()}원
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">총 지출</p>
          <p className="text-base font-bold text-red-600">
            {totalExpense.toLocaleString()}원
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">순이익</p>
          <p
            className={`text-base font-bold ${
              totalIncome - totalExpense >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {(totalIncome - totalExpense).toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="card space-y-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <div>
              <label className="label text-xs">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-xs py-1.5"
              />
            </div>
            <div>
              <label className="label text-xs">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-xs py-1.5"
              />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            거래 추가
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-36">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="검색..."
              className="input pl-8 text-xs py-1.5"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            {(["all", "income", "expense"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={
                  typeFilter === f
                    ? "text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium"
                    : "text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              >
                {f === "all" ? "전체" : f === "income" ? "수입" : "지출"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 거래 목록 */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <TransactionList
          transactions={filtered}
          onEdit={(t) => setEditTarget(t)}
          onDelete={handleDelete}
        />
      )}

      {/* 추가 모달 */}
      {showModal && (
        <Modal title="거래 추가" onClose={() => setShowModal(false)}>
          <TransactionForm
            onSubmit={handleCreate}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <Modal title="거래 수정" onClose={() => setEditTarget(null)}>
          <TransactionForm
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}
    </div>
  );
}
