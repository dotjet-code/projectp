"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionReviewButton({
  submissionId,
  mode,
}: {
  submissionId: number;
  mode: "review" | "revoke";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function send(status: "approved" | "rejected" | "revoked") {
    const labels: Record<string, string> = {
      approved: "承認",
      rejected: "却下",
      revoked: "取り消し",
    };
    if (!confirm(`この提出を${labels[status]}しますか？`)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
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

  if (mode === "revoke") {
    return (
      <button
        type="button"
        onClick={() => send("revoked")}
        disabled={busy}
        className="rounded-full border border-gray-300 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 shrink-0"
      >
        {busy ? "..." : "↩ 取り消し"}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <button
        type="button"
        onClick={() => send("approved")}
        disabled={busy}
        className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
      >
        ✅ 承認
      </button>
      <button
        type="button"
        onClick={() => send("rejected")}
        disabled={busy}
        className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
      >
        ❌ 却下
      </button>
    </div>
  );
}
