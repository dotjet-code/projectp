"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BatchResult = {
  ok: boolean;
  total: number;
  succeededCount: number;
  failedCount: number;
  failed: { name: string; error: string }[];
};

export function RunBatchButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onRun() {
    if (
      !confirm(
        "今すぐ全メンバーの YouTube データを取得し直しますか？\n" +
          "API クォータを消費します。"
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/run-batch", { method: "POST" });
      const j = await res.json();
      if (!res.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setResult(j);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={onRun}
        disabled={busy}
        className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-40"
      >
        {busy ? "取得中..." : "🔄 今すぐ更新"}
      </button>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
      {result && (
        <p className="text-[10px] text-emerald-700">
          ✓ {result.succeededCount}/{result.total} 件成功
          {result.failedCount > 0 && ` / ${result.failedCount} 件失敗`}
        </p>
      )}
      {result?.failed && result.failed.length > 0 && (
        <ul className="text-[9px] text-red-700">
          {result.failed.map((f) => (
            <li key={f.name}>
              {f.name}: {f.error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
