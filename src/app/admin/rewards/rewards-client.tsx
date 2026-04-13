"use client";

import { useEffect, useState } from "react";

type StageOption = {
  id: string;
  name: string;
  title: string | null;
  startDate: string;
  endDate: string;
};

type RewardRow = {
  id: number;
  userId: string;
  rewardType: "live_vote_bonus" | "cheki_free";
  rewardCode: string;
  totalScore: number | null;
  issuedAt: string;
  redeemedAt: string | null;
};

const REWARD_TYPES: { value: "live_vote_bonus" | "cheki_free"; label: string }[] = [
  { value: "live_vote_bonus", label: "ライブ会場投票ボーナス票" },
  { value: "cheki_free", label: "チェキ券1枚無料" },
];

export function RewardsClient({ stages }: { stages: StageOption[] }) {
  const [tab, setTab] = useState<"issue" | "redeem">("issue");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("issue")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
            tab === "issue" ? "bg-black text-white" : "bg-white border border-gray-300"
          }`}
        >
          発行
        </button>
        <button
          type="button"
          onClick={() => setTab("redeem")}
          className={`rounded-full px-4 py-1.5 text-xs font-bold ${
            tab === "redeem" ? "bg-black text-white" : "bg-white border border-gray-300"
          }`}
        >
          会場消込
        </button>
      </div>

      {tab === "issue" ? <IssueTab stages={stages} /> : <RedeemTab />}
    </div>
  );
}

function IssueTab({ stages }: { stages: StageOption[] }) {
  const [periodId, setPeriodId] = useState(stages[0]?.id ?? "");
  const [rewardType, setRewardType] =
    useState<"live_vote_bonus" | "cheki_free">("live_vote_bonus");
  const [minScore, setMinScore] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RewardRow[]>([]);

  async function loadRewards(pid: string) {
    if (!pid) return;
    const res = await fetch(`/api/admin/rewards?periodId=${pid}`);
    if (res.ok) {
      const j = await res.json();
      setRewards(j.rewards ?? []);
    }
  }

  useEffect(() => {
    if (periodId) loadRewards(periodId);
  }, [periodId]);

  async function onIssue() {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/rewards/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId, rewardType, minScore }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setResult(`発行: ${j.issued} 件 / スキップ: ${j.skipped} 件`);
      await loadRewards(periodId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-[10px] font-semibold text-muted">Stage</span>
          <select
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title ?? s.name} ({s.startDate}〜{s.endDate})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold text-muted">景品種別</span>
          <select
            value={rewardType}
            onChange={(e) =>
              setRewardType(e.target.value as "live_vote_bonus" | "cheki_free")
            }
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            {REWARD_TYPES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold text-muted">最低スコア</span>
          <input
            type="number"
            min={0}
            max={10}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onIssue}
          disabled={submitting || !periodId}
          className="rounded-full bg-black text-white px-5 py-2 text-xs font-bold disabled:opacity-40"
        >
          {submitting ? "発行中..." : "対象者へ発行"}
        </button>
        {result && <span className="text-xs text-emerald-700">{result}</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted mb-2">
          この Stage の発行済み景品 ({rewards.length})
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-2 py-1.5">コード</th>
                <th className="px-2 py-1.5">種別</th>
                <th className="px-2 py-1.5">スコア</th>
                <th className="px-2 py-1.5">発行</th>
                <th className="px-2 py-1.5">消込</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-2 py-1.5 font-mono">{r.rewardCode}</td>
                  <td className="px-2 py-1.5">
                    {r.rewardType === "cheki_free" ? "チェキ" : "投票"}
                  </td>
                  <td className="px-2 py-1.5">{r.totalScore ?? "-"}</td>
                  <td className="px-2 py-1.5 text-muted">
                    {new Date(r.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-1.5">
                    {r.redeemedAt ? (
                      <span className="text-emerald-700">✓</span>
                    ) : (
                      <span className="text-gray-400">未</span>
                    )}
                  </td>
                </tr>
              ))}
              {rewards.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-3 text-center text-muted">
                    まだ発行されていません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RedeemTab() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<
    { code: string; status: "ok" | "ng"; message: string }[]
  >([]);

  async function onRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await res.json();
      if (res.ok) {
        const label =
          j.reward.rewardType === "cheki_free"
            ? "チェキ無料券"
            : "投票ボーナス";
        setHistory((h) => [
          { code, status: "ok", message: `消込OK: ${label}` },
          ...h,
        ]);
      } else {
        const msg =
          j.error === "not_found"
            ? "コードが見つかりません"
            : j.error === "already_redeemed"
            ? "既に消込済"
            : `エラー: ${j.error}`;
        setHistory((h) => [{ code, status: "ng", message: msg }, ...h]);
      }
    } finally {
      setSubmitting(false);
      setCode("");
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
      <form onSubmit={onRedeem} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
          placeholder="景品コードを入力 / スキャン"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm font-mono uppercase tracking-wider"
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className="rounded-full bg-black text-white px-5 py-2 text-xs font-bold disabled:opacity-40"
        >
          消込
        </button>
      </form>
      <p className="text-[10px] text-muted">
        ※ USB QRスキャナはキーボード入力として動作するので、フォーカスを当てておくだけで連続消込できます。
      </p>

      <div>
        <p className="text-xs font-semibold text-muted mb-2">直近の消込履歴</p>
        <ul className="space-y-1">
          {history.map((h, i) => (
            <li
              key={i}
              className={`text-xs flex items-center gap-2 ${
                h.status === "ok" ? "text-emerald-700" : "text-red-600"
              }`}
            >
              <span className="font-mono">{h.code}</span>
              <span>—</span>
              <span>{h.message}</span>
            </li>
          ))}
          {history.length === 0 && (
            <li className="text-xs text-muted">まだ履歴はありません</li>
          )}
        </ul>
      </div>
    </div>
  );
}
