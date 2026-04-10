"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BalanceForm({
  stageId,
  member,
  initialAmount,
  initialNote,
}: {
  stageId: string;
  member: { id: string; name: string };
  initialAmount: number;
  initialNote: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(initialAmount.toString());
  const [note, setNote] = useState(initialNote);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setBusy(true);
    setError(null);
    try {
      const parsed = Number(amount);
      if (Number.isNaN(parsed)) throw new Error("数値を入力してください");
      const res = await fetch(`/api/admin/stages/${stageId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          amount: parsed,
          note: note || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setSavedAt(new Date().toLocaleTimeString("ja-JP"));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="sm:w-32 shrink-0">
        <p className="font-bold text-foreground">{member.name}</p>
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
            残金 (pts)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
            メモ（任意）
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: グッズ売上 + 投げ銭"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:w-auto">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="rounded-full bg-black px-4 py-1.5 text-xs font-bold text-white disabled:opacity-40"
        >
          {busy ? "保存中..." : "保存"}
        </button>
        {savedAt && !error && (
          <span className="text-[10px] text-emerald-600">✓ {savedAt}</span>
        )}
      </div>
      {error && (
        <p className="basis-full text-xs text-red-600">エラー: {error}</p>
      )}
    </div>
  );
}
