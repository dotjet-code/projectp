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
  expiresAt: string | null;
  displayName: string | null;
  email: string | null;
};

const REWARD_TYPES: { value: "live_vote_bonus" | "cheki_free"; label: string }[] = [
  { value: "live_vote_bonus", label: "ライブ会場投票ボーナス票" },
  { value: "cheki_free", label: "チェキ券1枚無料" },
];

export function RewardsClient({
  stages,
  initialPeriodId,
}: {
  stages: StageOption[];
  initialPeriodId?: string | null;
}) {
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

      {tab === "issue" ? (
        <IssueTab stages={stages} initialPeriodId={initialPeriodId ?? null} />
      ) : (
        <RedeemTab />
      )}
    </div>
  );
}

function IssueTab({
  stages,
  initialPeriodId,
}: {
  stages: StageOption[];
  initialPeriodId: string | null;
}) {
  const [periodId, setPeriodId] = useState(
    initialPeriodId ?? stages[0]?.id ?? ""
  );
  const [rewardType, setRewardType] =
    useState<"live_vote_bonus" | "cheki_free">("live_vote_bonus");
  const [minScore, setMinScore] = useState(30);
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [preview, setPreview] = useState<{
    eligible: number;
    alreadyIssued: number;
    willIssue: number;
    maxScore: number | null;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  // プレビュー: パラメータ変化を debounce して呼び出し
  useEffect(() => {
    if (!periodId) {
      setPreview(null);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const qs = new URLSearchParams({
          periodId,
          rewardType,
          minScore: String(minScore),
        });
        const res = await fetch(`/api/admin/rewards/preview?${qs}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const j = await res.json();
          setPreview(j);
        }
      } catch {
        // ignore (abort 含む)
      } finally {
        setPreviewLoading(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
  }, [periodId, rewardType, minScore]);

  async function onIssue() {
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      // 日付入力 "YYYY-MM-DD" をそのローカル日の 23:59:59 に変換
      let expiresAtIso: string | null = null;
      if (expiresAt) {
        const d = new Date(`${expiresAt}T23:59:59`);
        if (!isNaN(d.getTime())) expiresAtIso = d.toISOString();
      }

      const res = await fetch("/api/admin/rewards/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId,
          rewardType,
          minScore,
          expiresAt: expiresAtIso,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setResult(`発行: ${j.issued} 件 / スキップ: ${j.skipped} 件`);
      await loadRewards(periodId);
      // プレビューも更新 (alreadyIssued が増えるため)
      try {
        const qs = new URLSearchParams({
          periodId,
          rewardType,
          minScore: String(minScore),
        });
        const pr = await fetch(`/api/admin/rewards/preview?${qs}`);
        if (pr.ok) setPreview(await pr.json());
      } catch {
        // ignore
      }
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
          <span className="text-[10px] font-semibold text-muted">
            最低スコア (0〜63)
          </span>
          <input
            type="number"
            min={0}
            max={63}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {/* プリセット */}
      <div className="flex flex-wrap gap-1.5 -mt-1">
        <span className="text-[10px] text-muted self-center mr-1">
          目安:
        </span>
        {[
          { label: "完全的中", score: 63, tip: "全 6 賭式的中 = 特別景品" },
          { label: "三連単的中", score: 30, tip: "三連単を当てた人" },
          { label: "上位", score: 20, tip: "三連複+α 相当" },
          { label: "中位", score: 10, tip: "二連単以上の的中" },
          { label: "参加賞", score: 3, tip: "単勝か複勝以上" },
        ].map((p) => (
          <button
            key={p.score}
            type="button"
            title={p.tip}
            onClick={() => setMinScore(p.score)}
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
              minScore === p.score
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {p.label} ({p.score}+)
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-[10px] font-semibold text-muted">
          有効期限（任意 — ライブ当日の日付を指定）
        </span>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-1 w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      {/* プレビュー */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs">
        <p className="text-[10px] font-bold text-muted mb-1">プレビュー</p>
        {!preview ? (
          <p className="text-muted">
            {previewLoading ? "計算中..." : "Stage を選択してください"}
          </p>
        ) : (
          <div className="flex items-baseline gap-4 flex-wrap">
            <span>
              この条件で発行:{" "}
              <b
                className={
                  preview.willIssue > 0
                    ? "text-emerald-700 text-base"
                    : "text-gray-500 text-base"
                }
              >
                {preview.willIssue} 人
              </b>
            </span>
            <span className="text-muted">
              該当: {preview.eligible} / 既発行: {preview.alreadyIssued}
            </span>
            <span className="text-muted">
              最高スコア:{" "}
              <b className="text-foreground">
                {preview.maxScore ?? "—"}
              </b>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onIssue}
          disabled={
            submitting || !periodId || (preview !== null && preview.willIssue === 0)
          }
          className="rounded-full bg-black text-white px-5 py-2 text-xs font-bold disabled:opacity-40"
        >
          {submitting
            ? "発行中..."
            : preview && preview.willIssue > 0
            ? `${preview.willIssue} 人へ発行`
            : "対象者へ発行"}
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
                <th className="px-2 py-1.5">ファン</th>
                <th className="px-2 py-1.5">種別</th>
                <th className="px-2 py-1.5">スコア</th>
                <th className="px-2 py-1.5">発行</th>
                <th className="px-2 py-1.5">期限</th>
                <th className="px-2 py-1.5">消込</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => {
                const expired =
                  r.expiresAt && new Date(r.expiresAt).getTime() < Date.now();
                return (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 font-mono">{r.rewardCode}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-foreground">
                          {r.displayName ?? "(名無し)"}
                        </span>
                        <span className="text-[10px] text-muted">
                          {r.email ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      {r.rewardType === "cheki_free" ? "チェキ" : "投票"}
                    </td>
                    <td className="px-2 py-1.5">{r.totalScore ?? "-"}</td>
                    <td className="px-2 py-1.5 text-muted">
                      {new Date(r.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1.5 text-muted">
                      {r.expiresAt
                        ? new Date(r.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5">
                      {r.redeemedAt ? (
                        <span className="text-emerald-700">✓</span>
                      ) : expired ? (
                        <span className="text-red-600">期限切れ</span>
                      ) : (
                        <span className="text-gray-400">未</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rewards.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-3 text-center text-muted">
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

type RedeemHistoryEntry = {
  code: string;
  status: "ok" | "ng";
  message: string;
  fan?: {
    displayName: string | null;
    email: string | null;
  };
};

function RedeemTab() {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<RedeemHistoryEntry[]>([]);

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
          {
            code,
            status: "ok",
            message: `消込OK: ${label}`,
            fan: {
              displayName: j.reward.displayName ?? null,
              email: j.reward.email ?? null,
            },
          },
          ...h,
        ]);
      } else {
        const msg =
          j.error === "not_found"
            ? "コードが見つかりません"
            : j.error === "already_redeemed"
            ? "既に消込済"
            : j.error === "expired"
            ? "有効期限切れ"
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
        <ul className="space-y-1.5">
          {history.map((h, i) => (
            <li
              key={i}
              className={`text-xs rounded-lg px-3 py-2 border ${
                h.status === "ok"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-bold">{h.code}</span>
                <span className="text-[10px]">—</span>
                <span className="font-bold">{h.message}</span>
              </div>
              {h.fan && (
                <div className="mt-0.5 text-[11px] flex items-baseline gap-2">
                  <span className="font-bold">
                    {h.fan.displayName ?? "(名無し)"}
                  </span>
                  <span className="text-muted">{h.fan.email}</span>
                </div>
              )}
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
