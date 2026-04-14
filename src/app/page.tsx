"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Settings, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { subMonths, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import TransactionForm from "@/components/transactions/TransactionForm";
import type { DashboardStats, Transaction } from "@/types";

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

export default function HomePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?months=1&startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setStats(data?.error ? null : data);
    } catch { setStats(null); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleCreate = async (data: Omit<Transaction, "id" | "createdAt">) => {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAddModal(false);
    await fetchStats();
  };

  const income = stats?.totalIncome ?? 0;
  const expense = stats?.totalExpense ?? 0;
  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
  const expenseRatio = income > 0 ? Math.min((expense / income) * 100, 100) : 0;

  return (
    <div className="page-content">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-1.5 text-[#8E8E93] active:bg-[#F2F2F7] rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#1C1C1E]">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h1>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-1.5 text-[#8E8E93] active:bg-[#F2F2F7] rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {/* 수입/지출 요약 카드 */}
          <div className="card">
            <p className="text-xs font-medium text-[#8E8E93] mb-3">수입 / 지출</p>
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-xs text-[#8E8E93]">수입</p>
                <p className="text-2xl font-bold text-[#1C1C1E]">
                  {income.toLocaleString()}원
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8E8E93]">지출</p>
                <p className="text-xl font-semibold text-[#FF3B30]">
                  {expense.toLocaleString()}원
                </p>
              </div>
            </div>
            {/* 진행 바 */}
            <div className="w-full bg-[#F2F2F7] rounded-full h-2 mb-3">
              <div
                className="h-2 rounded-full bg-[#FF3B30] transition-all"
                style={{ width: `${expenseRatio}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-[#8E8E93]">잔여금액</p>
                <p className={`font-semibold ${net >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                  {net >= 0 ? "+" : ""}{net.toLocaleString()}원
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#8E8E93]">저축률</p>
                <p className={`font-semibold ${savingsRate >= 0 ? "text-[#007AFF]" : "text-[#FF3B30]"}`}>
                  {savingsRate}%
                </p>
              </div>
            </div>
          </div>

          {/* 플랫폼 매출 Top */}
          {(stats?.platformSales?.length ?? 0) > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-[#8E8E93] mb-3">최고 매출 플랫폼</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                    🏪
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1C1C1E]">
                      {stats!.platformSales[0].platform}
                    </p>
                    <p className="text-xs text-[#8E8E93]">
                      {stats!.platformSales[0].orderCount}건
                    </p>
                  </div>
                </div>
                <p className="text-base font-bold text-[#1C1C1E]">
                  {stats!.platformSales[0].salesAmount.toLocaleString()}원
                </p>
              </div>
            </div>
          )}

          {/* 카테고리별 지출 */}
          {(stats?.categoryExpenses?.length ?? 0) > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-[#8E8E93] mb-3">카테고리별 지출</p>
              <div className="space-y-3">
                {stats!.categoryExpenses.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${CATEGORY_COLORS[item.category] ?? "bg-gray-100"}`}>
                      {CATEGORY_ICONS[item.category] ?? "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#1C1C1E] font-medium truncate">{item.category}</span>
                        <span className="text-[#1C1C1E] font-semibold ml-2 flex-shrink-0">
                          {item.amount.toLocaleString()}원
                        </span>
                      </div>
                      <div className="w-full bg-[#F2F2F7] rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-[#007AFF]"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-right text-xs text-[#8E8E93] mt-0.5">{item.percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 거래 */}
          <div className="card">
            <p className="text-xs font-medium text-[#8E8E93] mb-3">최근 거래</p>
            {(stats?.recentTransactions?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#8E8E93] text-center py-4">거래 내역이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {stats!.recentTransactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${CATEGORY_COLORS[t.category] ?? "bg-gray-100"}`}>
                      {CATEGORY_ICONS[t.category] ?? (t.type === "income" ? "💰" : "📌")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1C1E] truncate">{t.description}</p>
                      <p className="text-xs text-[#8E8E93]">{t.category} · {t.date}</p>
                    </div>
                    <span className={`text-sm font-semibold flex-shrink-0 ${t.type === "income" ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                      {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notion 미연결 안내 */}
          {!stats && !loading && (
            <div className="card text-center py-8">
              <p className="text-[#8E8E93] text-sm">Notion API 설정을 확인해주세요</p>
            </div>
          )}
        </div>
      )}

      {/* 플로팅 + 버튼 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#007AFF] rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>

      {showAddModal && (
        <Modal title="거래 추가" onClose={() => setShowAddModal(false)}>
          <TransactionForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
