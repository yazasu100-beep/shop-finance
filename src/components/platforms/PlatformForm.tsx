"use client";

import { useState } from "react";
import type { PlatformSale, Platform } from "@/types";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency } from "@/lib/utils";

const PLATFORMS: Platform[] = [
  "스마트스토어", "쿠팡", "11번가", "G마켓", "옥션", "카카오쇼핑", "자사몰", "기타",
];

interface PlatformFormProps {
  initial?: Partial<PlatformSale>;
  onSubmit: (data: Omit<PlatformSale, "id" | "createdAt" | "netAmount">) => Promise<void>;
  onCancel: () => void;
}

export default function PlatformForm({ initial, onSubmit, onCancel }: PlatformFormProps) {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState<Platform>(initial?.platform ?? "스마트스토어");
  const [date, setDate] = useState(initial?.date ?? format(new Date(), "yyyy-MM-dd"));
  const [salesAmount, setSalesAmount] = useState(initial?.salesAmount?.toString() ?? "");
  const [orderCount, setOrderCount] = useState(initial?.orderCount?.toString() ?? "");
  const [returnAmount, setReturnAmount] = useState(initial?.returnAmount?.toString() ?? "0");
  const [fee, setFee] = useState(initial?.fee?.toString() ?? "0");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [loading, setLoading] = useState(false);

  const parseNum = (v: string) => parseInt(v.replace(/,/g, ""), 10) || 0;
  const fmt = (v: string) => {
    const n = v.replace(/[^0-9]/g, "");
    return n ? parseInt(n).toLocaleString() : "";
  };

  const net = parseNum(salesAmount) - parseNum(returnAmount) - parseNum(fee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        platform, date,
        salesAmount: parseNum(salesAmount),
        orderCount: parseNum(orderCount),
        returnAmount: parseNum(returnAmount),
        fee: parseNum(fee),
        memo: memo || undefined,
      });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* 플랫폼 */}
        <div className="col-span-2">
          <label className="label">{t.form.platformLabel}</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="input">
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* 날짜 */}
        <div className="col-span-2">
          <label className="label">{t.form.date}</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
        </div>

        {/* 매출액 */}
        <div>
          <label className="label">{t.form.salesAmount}</label>
          <input type="text" value={salesAmount} onChange={(e) => setSalesAmount(fmt(e.target.value))} placeholder="0" className="input text-right" required />
        </div>

        {/* 주문수 */}
        <div>
          <label className="label">{t.form.orderCount}</label>
          <input type="number" value={orderCount} onChange={(e) => setOrderCount(e.target.value)} placeholder="0" className="input text-right" min="0" />
        </div>

        {/* 반품금액 */}
        <div>
          <label className="label">{t.form.returnAmount}</label>
          <input type="text" value={returnAmount} onChange={(e) => setReturnAmount(fmt(e.target.value))} placeholder="0" className="input text-right" />
        </div>

        {/* 수수료 */}
        <div>
          <label className="label">{t.form.feeLabel}</label>
          <input type="text" value={fee} onChange={(e) => setFee(fmt(e.target.value))} placeholder="0" className="input text-right" />
        </div>
      </div>

      {/* 순매출 미리보기 */}
      <div className="bg-blue-50 rounded-lg px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-blue-700 font-medium">{t.form.netSales}</span>
        <span className={`text-sm font-bold ${net >= 0 ? "text-blue-700" : "text-red-600"}`}>
          {formatCurrency(net)}
        </span>
      </div>

      {/* 메모 */}
      <div>
        <label className="label">{t.form.memo}</label>
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={t.form.memoPlaceholder} className="input resize-none" rows={2} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1" disabled={loading}>{t.form.cancel}</button>
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? t.form.saving : t.form.save}
        </button>
      </div>
    </form>
  );
}
