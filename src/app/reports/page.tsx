"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { DashboardStats } from "@/types";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?months=${months}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [months]);

  const periodLabel = `${format(startOfMonth(subMonths(new Date(), months - 1)), "yyyy.MM")} ~ ${format(endOfMonth(new Date()), "yyyy.MM")}`;

  if (loading) return <LoadingSpinner size="lg" />;
  if (!stats)
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    );

  const profitRate =
    stats.totalIncome > 0
      ? ((stats.netProfit / stats.totalIncome) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-5">
      {/* 기간 선택 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{periodLabel}</p>
        <div className="flex gap-2">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={
                months === m ? "btn-primary text-xs py-1.5 px-3" : "btn-secondary text-xs py-1.5 px-3"
              }
            >
              {m}개월
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "총 수입", value: `${stats.totalIncome.toLocaleString()}원`, color: "text-blue-600" },
          { label: "총 지출", value: `${stats.totalExpense.toLocaleString()}원`, color: "text-red-600" },
          {
            label: "순이익",
            value: `${stats.netProfit >= 0 ? "+" : ""}${stats.netProfit.toLocaleString()}원`,
            color: stats.netProfit >= 0 ? "text-green-600" : "text-red-600",
          },
          { label: "마진율", value: `${profitRate}%`, color: "text-purple-600" },
        ].map((item) => (
          <div key={item.label} className="card text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* 월별 수입/지출 막대 */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">월별 수입 vs 지출</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(v) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(0)}M`
                  : v >= 10_000
                  ? `${(v / 10_000).toFixed(0)}만`
                  : String(v)
              }
              tick={{ fontSize: 11 }}
              width={50}
            />
            <Tooltip
              formatter={(v: number) => [`${v.toLocaleString()}원`]}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="income" name="수입" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="지출" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 2열 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 월별 순이익 */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">월별 순이익 추이</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) =>
                  v >= 10_000 ? `${(v / 10_000).toFixed(0)}만` : String(v)
                }
                tick={{ fontSize: 11 }}
                width={45}
              />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()}원`]} />
              <Bar
                dataKey="profit"
                name="순이익"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                // 음수면 붉은색으로
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 카테고리별 지출 레이더 */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">지출 구성 분석</h3>
          {stats.categoryExpenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">데이터 없음</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={stats.categoryExpenses.slice(0, 6)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                <Radar
                  name="지출"
                  dataKey="amount"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()}원`]} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 플랫폼별 매출 상세 테이블 */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">플랫폼별 매출 상세</h3>
        {stats.platformSales.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-medium text-gray-500">플랫폼</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500">매출액</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500">주문수</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500">순매출</th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-500">비율</th>
                </tr>
              </thead>
              <tbody>
                {stats.platformSales.map((p, i) => (
                  <tr key={p.platform} className="border-b border-gray-50">
                    <td className="py-2.5 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      {p.platform}
                    </td>
                    <td className="py-2.5 text-right">{p.salesAmount.toLocaleString()}원</td>
                    <td className="py-2.5 text-right text-gray-500">{p.orderCount}건</td>
                    <td className="py-2.5 text-right font-medium text-green-600">
                      {p.netAmount.toLocaleString()}원
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(p.percentage, 100)}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {p.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="pt-2.5 font-semibold text-gray-800">합계</td>
                  <td className="pt-2.5 text-right font-semibold">
                    {stats.platformSales
                      .reduce((s, p) => s + p.salesAmount, 0)
                      .toLocaleString()}
                    원
                  </td>
                  <td className="pt-2.5 text-right font-semibold text-gray-500">
                    {stats.platformSales.reduce((s, p) => s + p.orderCount, 0)}건
                  </td>
                  <td className="pt-2.5 text-right font-semibold text-green-600">
                    {stats.platformSales
                      .reduce((s, p) => s + p.netAmount, 0)
                      .toLocaleString()}
                    원
                  </td>
                  <td className="pt-2.5 text-right font-semibold text-gray-500">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 카테고리별 지출 상세 */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">카테고리별 지출 상세</h3>
        {stats.categoryExpenses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
        ) : (
          <div className="space-y-3">
            {stats.categoryExpenses.map((item, i) => (
              <div key={item.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-gray-700">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="font-medium text-gray-800">
                      {item.amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
