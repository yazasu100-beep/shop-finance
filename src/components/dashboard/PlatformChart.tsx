"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PlatformSalesSummary } from "@/types";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

interface PlatformChartProps {
  data: PlatformSalesSummary[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: PlatformSalesSummary }>;
}) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{d.platform}</p>
      <p className="text-gray-600">
        매출: <span className="font-medium">{d.salesAmount.toLocaleString()}원</span>
      </p>
      <p className="text-gray-600">
        주문수: <span className="font-medium">{d.orderCount}건</span>
      </p>
      <p className="text-gray-600">
        비율: <span className="font-medium">{d.percentage.toFixed(1)}%</span>
      </p>
    </div>
  );
};

export default function PlatformChart({ data }: PlatformChartProps) {
  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">플랫폼 매출 데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">플랫폼별 매출 비율</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            dataKey="salesAmount"
            nameKey="platform"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ fontSize: "12px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 플랫폼 상세 리스트 */}
      <div className="mt-3 space-y-2">
        {data.map((item, index) => (
          <div key={item.platform} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-600">{item.platform}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">{item.percentage.toFixed(1)}%</span>
              <span className="font-medium text-gray-800">
                {item.salesAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
