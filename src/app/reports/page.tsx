"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { DashboardStats } from "@/types";

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<3 | 6 | 12>(6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?months=${period}`)
      .then((r) => r.json())
      .then((data) => { setStats(data?.error ? null : data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const net = (stats?.netProfit ?? 0);
  const marginRate = (stats?.marginRate ?? 0).toFixed(1);
  const avgIncome = stats ? Math.round(stats.totalIncome / period) : 0;
  const avgExpense = stats ? Math.round(stats.totalExpense / period) : 0;
  const avgSaving = avgIncome - avgExpense;
  const savingRate = avgIncome > 0 ? Math.round((avgSaving / avgIncome) * 100) : 0;

  return (
    <div className="page-content">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-[#1C1C1E]">인사이트</h1>
          {/* 기간 선택 */}
          <div className="flex gap-1 bg-[#F2F2F7] rounded-xl p-0.5">
            {([3, 6, 12] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPeriod(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  period === m ? "bg-white text-[#1C1C1E] shadow-sm" : "text-[#8E8E93]"
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {/* Summary 카드 */}
          <div className="card">
            <p className="text-xs font-medium text-[#8E8E93] mb-3">Summary</p>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs text-[#8E8E93]">Total Income</p>
                <p className="text-xl font-bold text-[#1C1C1E]">
                  {(stats?.totalIncome ?? 0).toLocaleString()}원
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8E8E93]">Total Expense</p>
                <p className="text-xl font-bold text-[#FF3B30]">
                  {(stats?.totalExpense ?? 0).toLocaleString()}원
                </p>
              </div>
            </div>
            <div className="border-t border-[#F2F2F7] pt-3 flex justify-between items-center">
              <p className="text-sm text-[#8E8E93]">Net Change</p>
              <p className={`text-lg font-bold ${net >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                {net >= 0 ? "+" : ""}{net.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* Monthly Average 카드 */}
          <div className="card">
            <p className="text-xs font-medium text-[#8E8E93] mb-3">Monthly Average</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Avg. Income", value: `${avgIncome.toLocaleString()}원`, color: "text-[#1C1C1E]" },
                { label: "Avg. Expense", value: `${avgExpense.toLocaleString()}원`, color: "text-[#FF3B30]" },
                { label: "Avg. Saving", value: `${avgSaving.toLocaleString()}원`, color: "text-[#34C759]" },
                { label: "Saving Rate", value: `${savingRate}%`, color: "text-[#007AFF]" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-[#8E8E93]">{item.label}</p>
                  <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#C7C7CC] mt-3">
              마진율 {marginRate}% · 현재 월은 집계 완료 후 평균에 반영됩니다.
            </p>
          </div>

          {/* Trend 차트 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#8E8E93]">Trend</p>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34C759] inline-block" />수입</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF3B30] inline-block" />지출</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#007AFF] inline-block" />순이익</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={stats?.monthlyData ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8E8E93" }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(v: number) => [`${v.toLocaleString()}원`]}
                />
                <Line type="monotone" dataKey="income" stroke="#34C759" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#FF3B30" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#007AFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 플랫폼별 매출 */}
          {(stats?.platformSales?.length ?? 0) > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-[#8E8E93] mb-3">플랫폼별 매출</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={stats!.platformSales} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                  <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "#8E8E93" }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(v: number) => [`${v.toLocaleString()}원`]}
                  />
                  <Bar dataKey="salesAmount" name="매출" fill="#007AFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netAmount" name="순매출" fill="#34C759" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-3 space-y-2">
                {stats!.platformSales.map((p) => (
                  <div key={p.platform} className="flex items-center justify-between text-xs">
                    <span className="text-[#1C1C1E] font-medium">{p.platform}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8E8E93]">{p.orderCount}건</span>
                      <span className="text-[#8E8E93]">{p.percentage.toFixed(1)}%</span>
                      <span className="font-semibold text-[#007AFF]">{p.salesAmount.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 카테고리별 지출 */}
          {(stats?.categoryExpenses?.length ?? 0) > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-[#8E8E93] mb-3">카테고리별 지출</p>
              <div className="space-y-3">
                {stats!.categoryExpenses.map((item, i) => {
                  const colors = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#5AC8FA"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#1C1C1E] font-medium">{item.category}</span>
                        <div className="flex gap-2">
                          <span className="text-[#8E8E93]">{item.percentage.toFixed(1)}%</span>
                          <span className="font-semibold">{item.amount.toLocaleString()}원</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#F2F2F7] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
