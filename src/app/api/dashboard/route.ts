import { NextRequest, NextResponse } from "next/server";
import { getTransactions, getPlatformSales } from "@/lib/notion";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import type { DashboardStats, PlatformSalesSummary, CategoryExpense, MonthlyData } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") ?? "6");

  try {
    const startDate = format(startOfMonth(subMonths(new Date(), months - 1)), "yyyy-MM-dd");
    const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");

    const [transactions, platformSales] = await Promise.all([
      getTransactions(startDate, endDate),
      getPlatformSales(startDate, endDate),
    ]);

    // 수입/지출 합계
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const marginRate = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // 플랫폼별 매출 요약
    const platformMap = new Map<string, { salesAmount: number; orderCount: number; netAmount: number }>();
    for (const sale of platformSales) {
      const existing = platformMap.get(sale.platform) ?? { salesAmount: 0, orderCount: 0, netAmount: 0 };
      platformMap.set(sale.platform, {
        salesAmount: existing.salesAmount + sale.salesAmount,
        orderCount: existing.orderCount + sale.orderCount,
        netAmount: existing.netAmount + sale.netAmount,
      });
    }

    const totalSales = Array.from(platformMap.values()).reduce((s, p) => s + p.salesAmount, 0);
    const platformSalesSummary: PlatformSalesSummary[] = Array.from(platformMap.entries())
      .map(([platform, data]) => ({
        platform: platform as PlatformSalesSummary["platform"],
        ...data,
        percentage: totalSales > 0 ? (data.salesAmount / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.salesAmount - a.salesAmount);

    // 카테고리별 지출
    const categoryMap = new Map<string, number>();
    for (const t of transactions.filter((t) => t.type === "expense")) {
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + t.amount);
    }

    const categoryExpenses: CategoryExpense[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 월별 추이 (최근 N개월)
    const monthlyData: MonthlyData[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, "yyyy-MM");
      const label = format(date, "M월");

      const monthIncome = transactions
        .filter((t) => t.type === "income" && t.date.startsWith(monthStr))
        .reduce((s, t) => s + t.amount, 0);

      const monthExpense = transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthStr))
        .reduce((s, t) => s + t.amount, 0);

      monthlyData.push({
        month: label,
        income: monthIncome,
        expense: monthExpense,
        profit: monthIncome - monthExpense,
      });
    }

    const stats: DashboardStats = {
      totalIncome,
      totalExpense,
      netProfit,
      marginRate,
      platformSales: platformSalesSummary,
      monthlyData,
      categoryExpenses,
      recentTransactions: transactions.slice(0, 10),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "대시보드 조회 실패" }, { status: 500 });
  }
}
