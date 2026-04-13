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

type SlotSelection = (string | null)[];

type Prediction = {
  entryType: "normal" | "welcome";
  playerWin: string[];
  playerTri: string[];
  pitWin: string[];
  pitTri: string[];
};

type SummarySlotTally = {
  positionIndex: number;
  rows: { memberId: string; count: number }[];
};

type Summary = {
  totalCount: number;
  bySlot: {
    playerWin: SummarySlotTally[];
    playerTri: SummarySlotTally[];
    pitWin: SummarySlotTally[];
    pitTri: SummarySlotTally[];
  };
} | null;

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
      <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 px-3 sm:px-6 py-3 sm:py-4 min-w-[90px] sm:min-w-[120px]">
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xl">
          ?
        </div>
        <span className="text-[10px] font-bold text-muted">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-primary/30 bg-[#ecfeff]/50 px-3 sm:px-6 py-3 sm:py-4 min-w-[90px] sm:min-w-[120px]">
      <div className="relative">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={48}
          height={48}
          className="size-12 rounded-full object-cover object-top shadow-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gray-700 text-white text-[10px] shadow hover:bg-gray-900"
          aria-label="remove"
        >
          ×
        </button>
      </div>
      <span className="text-[10px] font-bold text-primary-dark">{label}</span>
      <span className="text-[11px] font-bold text-foreground truncate max-w-[80px]">
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
      className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-all ${
        selected
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/80 hover:shadow-sm cursor-pointer"
      }`}
    >
      <Image
        src={member.avatarUrl}
        alt={member.name}
        width={44}
        height={44}
        className="size-11 rounded-full object-cover object-top shadow-sm"
      />
      <p className="text-[10px] font-bold text-foreground text-center leading-tight truncate max-w-full">
        {member.name}
      </p>
    </button>
  );
}

function PredictionSection({
  title,
  titleColor,
  slotCount,
  candidates,
  selections,
  onSelect,
  onRemove,
  isLocked,
}: {
  title: string;
  titleColor: string;
  slotCount: 2 | 3;
  candidates: PublicMember[];
  selections: SlotSelection;
  onSelect: (member: PublicMember) => void;
  onRemove: (index: number) => void;
  isLocked: boolean;
}) {
  const slotLabels = slotCount === 2 ? ["1着", "2着"] : ["1着", "2着", "3着"];
  const memberById = new Map(candidates.map((c) => [c.id, c]));
  const selectedIds = selections.filter((x): x is string => Boolean(x));

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-8">
      <h2
        className="font-[family-name:var(--font-outfit)] text-base font-extrabold tracking-tight mb-3"
        style={{ color: titleColor }}
      >
        {title}
      </h2>

      <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
        {isLocked && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-xs text-muted">
            <span>🔒</span>
            <span>締切済み — この予想は変更できません</span>
          </div>
        )}

        <div
          className={`flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-5 ${
            isLocked ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          {slotLabels.map((label, i) => (
            <SlotCard
              key={i}
              member={(selections[i] && memberById.get(selections[i]!)) || null}
              label={label}
              onRemove={() => onRemove(i)}
            />
          ))}
        </div>

        <div
          className={`grid grid-cols-4 sm:grid-cols-6 gap-1 ${
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

        <p className="mt-4 text-center text-xs text-muted">
          {slotCount === 2 ? "2名を選んでください" : "3名を選んでください"}
        </p>
      </div>
    </section>
  );
}

export function PredictionClient({
  members,
  stage,
}: {
  members: PublicMember[];
  stage: PublicStage;
}) {
  const playerMembers = members.filter((m) => m.role === "PLAYER");
  const pitMembers = members.filter((m) => m.role === "PIT");

  const [entryType, setEntryType] = useState<"normal" | "welcome">("normal");
  const [playerWin, setPlayerWin] = useState<SlotSelection>([null, null]);
  const [playerTri, setPlayerTri] = useState<SlotSelection>([null, null, null]);
  const [pitWin, setPitWin] = useState<SlotSelection>([null, null]);
  const [pitTri, setPitTri] = useState<SlotSelection>([null, null, null]);

  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<Summary>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 初期ロード：既存予想 + 提出数 + 集計
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/public/prediction", {
          cache: "no-store",
        });
        const j = await res.json();
        setTotalCount(j.totalCount ?? 0);
        setSummary(j.summary ?? null);
        setIsLoggedIn(Boolean(j.isLoggedIn));
        const p: Prediction | null = j.myPrediction;
        if (p) {
          setEntryType(p.entryType);
          setPlayerWin([p.playerWin[0] ?? null, p.playerWin[1] ?? null]);
          setPlayerTri([
            p.playerTri[0] ?? null,
            p.playerTri[1] ?? null,
            p.playerTri[2] ?? null,
          ]);
          setPitWin([p.pitWin[0] ?? null, p.pitWin[1] ?? null]);
          setPitTri([
            p.pitTri[0] ?? null,
            p.pitTri[1] ?? null,
            p.pitTri[2] ?? null,
          ]);
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  function makeSelect(
    selections: SlotSelection,
    setSelections: (s: SlotSelection) => void
  ) {
    return (member: PublicMember) => {
      const nextSlot = selections.findIndex((s) => s === null);
      if (nextSlot === -1) return;
      const next = [...selections];
      next[nextSlot] = member.id;
      setSelections(next);
    };
  }

  function makeRemove(
    selections: SlotSelection,
    setSelections: (s: SlotSelection) => void
  ) {
    return (index: number) => {
      const next = [...selections];
      next[index] = null;
      setSelections(next);
    };
  }

  const allFilled =
    playerWin.every(Boolean) &&
    playerTri.every(Boolean) &&
    pitWin.every(Boolean) &&
    pitTri.every(Boolean);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setFlash(null);
    try {
      const res = await fetch("/api/public/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryType,
          playerWin: playerWin.filter(Boolean),
          playerTri: playerTri.filter(Boolean),
          pitWin: pitWin.filter(Boolean),
          pitTri: pitTri.filter(Boolean),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setFlash("予想を提出しました ✓");
      // 再フェッチして総数・集計を更新
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

      {/* Reward banner（未ログイン時のみ） */}
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

      {/* Info banner */}
      <section className="mx-auto max-w-[964px] px-4 mt-4">
        <div className="rounded-xl border border-[rgba(206,250,254,0.5)] bg-white/70 px-4 py-3 text-xs text-muted">
          🏁 PLAYER 6名 / PIT 6名 から <b>連単2名</b> と <b>3連単3名</b> を
          選んで予想してください。全スロットを埋めると提出できます。
        </div>
      </section>

      {/* PLAYER */}
      <PredictionSection
        title="PLAYER 連単 (1着・2着)"
        titleColor="#007595"
        slotCount={2}
        candidates={playerMembers}
        selections={playerWin}
        onSelect={makeSelect(playerWin, setPlayerWin)}
        onRemove={makeRemove(playerWin, setPlayerWin)}
        isLocked={false}
      />
      <PredictionSection
        title="PLAYER 3連単 (1着・2着・3着)"
        titleColor="#007595"
        slotCount={3}
        candidates={playerMembers}
        selections={playerTri}
        onSelect={makeSelect(playerTri, setPlayerTri)}
        onRemove={makeRemove(playerTri, setPlayerTri)}
        isLocked={false}
      />

      {/* PIT */}
      <PredictionSection
        title="PIT 連単 (1着・2着)"
        titleColor="#bb4d00"
        slotCount={2}
        candidates={pitMembers}
        selections={pitWin}
        onSelect={makeSelect(pitWin, setPitWin)}
        onRemove={makeRemove(pitWin, setPitWin)}
        isLocked={false}
      />
      <PredictionSection
        title="PIT 3連単 (1着・2着・3着)"
        titleColor="#bb4d00"
        slotCount={3}
        candidates={pitMembers}
        selections={pitTri}
        onSelect={makeSelect(pitTri, setPitTri)}
        onRemove={makeRemove(pitTri, setPitTri)}
        isLocked={false}
      />

      {/* Submit */}
      <section className="mx-auto max-w-[964px] px-4 mt-10 text-center">
        {error && (
          <p className="mb-3 text-xs text-red-600">エラー: {error}</p>
        )}
        {flash && (
          <p className="mb-3 text-xs text-emerald-700">{flash}</p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!loaded || submitting || !allFilled}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? "提出中..." : allFilled ? "予想を提出する →" : "全て埋めてください"}
        </button>
        <p className="mt-2 text-[10px] text-muted">
          ※ 匿名Cookieで1Stage1予想 / 何度でも上書き可
        </p>
      </section>

      {/* Summary: みんなの予想 */}
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

  const slotGroups: {
    key: "playerWin" | "playerTri" | "pitWin" | "pitTri";
    title: string;
    color: string;
    labels: string[];
  }[] = [
    {
      key: "playerWin",
      title: "PLAYER 連単",
      color: "#007595",
      labels: ["1着", "2着"],
    },
    {
      key: "playerTri",
      title: "PLAYER 3連単",
      color: "#007595",
      labels: ["1着", "2着", "3着"],
    },
    {
      key: "pitWin",
      title: "PIT 連単",
      color: "#bb4d00",
      labels: ["1着", "2着"],
    },
    {
      key: "pitTri",
      title: "PIT 3連単",
      color: "#bb4d00",
      labels: ["1着", "2着", "3着"],
    },
  ];

  return (
    <section className="mx-auto max-w-[964px] px-4 mt-14">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple to-[#c27aff]" />
        <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#7008e7] tracking-tight">
          📊 みんなの予想（{summary.totalCount.toLocaleString()} 件）
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slotGroups.map((g) => {
          const tallies = summary.bySlot[g.key];
          return (
            <div
              key={g.key}
              className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm"
            >
              <h3
                className="font-[family-name:var(--font-outfit)] text-sm font-extrabold mb-3"
                style={{ color: g.color }}
              >
                {g.title}
              </h3>

              <div className="space-y-3">
                {tallies.map((t) => {
                  const maxCount = Math.max(
                    ...t.rows.map((r) => r.count),
                    1
                  );
                  const top = t.rows.slice(0, 3);
                  return (
                    <div key={t.positionIndex}>
                      <p className="text-[10px] font-bold text-muted mb-1">
                        {g.labels[t.positionIndex]}
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
