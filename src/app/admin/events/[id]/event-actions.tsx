"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EventActions({
  eventId,
  currentStatus,
  totalCodes,
}: {
  eventId: string;
  currentStatus: "draft" | "open" | "closed";
  totalCodes: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [genCount, setGenCount] = useState("300");
  const [genTickets, setGenTickets] = useState("3");
  const [result, setResult] = useState<string | null>(null);

  async function changeStatus(status: "open" | "closed" | "draft") {
    const labels: Record<string, string> = {
      open: "投票開始",
      closed: "投票締切",
      draft: "下書きに戻す",
    };
    if (!confirm(`${labels[status]}しますか？`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("失敗しました");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function generateCodes() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: Number(genCount) || 300,
          ticketsPerCode: Number(genTickets) || 3,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "失敗しました");
      setResult(`${j.generated} コードを生成しました`);
      router.refresh();
    } catch (e) {
      setResult(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status controls */}
      <div className="flex flex-wrap items-center gap-2">
        {currentStatus === "draft" && (
          <button
            type="button"
            onClick={() => changeStatus("open")}
            disabled={busy || totalCodes === 0}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            🟢 投票開始
          </button>
        )}
        {currentStatus === "open" && (
          <button
            type="button"
            onClick={() => changeStatus("closed")}
            disabled={busy}
            className="rounded-full bg-red-600 hover:bg-red-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            🔴 投票締切
          </button>
        )}
        {currentStatus === "closed" && (
          <button
            type="button"
            onClick={() => changeStatus("open")}
            disabled={busy}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            ↻ 再オープン
          </button>
        )}
        {currentStatus !== "draft" && (
          <button
            type="button"
            onClick={() => changeStatus("draft")}
            disabled={busy}
            className="rounded-full border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            下書きに戻す
          </button>
        )}
      </div>

      {/* Code generation */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          コード生成
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              生成数
            </label>
            <input
              type="number"
              min={1}
              max={2000}
              value={genCount}
              onChange={(e) => setGenCount(e.target.value)}
              className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              チケット/コード
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={genTickets}
              onChange={(e) => setGenTickets(e.target.value)}
              className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={generateCodes}
            disabled={busy}
            className="rounded-full bg-black px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
          >
            {busy ? "生成中..." : "生成"}
          </button>
        </div>
        {result && (
          <p className="mt-2 text-xs text-emerald-700">{result}</p>
        )}
        {totalCodes > 0 && (
          <a
            href={`/api/admin/events/${eventId}/codes-csv`}
            download
            className="mt-2 inline-block text-xs underline text-primary-dark"
          >
            📥 コードCSVをダウンロード
          </a>
        )}
      </div>
    </div>
  );
}
