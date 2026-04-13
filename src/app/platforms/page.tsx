"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import PlatformList from "@/components/platforms/PlatformList";
import PlatformForm from "@/components/platforms/PlatformForm";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { PlatformSale, Platform } from "@/types";
import { format, startOfMonth, endOfMonth } from "date-fns";

const PLATFORMS: Platform[] = [
  "스마트스토어",
  "쿠팡",
  "11번가",
  "G마켓",
  "옥션",
  "카카오쇼핑",
  "자사몰",
  "기타",
];

export default function PlatformsPage() {
  const [sales, setSales] = useState<PlatformSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PlatformSale | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/platforms?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const filtered =
    platformFilter === "all"
      ? sales
      : sales.filter((s) => s.platform === platformFilter);

  const totalSales = filtered.reduce((s, p) => s + p.salesAmount, 0);
  const totalOrders = filtered.reduce((s, p) => s + p.orderCount, 0);
  const totalNet = filtered.reduce((s, p) => s + p.netAmount, 0);

  const handleCreate = async (
    data: Omit<PlatformSale, "id" | "createdAt" | "netAmount">
  ) => {
    await fetch("/api/platforms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    await fetchSales();
  };

  const handleUpdate = async (
    data: Omit<PlatformSale, "id" | "createdAt" | "netAmount">
  ) => {
    if (!editTarget) return;
    await fetch(`/api/platforms?id=${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditTarget(null);
    await fetchSales();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 매출 데이터를 삭제하시겠습니까?")) return;
    await fetch(`/api/platforms?id=${id}`, { method: "DELETE" });
    await fetchSales();
  };

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">총 매출액</p>
          <p className="text-base font-bold text-blue-600">
            {totalSales.toLocaleString()}원
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">총 주문수</p>
          <p className="text-base font-bold text-gray-800">
            {totalOrders.toLocaleString()}건
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">순매출</p>
          <p
            className={`text-base font-bold ${
              totalNet >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalNet.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="card space-y-3">
        <div className="flex flex-wrap gap-2 items-end justify-between">
          <div className="flex gap-2">
            <div>
              <label className="label text-xs">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input text-xs py-1.5"
              />
            </div>
            <div>
              <label className="label text-xs">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input text-xs py-1.5"
              />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            매출 추가
          </button>
        </div>

        {/* 플랫폼 필터 */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setPlatformFilter("all")}
            className={
              platformFilter === "all"
                ? "text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium"
                : "text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          >
            전체
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={
                platformFilter === p
                  ? "text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium"
                  : "text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <PlatformList
          sales={filtered}
          onEdit={(s) => setEditTarget(s)}
          onDelete={handleDelete}
        />
      )}

      {showModal && (
        <Modal title="플랫폼 매출 추가" onClose={() => setShowModal(false)}>
          <PlatformForm
            onSubmit={handleCreate}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="플랫폼 매출 수정" onClose={() => setEditTarget(null)}>
          <PlatformForm
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}
    </div>
  );
}
