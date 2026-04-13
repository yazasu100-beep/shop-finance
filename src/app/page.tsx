"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import PlatformChart from "@/components/dashboard/PlatformChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?months=${months}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data?.error ? null : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [months]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!stats)
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
        <p className="text-sm text-gray-400 mt-1">
          Notion API 설정을 확인해주세요.
        </p>
      </div>
    );

  const fmt = (n: number) =>
    n >= 0
      ? `+${n.toLocaleString()}원`
      : `${n.toLocaleString()}원`;

  return (
    <div className="space-y-5">
      {/* 기간 선택 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">최근 {months}개월 기준</p>
        <div className="flex gap-2">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={
                months === m
                  ? "btn-primary text-xs py-1.5 px-3"
                  : "btn-secondary text-xs py-1.5 px-3"
              }
            >
              {m}개월
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="총 수입"
          value={`${stats.totalIncome.toLocaleString()}원`}
          icon={TrendingUp}
          color="blue"
        />
        <StatsCard
          title="총 지출"
          value={`${stats.totalExpense.toLocaleString()}원`}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="순이익"
          value={fmt(stats.netProfit)}
          icon={DollarSign}
          color={stats.netProfit >= 0 ? "green" : "red"}
          subValue={`마진율 ${stats.marginRate.toFixed(1)}%`}
        />
        <StatsCard
          title="마진율"
          value={`${stats.marginRate.toFixed(1)}%`}
          icon={Percent}
          color="purple"
          subValue={
            stats.platformSales[0]
              ? `최상위: ${stats.platformSales[0].platform}`
              : undefined
          }
        />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MonthlyChart data={stats.monthlyData} />
        </div>
        <div>
          <PlatformChart data={stats.platformSales} />
        </div>
      </div>

      {/* 하단 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 카테고리별 지출 */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">카테고리별 지출</h3>
          {stats.categoryExpenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryExpenses.slice(0, 6).map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.category}</span>
                    <span className="font-medium">
                      {item.amount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-red-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-0.5">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 플랫폼별 순매출 */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">플랫폼 순매출 순위</h3>
          {stats.platformSales.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">데이터 없음</p>
          ) : (
            <div className="space-y-3">
              {stats.platformSales.map((item, index) => (
                <div key={item.platform} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.platform}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.orderCount}건 · 수수료 후 순매출
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
                    {item.netAmount.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 최근 거래 */}
        <RecentTransactions transactions={stats.recentTransactions} />
      </div>
    </div>
  );
}
