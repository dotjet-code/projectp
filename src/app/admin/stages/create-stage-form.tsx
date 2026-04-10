"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateStageForm({ hasActive }: { hasActive: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [seriesNumber, setSeriesNumber] = useState("1");
  const [stageNumber, setStageNumber] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // name は自動生成: "Series 1 Stage 1: 夜明け前"
      const sn = seriesNumber ? Number(seriesNumber) : null;
      const stn = stageNumber ? Number(stageNumber) : null;
      const autoName =
        sn && stn
          ? `Series ${sn} Stage ${stn}${title ? `: ${title}` : ""}`
          : title || `Stage ${new Date().toISOString().slice(0, 10)}`;

      const res = await fetch("/api/admin/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: autoName,
          seriesNumber: sn,
          stageNumber: stn,
          title: title || null,
          subtitle: subtitle || null,
          startDate,
          endDate,
          status: "active",
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setTitle("");
      setSubtitle("");
      setStartDate("");
      setEndDate("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3"
    >
      {hasActive && (
        <p className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-900">
          ⚠️ 既に active な Stage があります。新しい Stage を active で作る前に、
          現在の Stage を確定 (close) してください。
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Series 番号
          </label>
          <input
            type="number"
            min={1}
            value={seriesNumber}
            onChange={(e) => setSeriesNumber(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Stage 番号
          </label>
          <input
            type="number"
            min={1}
            max={6}
            value={stageNumber}
            onChange={(e) => setStageNumber(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          タイトル（例: 夜明け前）
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="夜明け前"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          サブタイトル（任意）
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          placeholder="春の終わりに、誰が立つか"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            開始日 *
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            終了日 *
          </label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600">エラー: {error}</p>}

      <button
        type="submit"
        disabled={submitting || !startDate || !endDate}
        className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        {submitting ? "作成中..." : "Stage を作成"}
      </button>
    </form>
  );
}
