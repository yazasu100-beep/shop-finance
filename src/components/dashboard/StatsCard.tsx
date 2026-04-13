import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "purple";
  trend?: { value: number; label: string };
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    text: "text-green-600",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-600",
    text: "text-red-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    text: "text-purple-600",
  },
};

export default function StatsCard({
  title,
  value,
  subValue,
  icon: Icon,
  color,
  trend,
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className={clsx("card flex items-start gap-4", c.bg)}>
      <div className={clsx("p-2.5 rounded-xl", c.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
        <p className={clsx("text-xl font-bold truncate", c.text)}>{value}</p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>
        )}
        {trend && (
          <p
            className={clsx(
              "text-xs mt-1 font-medium",
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value).toFixed(1)}%{" "}
            {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}
