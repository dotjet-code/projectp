"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionActions({
  submissionId,
  stageId,
}: {
  submissionId: number;
  stageId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function review(status: "approved" | "rejected") {
    const label = status === "approved" ? "承認" : "却下";
    if (!confirm(`この提出を${label}しますか？`)) return;

    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/stages/${stageId}/submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      alert(`エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => review("approved")}
        disabled={busy}
        className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
      >
        {busy ? "..." : "✅ 承認"}
      </button>
      <button
        type="button"
        onClick={() => review("rejected")}
        disabled={busy}
        className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
      >
        {busy ? "..." : "❌ 却下"}
      </button>
    </div>
  );
}
