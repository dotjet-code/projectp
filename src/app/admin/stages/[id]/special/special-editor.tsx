"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SpecialEntry } from "@/lib/projectp/balance-special";

type Member = { id: string; name: string };

export function SpecialEditor({
  stageId,
  members,
  initialEntries,
  defaultDate,
}: {
  stageId: string;
  members: Member[];
  initialEntries: SpecialEntry[];
  defaultDate: string;
}) {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string>(members[0]?.id ?? "");
  const [liveDate, setLiveDate] = useState<string>(defaultDate);
  const [points, setPoints] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // メンバー名で表示するための index
  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.name ?? "(削除済み)";

  // 合計
  const totalByMember = new Map<string, number>();
  for (const e of initialEntries) {
    totalByMember.set(
      e.memberId,
      (totalByMember.get(e.memberId) ?? 0) + e.points
    );
  }

  async function onAdd() {
    setBusy(true);
    setError(null);
    try {
      const parsed = Number(points);
      if (Number.isNaN(parsed))
        throw new Error("ポイントは数値を入力してください");
      const res = await fetch(`/api/admin/stages/${stageId}/special`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          liveDate,
          points: parsed,
          note: note || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setPoints("");
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("このエントリを削除しますか？")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/stages/${stageId}/special?entryId=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
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
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-bold text-gray-700">エントリ追加</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              メンバー
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              ライブ開催日
            </label>
            <input
              type="date"
              value={liveDate}
              onChange={(e) => setLiveDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              ポイント
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
              メモ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 4/29 SPACE ODD"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600">エラー: {error}</p>}
        <button
          type="button"
          onClick={onAdd}
          disabled={busy || !memberId || !liveDate || !points}
          className="rounded-full bg-purple-600 hover:bg-purple-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
        >
          {busy ? "追加中..." : "+ 追加"}
        </button>
      </div>

      {/* Totals */}
      <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
        <h2 className="text-sm font-bold text-purple-900 mb-2">
          メンバー別合計
        </h2>
        {totalByMember.size === 0 ? (
          <p className="text-xs text-purple-700/70">エントリはまだありません。</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[...totalByMember.entries()].map(([mid, total]) => (
              <li
                key={mid}
                className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-1.5 text-xs"
              >
                <span className="font-bold text-foreground">
                  {memberName(mid)}
                </span>
                <span className="font-[family-name:var(--font-outfit)] font-extrabold text-purple-700">
                  +{total.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Entry list */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2">エントリ一覧</h2>
        {initialEntries.length === 0 ? (
          <p className="text-xs text-gray-500">エントリはまだありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {initialEntries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between p-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">
                    {memberName(e.memberId)}{" "}
                    <span className="font-normal text-gray-500">
                      · {e.liveDate}
                    </span>
                  </p>
                  {e.note && (
                    <p className="text-gray-500 truncate">{e.note}</p>
                  )}
                </div>
                <span className="font-[family-name:var(--font-outfit)] font-extrabold text-purple-700 mx-3">
                  +{e.points.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(e.id)}
                  disabled={busy}
                  className="rounded-full border border-red-300 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
