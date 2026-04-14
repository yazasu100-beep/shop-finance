"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import PlatformForm from "@/components/platforms/PlatformForm";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { PlatformSale, Platform } from "@/types";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency } from "@/lib/utils";

const PLATFORM_COLORS: Record<string, string> = {
  스마트스토어: "bg-green-100 text-green-700",
  쿠팡: "bg-orange-100 text-orange-700",
  "11번가": "bg-red-100 text-red-700",
  "G마켓": "bg-blue-100 text-blue-700",
  옥션: "bg-yellow-100 text-yellow-700",
  카카오쇼핑: "bg-yellow-50 text-yellow-800",
  자사몰: "bg-purple-100 text-purple-700",
  기타: "bg-gray-100 text-gray-700",
};

const PLATFORM_EMOJI: Record<string, string> = {
  스마트스토어: "🟢", 쿠팡: "🟠", "11번가": "🔴",
  "G마켓": "🔵", 옥션: "🟡", 카카오쇼핑: "💛", 자사몰: "🏪", 기타: "🏬",
};

export default function PlatformsPage() {
  const { t } = useLanguage();
  const [sales, setSales] = useState<PlatformSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PlatformSale | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [startDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/platforms?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch { setSales([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []); // eslint-disable-line

  const filtered = platformFilter === "all" ? sales : sales.filter((s) => s.platform === platformFilter);
  const totalSales = filtered.reduce((s, p) => s + p.salesAmount, 0);
  const totalOrders = filtered.reduce((s, p) => s + p.orderCount, 0);
  const totalNet = filtered.reduce((s, p) => s + p.netAmount, 0);
  const platforms = Array.from(new Set(sales.map((s) => s.platform)));

  const handleCreate = async (data: Omit<PlatformSale, "id" | "createdAt" | "netAmount">) => {
    await fetch("/api/platforms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setShowModal(false);
    await fetchSales();
  };

  const handleUpdate = async (data: Omit<PlatformSale, "id" | "createdAt" | "netAmount">) => {
    if (!editTarget) return;
    await fetch(`/api/platforms?id=${editTarget.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setEditTarget(null);
    await fetchSales();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.platforms.deleteConfirm)) return;
    await fetch(`/api/platforms?id=${id}`, { method: "DELETE" });
    await fetchSales();
  };

  return (
    <div className="page-content">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E5E5EA]">
        <div className="px-4 py-3">
          <h1 className="text-base font-bold text-[#1C1C1E] mb-2">{t.platforms.title}</h1>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            <button onClick={() => setPlatformFilter("all")} className={clsx("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors", platformFilter === "all" ? "bg-[#007AFF] text-white" : "bg-[#F2F2F7] text-[#8E8E93]")}>
              {t.platforms.all}
            </button>
            {platforms.map((p) => (
              <button key={p} onClick={() => setPlatformFilter(p)} className={clsx("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors", platformFilter === p ? "bg-[#007AFF] text-white" : "bg-[#F2F2F7] text-[#8E8E93]")}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 pt-3 grid grid-cols-3 gap-2">
        {[
          { label: t.platforms.totalSales, value: formatCurrency(totalSales), color: "text-[#007AFF]" },
          { label: t.platforms.orders, value: `${totalOrders}${t.platforms.ordersUnit}`, color: "text-[#1C1C1E]" },
          { label: t.platforms.netSales, value: formatCurrency(totalNet), color: totalNet >= 0 ? "text-[#34C759]" : "text-[#FF3B30]" },
        ].map((item) => (
          <div key={item.label} className="card text-center py-3">
            <p className="text-[10px] text-[#8E8E93] mb-0.5">{item.label}</p>
            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="px-4 pt-3">
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[#8E8E93] text-sm">{t.platforms.noData}</p>
            <p className="text-xs text-[#C7C7CC] mt-1">{t.platforms.addHint}</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden divide-y divide-[#F2F2F7]">
            {filtered.map((s) => (
              <div key={s.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-semibold", PLATFORM_COLORS[s.platform] ?? "bg-gray-100 text-gray-700")}>
                      {PLATFORM_EMOJI[s.platform]} {s.platform}
                    </span>
                    <span className="text-xs text-[#8E8E93]">{s.date}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditTarget(s)} className="p-1 text-[#C7C7CC] hover:text-[#007AFF]"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1 text-[#C7C7CC] hover:text-[#FF3B30]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93]">{t.platforms.salesAmount}</span>
                    <span className="font-medium">{formatCurrency(s.salesAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93]">{t.platforms.orderCount}</span>
                    <span className="font-medium">{s.orderCount}{t.platforms.ordersUnit}</span>
                  </div>
                  {s.returnAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#8E8E93]">{t.platforms.returns}</span>
                      <span className="text-[#FF3B30] font-medium">-{formatCurrency(s.returnAmount)}</span>
                    </div>
                  )}
                  {s.fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#8E8E93]">{t.platforms.fee}</span>
                      <span className="text-[#FF9500] font-medium">-{formatCurrency(s.fee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between col-span-2 pt-1 border-t border-[#F2F2F7] mt-1">
                    <span className="text-[#8E8E93] font-medium">{t.platforms.netSales}</span>
                    <span className={clsx("font-bold", s.netAmount >= 0 ? "text-[#34C759]" : "text-[#FF3B30]")}>{formatCurrency(s.netAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setShowModal(true)} className="fixed bottom-20 right-4 w-14 h-14 bg-[#007AFF] rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform">
        <Plus className="w-7 h-7 text-white" />
      </button>

      {showModal && <Modal title={t.platforms.add} onClose={() => setShowModal(false)}><PlatformForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} /></Modal>}
      {editTarget && <Modal title={t.platforms.edit} onClose={() => setEditTarget(null)}><PlatformForm initial={editTarget} onSubmit={handleUpdate} onCancel={() => setEditTarget(null)} /></Modal>}
    </div>
  );
}
