import type { Transaction } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">최근 거래</h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          전체보기 <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">거래 내역이 없습니다</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    t.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {t.type === "income" ? "+" : "-"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {t.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.date} · {t.category}
                    {t.platform ? ` · ${t.platform}` : ""}
                  </p>
                </div>
              </div>
              <span
                className={clsx(
                  "text-sm font-semibold flex-shrink-0 ml-2",
                  t.type === "income" ? "text-green-600" : "text-red-600"
                )}
              >
                {t.type === "income" ? "+" : "-"}
                {t.amount.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
