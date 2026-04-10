"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MemberTotal = {
  memberId: string;
  name: string;
  totalVotes: number;
};

/**
 * 投票数をそのまま special_point_entries に一括反映するボタン。
 * 同じ日付で既にエントリがあると重複する可能性があるので、
 * note に「投票連携」と入れて判別可能にする。
 */
export function ConvertToSpecialButton({
  stageId,
  memberTotals,
}: {
  stageId: string;
  memberTotals: MemberTotal[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onClick() {
    if (
      !confirm(
        `${memberTotals.length} メンバーの投票数を特別ポイントに反映しますか？\n` +
          "各メンバーの投票数がそのまま SPECIAL ポイントとして追加されます。"
      )
    ) {
      return;
    }
    setBusy(true);
    setResult(null);
    const today = new Date().toISOString().slice(0, 10);
    let ok = 0;
    let fail = 0;

    for (const m of memberTotals) {
      if (m.totalVotes === 0) continue;
      try {
        const res = await fetch(`/api/admin/stages/${stageId}/special`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId: m.memberId,
            liveDate: today,
            points: m.totalVotes,
            note: `投票連携 (${m.totalVotes}票)`,
          }),
        });
        if (res.ok) ok++;
        else fail++;
      } catch {
        fail++;
      }
    }

    setResult(`${ok} 件追加${fail > 0 ? ` / ${fail} 件失敗` : ""}`);
    setBusy(false);
    router.refresh();
  }

  if (memberTotals.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="rounded-full bg-purple-600 hover:bg-purple-700 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
      >
        {busy ? "反映中..." : "⭐ 特別ポイントに反映"}
      </button>
      {result && (
        <span className="text-[10px] text-purple-700">{result}</span>
      )}
    </div>
  );
}
