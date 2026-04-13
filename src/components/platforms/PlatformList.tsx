"use client";

import type { PlatformSale } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";

interface PlatformListProps {
  sales: PlatformSale[];
  onEdit: (s: PlatformSale) => void;
  onDelete: (id: string) => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  스마트스토어: "bg-green-100 text-green-800",
  쿠팡: "bg-orange-100 text-orange-800",
  "11번가": "bg-red-100 text-red-800",
  "G마켓": "bg-blue-100 text-blue-800",
  옥션: "bg-yellow-100 text-yellow-800",
  카카오쇼핑: "bg-yellow-100 text-yellow-900",
  자사몰: "bg-purple-100 text-purple-800",
  기타: "bg-gray-100 text-gray-800",
};

export default function PlatformList({
  sales,
  onEdit,
  onDelete,
}: PlatformListProps) {
  if (sales.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 text-sm">플랫폼 매출 내역이 없습니다.</p>
        <p className="text-gray-400 text-xs mt-1">새 매출을 추가해보세요.</p>
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">플랫폼</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">매출액</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">주문수</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">반품</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">수수료</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">순매출</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">관리</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-600">{s.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      PLATFORM_COLORS[s.platform] ?? "bg-gray-100 text-gray-800"
                    )}
                  >
                    {s.platform}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-800 font-medium">
                  {s.salesAmount.toLocaleString()}원
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {s.orderCount}건
                </td>
                <td className="px-4 py-3 text-right text-red-500">
                  {s.returnAmount > 0 ? `-${s.returnAmount.toLocaleString()}원` : "-"}
                </td>
                <td className="px-4 py-3 text-right text-orange-500">
                  {s.fee > 0 ? `-${s.fee.toLocaleString()}원` : "-"}
                </td>
                <td
                  className={clsx(
                    "px-4 py-3 text-right font-semibold",
                    s.netAmount >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {s.netAmount.toLocaleString()}원
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(s)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
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

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {sales.map((s) => (
          <div key={s.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    PLATFORM_COLORS[s.platform] ?? "bg-gray-100 text-gray-800"
                  )}
                >
                  {s.platform}
                </span>
                <span className="text-xs text-gray-500">{s.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(s)} className="p-1 text-gray-400 hover:text-blue-600">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-gray-500">매출액</span>
              <span className="text-right font-medium">{s.salesAmount.toLocaleString()}원</span>
              <span className="text-gray-500">주문수</span>
              <span className="text-right">{s.orderCount}건</span>
              {s.returnAmount > 0 && (
                <>
                  <span className="text-gray-500">반품</span>
                  <span className="text-right text-red-500">-{s.returnAmount.toLocaleString()}원</span>
                </>
              )}
              {s.fee > 0 && (
                <>
                  <span className="text-gray-500">수수료</span>
                  <span className="text-right text-orange-500">-{s.fee.toLocaleString()}원</span>
                </>
              )}
              <span className="text-gray-700 font-medium">순매출</span>
              <span className={clsx("text-right font-bold", s.netAmount >= 0 ? "text-green-600" : "text-red-600")}>
                {s.netAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
