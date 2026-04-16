"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PublicMember = {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  role: "PLAYER" | "PIT";
};

type PublicStage = {
  id: string;
  name: string;
  title: string | null;
  subtitle: string | null;
  seriesNumber: number | null;
  stageNumber: number | null;
  startDate: string;
  endDate: string;
} | null;

type BetKey =
  | "fukusho"
  | "tansho"
  | "nirenpuku"
  | "nirentan"
  | "sanrenpuku"
  | "sanrentan";

type SlotSelection = (string | null)[];

type Bets = Record<BetKey, SlotSelection>;

type Prediction = {
  entryType: "normal" | "welcome";
  tansho: string[];
  fukusho: string[];
  nirenpuku: string[];
  nirentan: string[];
  sanrenpuku: string[];
  sanrentan: string[];
};

type SummarySlotTally = {
  positionIndex: number;
  rows: { memberId: string; count: number }[];
};

type Summary = {
  totalCount: number;
  bySlot: Record<BetKey, SummarySlotTally[]>;
} | null;

// =====================================================================
// 賭式の定義
// =====================================================================

type BetConfig = {
  key: BetKey;
  title: string;
  slotCount: 1 | 2 | 3;
  points: number;
  ordered: boolean;
  description: string;
  labels: string[]; // スロットラベル（順通り用）
};

const BETS: BetConfig[] = [
  {
    key: "fukusho",
    title: "複勝",
    slotCount: 1,
    points: 1,
    ordered: false,
    description: "3 着以内に入るメンバーを 1 名予想",
    labels: ["選択"],
  },
  {
    key: "tansho",
    title: "単勝",
    slotCount: 1,
    points: 2,
    ordered: true,
    description: "1 着のメンバーを 1 名予想",
    labels: ["1 着"],
  },
  {
    key: "nirenpuku",
    title: "二連複",
    slotCount: 2,
    points: 5,
    ordered: false,
    description: "1-2 着に入る 2 名を順不同で予想",
    labels: ["選択 A", "選択 B"],
  },
  {
    key: "nirentan",
    title: "二連単",
    slotCount: 2,
    points: 10,
    ordered: true,
    description: "1 着・2 着を順番通りに予想",
    labels: ["1 着", "2 着"],
  },
  {
    key: "sanrenpuku",
    title: "三連複",
    slotCount: 3,
    points: 15,
    ordered: false,
    description: "1-2-3 着に入る 3 名を順不同で予想",
    labels: ["選択 A", "選択 B", "選択 C"],
  },
  {
    key: "sanrentan",
    title: "三連単",
    slotCount: 3,
    points: 30,
    ordered: true,
    description: "1 着・2 着・3 着を順番通りに予想",
    labels: ["1 着", "2 着", "3 着"],
  },
];

const MAX_SCORE = BETS.reduce((s, b) => s + b.points, 0);

function emptyBets(): Bets {
  return {
    fukusho: [null],
    tansho: [null],
    nirenpuku: [null, null],
    nirentan: [null, null],
    sanrenpuku: [null, null, null],
    sanrentan: [null, null, null],
  };
}

// =====================================================================
// UI 部品
// =====================================================================

function SlotCard({
  member,
  label,
  onRemove,
}: {
  member: PublicMember | null;
  label: string;
  onRemove: () => void;
}) {
  if (!member) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 px-3 py-3 min-w-[84px]">
        <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-lg">
          ?
        </div>
        <span className="text-[9px] font-bold text-muted">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-primary/30 bg-[#ecfeff]/50 px-3 py-3 min-w-[84px]">
      <div className="relative">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover object-top shadow-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-gray-700 text-white text-[9px] shadow hover:bg-gray-900"
          aria-label="remove"
        >
          ×
        </button>
      </div>
      <span className="text-[9px] font-bold text-primary-dark">{label}</span>
      <span className="text-[10px] font-bold text-foreground truncate max-w-[72px]">
        {member.name}
      </span>
    </div>
  );
}

function MemberCandidate({
  member,
  selected,
  onSelect,
}: {
  member: PublicMember;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={selected}
      className={`flex flex-col items-center gap-1 rounded-xl p-1.5 w-[62px] shrink-0 transition-all ${
        selected
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/80 hover:shadow-sm cursor-pointer"
      }`}
    >
      <Image
        src={member.avatarUrl}
        alt={member.name}
        width={40}
        height={40}
        className="size-10 rounded-full object-cover object-top shadow-sm"
      />
      <p className="text-[9px] font-bold text-foreground text-center leading-tight truncate max-w-full">
        {member.name}
      </p>
    </button>
  );
}

