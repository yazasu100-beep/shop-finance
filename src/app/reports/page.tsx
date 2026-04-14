"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { DashboardStats } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { t } = useLanguage();
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

  const net = stats?.netProfit ?? 0;
  const marginRate = (stats?.marginRate ?? 0).toFixed(1);
  const avgIncome = stats ? Math.round(stats.totalIncome / period) : 0;
  const avgExpense = stats ? Math.round(stats.totalExpense / period) : 0;
  const avgSaving = avgIncome - avgExpense;
  const savingRate = avgIncome > 0 ? Math.round((avgSaving / avgIncome) * 100) : 0;

  const tooltipFormatter = (v: number) => [formatCurrency(v)];

  return (
    <div className="page-content">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-[#1C1C1E]">{t.reports.title}</h1>
          <div className="flex gap-1 bg-[#F2F2F7] rounded-xl p-0.5">
            {([3, 6, 12] as const).map((m) => (
              <button key={m} onClick={() => setPeriod(m)} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${period === m ? "bg-white text-[#1C1C1E] shadow-sm" : "text-[#8E8E93]"}`}>
                {m}M
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? <LoadingSpinner size="lg" /> : (
        <div className="px-4 pt-4 space-y-3">
          {/* Summary */}
          <div className="card">
            <p className="text-xs font-medium text-[#8E8E93] mb-3">{t.reports.summary}</p>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-xs text-[#8E8E93]">{t.reports.totalIncome}</p>
                <p className="text-xl font-bold text-[#1C1C1E]">{formatCurrency(stats?.totalIncome ?? 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8E8E93]">{t.reports.totalExpense}</p>
                <p className="text-xl font-bold text-[#FF3B30]">{formatCurrency(stats?.totalExpense ?? 0)}</p>
              </div>
            </div>
            <div className="border-t border-[#F2F2F7] pt-3 flex justify-between items-center">
              <p className="text-sm text-[#8E8E93]">{t.reports.netChange}</p>
              <p className={`text-lg font-bold ${net >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                {net >= 0 ? "+" : ""}{formatCurrency(net)}
              </p>
            </div>
          </div>

          {/* Monthly Average */}
          <div className="card">
            <p className="text-xs font-medium text-[#8E8E93] mb-3">{t.reports.monthlyAvg}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t.reports.avgIncome, value: formatCurrency(avgIncome), color: "text-[#1C1C1E]" },
                { label: t.reports.avgExpense, value: formatCurrency(avgExpense), color: "text-[#FF3B30]" },
                { label: t.reports.avgSaving, value: formatCurrency(avgSaving), color: "text-[#34C759]" },
                { label: t.reports.savingRate, value: `${savingRate}%`, color: "text-[#007AFF]" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-[#8E8E93]">{item.label}</p>
                  <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#C7C7CC] mt-3">
              {t.reports.marginNote} {marginRate}% · {t.reports.avgNote}
            </p>
          </div>

          {/* Trend */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#8E8E93]">{t.reports.trend}</p>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34C759] inline-block" />{t.reports.trendIncome}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF3B30] inline-block" />{t.reports.trendExpense}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#007AFF] inline-block" />{t.reports.trendProfit}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={stats?.monthlyData ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8E8E93" }} />
                <YAxis hide />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={tooltipFormatter} />
                <Line type="monotone" dataKey="income" stroke="#34C759" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#FF3B30" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#007AFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Platform sales */}
          {(stats?.platformSales?.length ?? 0) > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-[#8E8E93] mb-3">{t.reports.platformSales}</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={stats!.platformSales} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                  <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "#8E8E93" }} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={tooltipFormatter} />
                  <Bar dataKey="salesAmount" name={t.reports.salesLabel} fill="#007AFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netAmount" name={t.reports.netSalesLabel} fill="#34C759" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {stats!.platformSales.map((p) => (
                  <div key={p.platform} className="flex items-center justify-between text-xs">
                    <span className="text-[#1C1C1E] font-medium">{p.platform}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#8E8E93]">{p.orderCount}{t.reports.ordersUnit}</span>
                      <span className="text-[#8E8E93]">{p.percentage.toFixed(1)}%</span>
                      <span className="font-semibold text-[#007AFF]">{formatCurrency(p.salesAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category expenses */}
          {(stats?.categoryExpenses?.length ?? 0) > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-[#8E8E93] mb-3">{t.reports.categoryExpense}</p>
              <div className="space-y-3">
                {stats!.categoryExpenses.map((item, i) => {
                  const colors = ["#007AFF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#5AC8FA"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[#1C1C1E] font-medium">{t.categories[item.category] ?? item.category}</span>
                        <div className="flex gap-2">
                          <span className="text-[#8E8E93]">{item.percentage.toFixed(1)}%</span>
                          <span className="font-semibold">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#F2F2F7] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: color }} />
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
