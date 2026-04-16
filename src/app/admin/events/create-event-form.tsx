"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BonusTier = { minScore: number; multiplier: number };

export function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [baseTickets, setBaseTickets] = useState("3");
  const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([
    { minScore: 30, multiplier: 2 },
    { minScore: 50, multiplier: 3 },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTier(idx: number, field: keyof BonusTier, val: string) {
    setBonusTiers((prev) =>
      prev.map((t, i) =>
        i === idx ? { ...t, [field]: Math.max(0, Number(val) || 0) } : t
      )
    );
  }
  function addTier() {
    setBonusTiers((prev) => [...prev, { minScore: 0, multiplier: 2 }]);
  }
  function removeTier(idx: number) {
    setBonusTiers((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          eventDate,
          venue: venue || null,
          baseTickets: Number(baseTickets) || 3,
          bonusTiers: bonusTiers.filter((t) => t.minScore > 0 && t.multiplier > 1),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setTitle("");
      setEventDate("");
      setVenue("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            イベント名 *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="4/29 SPACE ODD お披露目ライブ"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            開催日 *
          </label>
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            会場
          </label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="SPACE ODD"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            基本投票数
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={baseTickets}
            onChange={(e) => setBaseTickets(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* ボーナス段階 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-gray-700">
            🎯 予想ボーナス段階
          </label>
          <button
            type="button"
            onClick={addTier}
            className="text-[10px] text-primary-dark font-bold"
          >
            + 段階を追加
          </button>
        </div>
        <p className="text-[10px] text-muted mb-2">
          ファン会員の予想通算スコアに応じて投票数が倍増。基本 {baseTickets || 3}{" "}
          票 × 倍率。
        </p>
        {bonusTiers.length === 0 ? (
          <p className="text-[10px] text-muted">
            ボーナスなし（全員同じ投票数）
          </p>
        ) : (
          <div className="space-y-1.5">
            {bonusTiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={t.minScore}
                  onChange={(e) => updateTier(i, "minScore", e.target.value)}
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="text-[10px] text-muted">pt 以上 →</span>
                <input
                  type="number"
                  min={2}
                  value={t.multiplier}
                  onChange={(e) => updateTier(i, "multiplier", e.target.value)}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <span className="text-[10px] text-muted">
                  倍 ({(Number(baseTickets) || 3) * t.multiplier} 票)
                </span>
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="text-red-500 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy || !title || !eventDate}
        className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
      >
        {busy ? "作成中..." : "イベントを作成"}
      </button>
    </form>
  );
}