function Countdown({ closeAt }: { closeAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const target = new Date(closeAt).getTime();
  const diff = target - now;
  if (diff <= 0) {
    return <span className="text-red-600 font-bold">締切済み</span>;
  }
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}日`);
  if (days > 0 || hours > 0) parts.push(`${hours}時間`);
  if (days === 0) parts.push(`${mins}分`);
  if (days === 0 && hours === 0) parts.push(`${secs}秒`);
  return <span>残り {parts.join(" ")}</span>;
}

function BetSection({
  config,
  candidates,
  selections,
  onSelect,
  onRemove,
  isLocked,
}: {
  config: BetConfig;
  candidates: PublicMember[];
  selections: SlotSelection;
  onSelect: (member: PublicMember) => void;
  onRemove: (index: number) => void;
  isLocked: boolean;
}) {
  const memberById = new Map(candidates.map((c) => [c.id, c]));
  const selectedIds = selections.filter((x): x is string => Boolean(x));

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-6">
      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-[family-name:var(--font-outfit)] text-base font-extrabold text-foreground tracking-tight">
            {config.title}
          </h2>
          <span className="text-[11px] font-bold text-primary-dark">
            +{config.points} pt
          </span>
        </div>
        <p className="text-[10px] text-muted mb-3">{config.description}</p>

        {isLocked && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-[10px] text-muted">
            <span>🔒</span>
            <span>締切済み</span>
          </div>
        )}

        <div
          className={`flex flex-wrap items-center justify-center gap-2 mb-4 ${
            isLocked ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {config.labels.map((label, i) => (
            <SlotCard
              key={i}
              member={(selections[i] && memberById.get(selections[i]!)) || null}
              label={label}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>

        <div
          className={`flex flex-wrap justify-center gap-1 ${
            isLocked ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {candidates.map((m) => (
            <MemberCandidate
              key={m.id}
              member={m}
              selected={selectedIds.includes(m.id)}
              onSelect={() => onSelect(m)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// Main
// =====================================================================

const DRAFT_KEY_PREFIX = "projectp.prediction_draft.";

function loadDraft(stageId: string): Bets | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY_PREFIX + stageId);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Partial<Bets>;
    const sane: Bets = {
      fukusho: Array.isArray(obj.fukusho) ? obj.fukusho.slice(0, 1) : [null],
      tansho: Array.isArray(obj.tansho) ? obj.tansho.slice(0, 1) : [null],
      nirenpuku: Array.isArray(obj.nirenpuku)
        ? obj.nirenpuku.slice(0, 2)
        : [null, null],
      nirentan: Array.isArray(obj.nirentan)
        ? obj.nirentan.slice(0, 2)
        : [null, null],
      sanrenpuku: Array.isArray(obj.sanrenpuku)
        ? obj.sanrenpuku.slice(0, 3)
        : [null, null, null],
      sanrentan: Array.isArray(obj.sanrentan)
        ? obj.sanrentan.slice(0, 3)
        : [null, null, null],
    };
    // 何かしら埋まっていれば有効
    const hasAny = Object.values(sane).some((arr) => arr.some((x) => x != null));
    return hasAny ? sane : null;
  } catch {
    return null;
  }
}

function saveDraft(stageId: string, bets: Bets) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DRAFT_KEY_PREFIX + stageId,
      JSON.stringify(bets)
    );
  } catch {
    // ignore
  }
}

function clearDraft(stageId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY_PREFIX + stageId);
  } catch {
    // ignore
  }
}

export function PredictionClient({
  members,
  stage,
}: {
  members: PublicMember[];
  stage: PublicStage;
}) {
  const [entryType, setEntryType] = useState<"normal" | "welcome">("normal");
  const [bets, setBets] = useState<Bets>(emptyBets());

  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<Summary>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [closeAt, setCloseAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const stageId = stage?.id ?? null;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/public/prediction", { cache: "no-store" });
        const j = await res.json();
        setTotalCount(j.totalCount ?? 0);
        setSummary(j.summary ?? null);
        setIsLoggedIn(Boolean(j.isLoggedIn));
        setIsClosed(Boolean(j.isClosed));
        setCloseAt(j.stage?.predictionsCloseAt ?? null);
        const p: Prediction | null = j.myPrediction;
        if (p) {
          // サーバーに既存予想がある場合はそれを優先(ドラフトより信頼できる)
          setEntryType(p.entryType);
          setBets({
            fukusho: [p.fukusho[0] ?? null],
            tansho: [p.tansho[0] ?? null],
            nirenpuku: [p.nirenpuku[0] ?? null, p.nirenpuku[1] ?? null],
            nirentan: [p.nirentan[0] ?? null, p.nirentan[1] ?? null],
            sanrenpuku: [
              p.sanrenpuku[0] ?? null,
              p.sanrenpuku[1] ?? null,
              p.sanrenpuku[2] ?? null,
            ],
            sanrentan: [
              p.sanrentan[0] ?? null,
              p.sanrentan[1] ?? null,
              p.sanrentan[2] ?? null,
            ],
          });
          // サーバーに保存されていれば localStorage の下書きは不要
          if (j.stage?.id) clearDraft(j.stage.id);
        } else if (j.stage?.id) {
          // サーバー無し → localStorage から復元を試みる
          const draft = loadDraft(j.stage.id);
          if (draft) {
            setBets(draft);
            setDraftRestored(true);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // bets が変化するたびに下書きを保存(ロード完了後のみ)
  useEffect(() => {
    if (!loaded || !stageId) return;
    const hasAny = Object.values(bets).some((arr) => arr.some((x) => x != null));
    if (hasAny) {
      saveDraft(stageId, bets);
    }
  }, [bets, loaded, stageId]);

  function makeSelect(key: BetKey) {
    return (member: PublicMember) => {
      setBets((prev) => {
        const arr = [...prev[key]];
        const nextSlot = arr.findIndex((s) => s === null);
        if (nextSlot === -1) return prev;
        // 同じ賭式内での重複選択を防止
        if (arr.includes(member.id)) return prev;
        arr[nextSlot] = member.id;
        return { ...prev, [key]: arr };
      });
    };
  }

  function makeRemove(key: BetKey) {
    return (index: number) => {
      setBets((prev) => {
        const arr = [...prev[key]];
        arr[index] = null;
        return { ...prev, [key]: arr };
      });
    };
  }

  const allFilled = BETS.every(
    (b) => bets[b.key].every(Boolean) && bets[b.key].length === b.slotCount
  );

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setFlash(null);
    try {
      const payload = {
        entryType,
        fukusho: bets.fukusho.filter(Boolean),
        tansho: bets.tansho.filter(Boolean),
        nirenpuku: bets.nirenpuku.filter(Boolean),
        nirentan: bets.nirentan.filter(Boolean),
        sanrenpuku: bets.sanrenpuku.filter(Boolean),
        sanrentan: bets.sanrentan.filter(Boolean),
      };
      const res = await fetch("/api/public/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setFlash("予想を提出しました ✓");
      // 提出完了したらドラフトは不要
      if (stageId) clearDraft(stageId);
      setDraftRestored(false);
      const g = await fetch("/api/public/prediction", { cache: "no-store" });
      if (g.ok) {
        const data = await g.json();
        setTotalCount(data.totalCount ?? 0);
        setSummary(data.summary ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!stage) {
    return (
      <section className="mx-auto max-w-[720px] px-4">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-3xl mb-3">⏳</p>
          <p className="text-sm text-gray-600">
            現在進行中のステージがありません。
            <br />
            次のステージが始まると予想投票が開けます。
          </p>
        </div>
      </section>
    );
  }

  const allMembers = members;

  return (
    <>
      {/* Stage info + entry type */}
      <section className="mx-auto max-w-[964px] px-4">
        <div className="rounded-2xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-r from-[rgba(236,254,255,0.8)] to-[rgba(240,249,255,0.8)] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-primary-dark">
              NOW PLAYING
            </p>
            <p className="text-sm font-bold text-foreground">
              {stage.title ?? stage.name}
              <span className="ml-2 text-xs text-muted">
                {stage.startDate} 〜 {stage.endDate}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEntryType("normal")}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                entryType === "normal"
                  ? "bg-primary-dark text-white border-primary-dark"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              通常エントリー
            </button>
            <button
              type="button"
              onClick={() => setEntryType("welcome")}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                entryType === "welcome"
                  ? "bg-live text-white border-live"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              🎁 初回限定
            </button>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted text-right">
          これまでの予想提出数: <b>{totalCount.toLocaleString()}</b>
        </p>
      </section>

      {/* Reward banner (unauth) */}
      {loaded && !isLoggedIn && (
        <section className="mx-auto max-w-[964px] px-4 mt-4">
          <a
            href="/fan/login"
            className="block rounded-xl border border-[rgba(255,208,120,0.6)] bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8] px-4 py-3 text-xs text-[#7a4a00] hover:shadow-sm transition-shadow"
          >
            🎁 <b>会員登録すると景品対象に</b> ── 的中するとライブ会場投票のボーナス票やチェキ券プレゼント。メールアドレスだけで登録できます →
          </a>
        </section>
      )}

      {/* Draft restored banner */}
      {loaded && draftRestored && (
        <section className="mx-auto max-w-[964px] px-4 mt-4">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            ✨ まだ予想は未提出です。
            {isLoggedIn
              ? " 下の「予想を提出する」ボタンを押して確定させてください。"
              : " 会員登録を完了してから提出ボタンを押してください。"}
          </div>
        </section>
      )}

      {/* Info banner */}
      <section className="mx-auto max-w-[964px] px-4 mt-4">
        <div className="rounded-xl border border-[rgba(206,250,254,0.5)] bg-white/70 px-4 py-3 text-xs text-muted">
          🏁 全 12 名から 6 種類の賭式を予想。最大スコア{" "}
          <b>{MAX_SCORE} pt</b> (複勝 1 / 単勝 2 / 二連複 5 / 二連単 10 / 三連複 15 / 三連単 30)。ファン会員限定。
        </div>
      </section>

      {/* Bet sections */}
      {BETS.map((b) => (
        <BetSection
          key={b.key}
          config={b}
          candidates={allMembers}
          selections={bets[b.key]}
          onSelect={makeSelect(b.key)}
          onRemove={makeRemove(b.key)}
          isLocked={isClosed}
        />
      ))}

      {/* Submit */}
      <section className="mx-auto max-w-[964px] px-4 mt-10 text-center">
        {error && <p className="mb-3 text-xs text-red-600">エラー: {error}</p>}
        {flash && <p className="mb-3 text-xs text-emerald-700">{flash}</p>}
        {isClosed ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-200 px-10 py-3.5 text-base font-bold text-gray-500">
            🔒 締切済み
          </div>
        ) : !loaded ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-10 py-3.5 text-base font-bold text-gray-400">
            読み込み中...
          </div>
        ) : !isLoggedIn ? (
          <a
            href="/fan/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444] px-10 py-3.5 text-base font-bold text-white shadow-lg hover:opacity-90 transition"
          >
            🎟️ 会員登録して予想する →
          </a>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !allFilled}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting
              ? "提出中..."
              : allFilled
              ? "予想を提出する →"
              : "全ての賭式を埋めてください"}
          </button>
        )}
        {closeAt && !isClosed && (
          <p className="mt-3 text-[11px] text-amber-700">
            ⏰ 締切: {new Date(closeAt).toLocaleString("ja-JP")} (
            <Countdown closeAt={closeAt} />)
          </p>
        )}
        <p className="mt-2 text-[10px] text-muted">
          {isLoggedIn
            ? "ファン会員限定: 1 ステージ 1 予想 / 何度でも上書き可 / 的中で景品対象"
            : "予想の提出にはファン会員ログインが必要です"}
        </p>
      </section>

      {/* Summary */}
      {summary && summary.totalCount > 0 && (
        <SummarySection summary={summary} members={members} />
      )}
    </>
  );
}

// =====================================================================
// Summary UI
// =====================================================================
function SummarySection({
  summary,
  members,
}: {
  summary: NonNullable<Summary>;
  members: PublicMember[];
}) {
  const memberById = new Map(members.map((m) => [m.id, m]));

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-14">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple to-[#c27aff]" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#7008e7] tracking-tight">
          📊 みんなの予想({summary.totalCount.toLocaleString()} 件)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BETS.map((b) => {
          const tallies = summary.bySlot[b.key] ?? [];
          return (
            <div
              key={b.key}
              className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm"
            >
              <h3 className="font-[family-name:var(--font-outfit)] text-sm font-extrabold mb-3 text-foreground">
                {b.title}{" "}
                <span className="text-[10px] font-bold text-primary-dark">
                  +{b.points}
                </span>
              </h3>
              <div className="space-y-3">
                {tallies.map((t) => {
                  const maxCount = Math.max(...t.rows.map((r) => r.count), 1);
                  const top = t.rows.slice(0, 3);
                  return (
                    <div key={t.positionIndex}>
                      <p className="text-[10px] font-bold text-muted mb-1">
                        {b.ordered ? b.labels[t.positionIndex] : "選出数"}
                      </p>
                      {top.length === 0 ? (
                        <p className="text-[11px] text-muted">—</p>
                      ) : (
                        <ul className="space-y-1">
                          {top.map((r) => {
                            const member = memberById.get(r.memberId);
                            const pct = (r.count / maxCount) * 100;
                            return (
                              <li
                                key={r.memberId}
                                className="flex items-center gap-2"
                              >
                                <span className="text-[11px] font-bold text-foreground w-20 truncate">
                                  {member?.name ?? "(不明)"}
                                </span>
                                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple to-[#c27aff]"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-[family-name:var(--font-outfit)] font-bold text-[#7008e7] w-8 text-right">
                                  {r.count}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
