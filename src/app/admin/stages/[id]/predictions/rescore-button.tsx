"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RescoreButton({ stageId }: { stageId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(
        `/api/admin/stages/${stageId}/score-predictions`,
        { method: "POST" }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setResult(`${j.scored} 件を再採点しました`);
      router.refresh();
    } catch (e) {
      setResult(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="rounded-full border border-purple-300 px-3 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-50 disabled:opacity-40"
      >
        {busy ? "採点中..." : "再採点"}
      </button>
      {result && (
        <p className="mt-1 text-[10px] text-purple-700">{result}</p>
      )}
    </div>
  );
}
