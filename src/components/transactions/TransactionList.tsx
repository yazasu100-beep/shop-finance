"use client";

import type { Transaction } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 text-sm">거래 내역이 없습니다.</p>
        <p className="text-gray-400 text-xs mt-1">새 거래를 추가해보세요.</p>
      </div>
    );
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">날짜</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">유형</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">카테고리</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">내용</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">플랫폼</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">금액</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-600">{t.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      t.type === "income" ? "badge-income" : "badge-expense"
                    }
                  >
                    {t.type === "income" ? "수입" : "지출"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{t.category}</td>
                <td className="px-4 py-3 text-gray-800 font-medium max-w-xs truncate">
                  {t.description}
                  {t.memo && (
                    <span className="text-gray-400 font-normal ml-1 text-xs">
                      ({t.memo})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{t.platform ?? "-"}</td>
                <td
                  className={clsx(
                    "px-4 py-3 text-right font-semibold",
                    t.type === "income" ? "text-green-600" : "text-red-600"
                  )}
                >
                  {t.type === "income" ? "+" : "-"}
                  {t.amount.toLocaleString()}원
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-gray-50">
        {transactions.map((t) => (
          <div key={t.id} className="px-4 py-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={
                    t.type === "income" ? "badge-income" : "badge-expense"
                  }
                >
                  {t.type === "income" ? "수입" : "지출"}
                </span>
                <span className="text-xs text-gray-500">{t.date}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <button
                  onClick={() => onEdit(t)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{t.description}</p>
                <p className="text-xs text-gray-500">
                  {t.category}
                  {t.platform ? ` · ${t.platform}` : ""}
                </p>
              </div>
              <span
                className={clsx(
                  "text-sm font-bold ml-2",
                  t.type === "income" ? "text-green-600" : "text-red-600"
                )}
              >
                {t.type === "income" ? "+" : "-"}
                {t.amount.toLocaleString()}원
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
