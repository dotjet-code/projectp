"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StageActions({ stageId }: { stageId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinalize() {
    if (
      !confirm(
        "この Stage を確定しますか？\n" +
          "現時点のスナップショットを period_points に書き込み、\n" +
          "Stage は closed になります（取り消し不可）。"
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stages/${stageId}/finalize`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onFinalize}
        disabled={busy}
        className="rounded-full bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
      >
        {busy ? "確定中..." : "✅ 確定する"}
      </button>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
