"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShuyakuVoteButton } from "@/components/shuyaku-vote-button";
import { TornDivider } from "@/components/torn-divider";

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
  shortTitle: string;
  slotCount: 1 | 2 | 3;
  points: number;
  ordered: boolean;
  description: string;
  labels: string[];
};

const BETS: BetConfig[] = [
  {
    key: "fukusho",
    title: "複勝",
    shortTitle: "複",
    slotCount: 1,
    points: 1,
    ordered: false,
    description: "3 着以内に入る者を 1 名指名。",
    labels: ["指名"],
  },
  {
    key: "tansho",
    title: "単勝",
    shortTitle: "単",
    slotCount: 1,
    points: 2,
    ordered: true,
    description: "1 着 1 点読み。",
    labels: ["1 着"],
  },
  {
    key: "nirenpuku",
    title: "二連複",
    shortTitle: "二複",
    slotCount: 2,
    points: 5,
    ordered: false,
    description: "1-2 着の 2 名を順不同で。",
    labels: ["指名 A", "指名 B"],
  },
  {
    key: "nirentan",
    title: "二連単",
    shortTitle: "二単",
    slotCount: 2,
    points: 10,
    ordered: true,
    description: "1 着・2 着を着順通りに。",
    labels: ["1 着", "2 着"],
  },
  {
    key: "sanrenpuku",
    title: "三連複",
    shortTitle: "三複",
    slotCount: 3,
    points: 15,
    ordered: false,
    description: "1-2-3 着の 3 名を順不同で。",
    labels: ["指名 A", "指名 B", "指名 C"],
  },
  {
    key: "sanrentan",
    title: "三連単",
    shortTitle: "三単",
    slotCount: 3,
    points: 30,
    ordered: true,
    description: "1 着・2 着・3 着を着順通りに。本命勝負。",
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
// 共通スタイル部品
// =====================================================================

function PaperCard({
  children,
  className = "",
  rotation = 0,
}: {
  children: React.ReactNode;
  className?: string;
  rotation?: number;
}) {
  return (
    <div
      className={`relative bg-[#F5F1E8] text-[#111] shadow-[6px_6px_0_rgba(17,17,17,0.16)] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(17,17,17,0.10) 0.6px, transparent 1px)",
        backgroundSize: "5px 5px",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  accent = "#D41E28",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="inline-block w-2 h-2" style={{ backgroundColor: accent }} />
      <p
        className="text-[10px] md:text-xs font-black tracking-[0.32em]"
        style={{ fontFamily: "var(--font-outfit)", color: accent }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-2xl md:text-3xl font-black leading-none text-[#111]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {title}
      </h2>
      <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
    </div>
  );
}

// =====================================================================
// 出馬表 (Starter Roster) — メンバー一覧 + 主役指名ボタン
// =====================================================================

function StarterRoster({ members }: { members: PublicMember[] }) {
  return (
    <PaperCard className="px-5 py-6 md:px-7 md:py-8">
      <SectionHeading eyebrow="STARTERS" title="出馬表" />
      <p
        className="text-xs md:text-sm leading-relaxed text-[#4A5060] mb-5"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        本日の出走 12 名。サイコロを振って「この子を主役に」と
        <span className="text-[#D41E28] font-black">即時投票</span>
        できる。投票数は別枠で「主役」スコアに反映される。
        <span className="ml-1 text-[#4A5060]/80">（同じ人には 1 日 1 回まで）</span>
      </p>

      {/* 二重罫線 */}
      <div className="border-t-[3px] border-b border-[#111] mb-4" />

      <ul className="divide-y divide-[#111]/15">
        {members.map((m, i) => (
          <li
            key={m.id}
            className="group flex items-center gap-3 md:gap-4 py-2.5 md:py-3"
          >
            {/* ゼッケン */}
            <div
              className="shrink-0 w-9 h-9 flex items-center justify-center bg-white border border-[#111] tabular-nums"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <span className="text-sm font-black text-[#111]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {/* アバター */}
            <div className="shrink-0 relative w-12 h-12 md:w-14 md:h-14 overflow-hidden border border-[#111]/40">
              <Image
                src={m.avatarUrl}
                alt=""
                width={56}
                height={56}
                className="w-full h-full object-cover md:grayscale md:contrast-125 md:group-hover:grayscale-0 md:group-hover:contrast-100 transition-[filter] duration-300"
                style={{ objectPosition: "50% 18%" }}
              />
            </div>

            {/* 名前 + ロール */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm md:text-base font-bold text-[#111] truncate leading-tight"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {m.name}
              </p>
              <span
                className={`inline-block mt-0.5 text-[9px] font-black tracking-wider px-1.5 py-0.5 ${
                  m.role === "PLAYER"
                    ? "bg-[#D41E28] text-white"
                    : "bg-[#4A5060] text-white"
                }`}
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {m.role}
              </span>
            </div>

            {/* 主役指名ボタン: モバイルはアイコンのみ、デスクトップはフルサイズ */}
            <div className="shrink-0 w-44 hidden md:block">
              <ShuyakuVoteButton
                memberId={m.id}
                memberName={m.name}
                size="sm"
                showRule={false}
                fullWidth
              />
            </div>
            <div className="shrink-0 md:hidden">
              <ShuyakuVoteButton
                memberId={m.id}
                memberName={m.name}
                size="sm"
                showRule={false}
                compact
              />
            </div>
          </li>
        ))}
      </ul>
    </PaperCard>
  );
}

// =====================================================================
// 馬券スロット & 候補チップ
// =====================================================================

function TicketSlot({
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
      <div className="flex flex-col items-center gap-1.5 border-2 border-dashed border-[#111]/30 bg-white/40 px-3 py-3 min-w-[88px]">
        <div className="flex w-10 h-10 items-center justify-center bg-[#F5F1E8] border border-[#111]/30 text-[#4A5060] text-base font-black"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          ?
        </div>
        <span
          className="text-[10px] font-black tracking-wider text-[#4A5060]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {label}
        </span>
      </div>
    );
  }
  return (
    <div className="relative flex flex-col items-center gap-1.5 bg-[#FFE600] border-2 border-[#111] px-3 py-3 min-w-[88px] shadow-[3px_3px_0_rgba(17,17,17,0.22)]">
      <div className="relative">
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={40}
          height={40}
          className="w-10 h-10 object-cover object-top border border-[#111]"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 flex w-5 h-5 items-center justify-center bg-[#111] text-white text-[10px] font-black hover:bg-[#D41E28]"
          aria-label="remove"
        >
          ×
        </button>
      </div>
      <span
        className="text-[10px] font-black tracking-wider text-[#111]"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {label}
      </span>
      <span
        className="text-[11px] font-bold text-[#111] truncate max-w-[72px]"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {member.name}
      </span>
    </div>
  );
}

function CandidateChip({
  member,
  index,
  selected,
  onSelect,
}: {
  member: PublicMember;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={selected}
      className={`group flex flex-col items-center gap-1 p-1.5 w-[68px] shrink-0 transition-all border ${
        selected
          ? "opacity-30 cursor-not-allowed border-transparent"
          : "border-transparent hover:bg-white hover:border-[#111] cursor-pointer"
      }`}
    >
      {/* ゼッケン番号 */}
      <span
        className="text-[10px] font-black tracking-wider text-[#4A5060] tabular-nums"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <Image
        src={member.avatarUrl}
        alt={member.name}
        width={42}
        height={42}
        className="w-[42px] h-[42px] object-cover border border-[#111]/40 md:grayscale md:contrast-125 md:group-hover:grayscale-0 md:group-hover:contrast-100 transition-[filter] duration-300"
        style={{ objectPosition: "50% 18%" }}
      />
      <p
        className="text-[10px] font-bold text-[#111] text-center leading-tight truncate max-w-full"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {member.name}
      </p>
    </button>
  );
}

// =====================================================================
// カウントダウン
// =====================================================================

function Countdown({ closeAt }: { closeAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const target = new Date(closeAt).getTime();
  const diff = target - now;
  if (diff <= 0) {
    return <span className="text-[#D41E28] font-black">締切済み</span>;
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
  return <span className="tabular-nums">残り {parts.join(" ")}</span>;
}

// =====================================================================
// 賭式パネル (BetSection)
// =====================================================================

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
    <PaperCard className="px-5 py-6 md:px-7 md:py-7">
      {/* ヘッダー */}
      <div className="flex items-end justify-between mb-1">
        <div className="flex items-baseline gap-3">
          <h3
            className="text-3xl md:text-4xl font-black leading-none text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {config.title}
          </h3>
          <span
            className="inline-flex items-baseline gap-1 px-2 py-0.5 bg-[#111] text-[#FFE600]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <span className="text-[10px] font-black tracking-[0.2em]">PAY</span>
            <span className="text-base font-black tabular-nums">+{config.points}</span>
            <span className="text-[10px]">pt</span>
          </span>
        </div>
        <span
          className="text-[10px] font-bold tracking-[0.25em] text-[#4A5060]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {config.ordered ? "着順アリ" : "順不同"}
        </span>
      </div>
      <p
        className="text-xs text-[#4A5060] leading-snug mb-4"
        style={{ fontFamily: "var(--font-noto-serif), serif" }}
      >
        {config.description}
      </p>

      {/* 罫線 */}
      <div className="border-t-[3px] border-b border-[#111] mb-4" />

      {isLocked && (
        <div className="mb-3 inline-flex items-center gap-2 bg-[#111] text-white px-3 py-1.5 text-xs font-black"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          🔒 締切済み
        </div>
      )}

      {/* 馬券スロット */}
      <div
        className={`flex flex-wrap items-center gap-2 mb-5 ${
          isLocked ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {config.labels.map((label, i) => (
          <TicketSlot
            key={i}
            member={(selections[i] && memberById.get(selections[i]!)) || null}
            label={label}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>

      {/* 候補グリッド */}
      <div
        className={`flex flex-wrap gap-1 ${
          isLocked ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {candidates.map((m, i) => (
          <CandidateChip
            key={m.id}
            member={m}
            index={i}
            selected={selectedIds.includes(m.id)}
            onSelect={() => onSelect(m)}
          />
        ))}
      </div>
    </PaperCard>
  );
}

// =====================================================================
// 投票券プレビュー
// =====================================================================

function BetTicketPreview({
  bets,
  members,
}: {
  bets: Bets;
  members: PublicMember[];
}) {
  const memberById = new Map(members.map((m) => [m.id, m]));
  const totalSelected = BETS.reduce(
    (s, b) => s + bets[b.key].filter(Boolean).length,
    0,
  );
  const totalSlots = BETS.reduce((s, b) => s + b.slotCount, 0);
  if (totalSelected === 0) return null;

  return (
    <div className="relative bg-[#F5F1E8] border-2 border-[#111] shadow-[6px_6px_0_rgba(17,17,17,0.18)]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between bg-[#111] text-[#FFE600] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-[#FFE600]" />
          <p
            className="text-[11px] font-black tracking-[0.32em]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            BET TICKET
          </p>
        </div>
        <p
          className="text-[10px] font-bold tabular-nums tracking-wider"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {totalSelected} / {totalSlots} SLOTS
        </p>
      </div>

      {/* 内容 */}
      <div className="px-5 py-4 space-y-2.5">
        {BETS.map((b) => {
          const selections = bets[b.key];
          const filled = selections.filter(Boolean).length;
          if (filled === 0) return null;
          return (
            <div
              key={b.key}
              className="flex items-baseline gap-3 border-b border-[#111]/15 pb-2 last:border-b-0 last:pb-0"
            >
              <span
                className="shrink-0 w-12 text-[11px] font-black tracking-wider text-[#D41E28]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {b.title}
              </span>
              <span
                className="text-xs font-bold text-[#111] flex-1"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {selections
                  .map((id) => (id ? memberById.get(id)?.name ?? "—" : "—"))
                  .join(b.ordered ? " → " : " · ")}
              </span>
              <span
                className="shrink-0 text-[10px] font-bold tabular-nums text-[#4A5060]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                +{b.points}pt
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// ドラフト保存
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
      JSON.stringify(bets),
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

// =====================================================================
// Main
// =====================================================================

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
          if (j.stage?.id) clearDraft(j.stage.id);
        } else if (j.stage?.id) {
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
    (b) => bets[b.key].every(Boolean) && bets[b.key].length === b.slotCount,
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
      <section className="mx-auto max-w-[720px] px-4 mt-10">
        <PaperCard className="px-6 py-10 text-center">
          <p
            className="text-2xl font-black mb-3 text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            開催準備中
          </p>
          <p
            className="text-sm text-[#4A5060]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            現在進行中のステージはありません。
            <br />
            次の開幕で予想投票が開きます。
          </p>
        </PaperCard>
      </section>
    );
  }

  return (
    <>
      {/* === 今節情報 === */}
      <section className="mx-auto max-w-[1100px] px-4 mt-8 md:mt-10">
        <PaperCard className="px-5 py-5 md:px-7 md:py-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
            <div className="flex-1">
              <p
                className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ NOW PLAYING
              </p>
              <p
                className="mt-2 text-xl md:text-2xl font-black text-[#111] leading-tight"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {stage.title ?? stage.name}
              </p>
              <p
                className="mt-1 text-[11px] tabular-nums tracking-wider text-[#4A5060]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {stage.startDate} 〜 {stage.endDate}
              </p>
            </div>

            {/* エントリー切り替え */}
            <div className="flex items-stretch shadow-[3px_3px_0_rgba(17,17,17,0.18)]">
              <button
                type="button"
                onClick={() => setEntryType("normal")}
                className={`px-4 py-2 text-xs font-black tracking-wider border-2 transition-colors ${
                  entryType === "normal"
                    ? "bg-[#111] text-[#FFE600] border-[#111]"
                    : "bg-white text-[#111] border-[#111] hover:bg-[#F5F1E8]"
                }`}
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                通常エントリー
              </button>
              <button
                type="button"
                onClick={() => setEntryType("welcome")}
                className={`px-4 py-2 text-xs font-black tracking-wider border-2 border-l-0 transition-colors ${
                  entryType === "welcome"
                    ? "bg-[#D41E28] text-white border-[#D41E28]"
                    : "bg-white text-[#111] border-[#111] hover:bg-[#F5F1E8]"
                }`}
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                初回限定
              </button>
            </div>
          </div>

          {/* 締切 / 提出数 */}
          <div className="mt-4 pt-3 border-t-[3px] border-b border-[#111] flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-[#4A5060]">
            <span className="flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <span className="text-[#D41E28]">●</span>
              本日までの提出 <b className="text-[#111] tabular-nums">{totalCount.toLocaleString()}</b> 件
            </span>
            <span className="flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              <span className="text-[#D41E28]">●</span>
              MAX SCORE <b className="text-[#111] tabular-nums">{MAX_SCORE}</b> pt
            </span>
            {closeAt && !isClosed && (
              <span className="flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <span className="text-[#D41E28] animate-pulse">●</span>
                締切 <Countdown closeAt={closeAt} />
              </span>
            )}
          </div>
        </PaperCard>
      </section>

      {/* === 各種お知らせ === */}
      {loaded && !isLoggedIn && (
        <section className="mx-auto max-w-[1100px] px-4 mt-4">
          <a
            href="/fan/login"
            className="block bg-[#FFE600] text-[#111] px-5 py-3 border-2 border-[#111] shadow-[3px_3px_0_rgba(17,17,17,0.18)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_rgba(17,17,17,0.18)] transition-transform"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            <span className="text-[11px] font-black tracking-[0.3em] mr-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ REWARD
            </span>
            <span className="text-sm font-black">会員登録で景品対象</span>
            <span className="text-xs ml-2 text-[#4A5060]">
              的中するとライブ会場のボーナス票やチェキ券プレゼント →
            </span>
          </a>
        </section>
      )}

      {loaded && draftRestored && (
        <section className="mx-auto max-w-[1100px] px-4 mt-4">
          <div
            className="bg-[#1CB4AF] text-white px-5 py-3 border-2 border-[#111] shadow-[3px_3px_0_rgba(17,17,17,0.18)]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            <span className="text-[11px] font-black tracking-[0.3em] mr-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ DRAFT
            </span>
            <span className="text-sm font-black">未提出の下書きを復元しました。</span>
            <span className="text-xs ml-2 opacity-90">
              {isLoggedIn
                ? "下の「予想を提出」を押して確定。"
                : "会員登録を完了してから提出ボタンを押してください。"}
            </span>
          </div>
        </section>
      )}

      {/* === 出馬表 === */}
      <section className="mx-auto max-w-[1100px] px-4 mt-8">
        <StarterRoster members={members} />
      </section>

      <div className="mx-auto max-w-[1100px] px-4 mt-8">
        <TornDivider variant="both" height={14} color="#D41E28" />
      </div>

      {/* === 賭式パネル群 === */}
      <section className="mx-auto max-w-[1100px] px-4 mt-6">
        <div className="mb-5">
          <SectionHeading eyebrow="WAGERS" title="賭式 6 種" />
          <p
            className="text-xs md:text-sm leading-relaxed text-[#4A5060]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            複勝 1pt / 単勝 2pt / 二連複 5pt / 二連単 10pt / 三連複 15pt /{" "}
            <span className="text-[#D41E28] font-black">三連単 30pt</span> 。
            着順アリほど高配当。全 6 種を埋めてフル提出。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {BETS.map((b) => (
            <BetSection
              key={b.key}
              config={b}
              candidates={members}
              selections={bets[b.key]}
              onSelect={makeSelect(b.key)}
              onRemove={makeRemove(b.key)}
              isLocked={isClosed}
            />
          ))}
        </div>
      </section>

      {/* === 投票券プレビュー === */}
      <section className="mx-auto max-w-[1100px] px-4 mt-10">
        <BetTicketPreview bets={bets} members={members} />
      </section>

      {/* === 提出 === */}
      <section className="mx-auto max-w-[1100px] px-4 mt-8 text-center">
        {error && (
          <p
            className="mb-3 text-xs text-[#D41E28] font-black"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            エラー: {error}
          </p>
        )}
        {flash && (
          <p
            className="mb-3 text-sm text-[#1CB4AF] font-black"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {flash}
          </p>
        )}

        {isClosed ? (
          <div
            className="inline-flex items-center gap-2 bg-[#111] text-white px-10 py-4 text-base font-black"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "5px 5px 0 rgba(17,17,17,0.22)",
            }}
          >
            🔒 締切済み
          </div>
        ) : !loaded ? (
          <div
            className="inline-flex items-center gap-2 bg-[#4A5060] text-white px-10 py-4 text-base font-black opacity-70"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            読み込み中...
          </div>
        ) : !isLoggedIn ? (
          <a
            href="/fan/login"
            className="group inline-flex items-center gap-3 bg-[#D41E28] text-white px-10 py-4 text-lg font-black hover:translate-y-0.5 transition-transform"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "6px 6px 0 rgba(17,17,17,0.22)",
            }}
          >
            <span>会員登録して予想する</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !allFilled}
            className="group inline-flex items-center gap-3 bg-[#D41E28] text-white px-10 py-4 text-lg font-black hover:translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              fontFamily: "var(--font-noto-serif), serif",
              boxShadow: "6px 6px 0 rgba(17,17,17,0.22)",
            }}
          >
            <span>
              {submitting
                ? "提出中..."
                : allFilled
                  ? "予想を提出する"
                  : "全ての賭式を埋めてください"}
            </span>
            {!submitting && allFilled && (
              <span className="text-2xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            )}
          </button>
        )}

        <p
          className="mt-4 text-[11px] text-[#4A5060]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {isLoggedIn
            ? "ファン会員限定: 1 ステージ 1 予想 / 何度でも上書き可 / 的中で景品対象"
            : "予想の提出にはファン会員ログインが必要です"}
        </p>
      </section>

      {/* === 票読み === */}
      {summary && summary.totalCount > 0 && (
        <SummarySection summary={summary} members={members} />
      )}
    </>
  );
}

// =====================================================================
// 票読み (Summary)
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
    <section className="mx-auto max-w-[1100px] px-4 mt-14">
      <div className="mb-5">
        <SectionHeading
          eyebrow="POLL"
          title={`票読み (${summary.totalCount.toLocaleString()} 件)`}
        />
        <p
          className="text-xs text-[#4A5060]"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          みんなの予想集計。賭式ごとの上位 3 名を表示。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {BETS.map((b) => {
          const tallies = summary.bySlot[b.key] ?? [];
          return (
            <PaperCard key={b.key} className="px-5 py-5">
              <div className="flex items-baseline justify-between mb-3">
                <h3
                  className="text-lg font-black text-[#111]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {b.title}
                </h3>
                <span
                  className="text-[10px] font-black tracking-wider text-[#D41E28]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  +{b.points}pt
                </span>
              </div>
              <div className="border-t border-[#111] mb-3" />
              <div className="space-y-3">
                {tallies.map((t) => {
                  const maxCount = Math.max(...t.rows.map((r) => r.count), 1);
                  const top = t.rows.slice(0, 3);
                  return (
                    <div key={t.positionIndex}>
                      <p
                        className="text-[10px] font-black tracking-wider text-[#4A5060] mb-1"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {b.ordered ? b.labels[t.positionIndex] : "選出数"}
                      </p>
                      {top.length === 0 ? (
                        <p
                          className="text-[11px] text-[#4A5060]"
                          style={{ fontFamily: "var(--font-noto-serif), serif" }}
                        >
                          —
                        </p>
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
                                <span
                                  className="text-[11px] font-bold text-[#111] w-20 truncate"
                                  style={{
                                    fontFamily: "var(--font-noto-serif), serif",
                                  }}
                                >
                                  {member?.name ?? "(不明)"}
                                </span>
                                <div className="flex-1 h-[3px] bg-[#E0DCC8]">
                                  <div
                                    className="h-full bg-[#D41E28]"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span
                                  className="text-[10px] font-black tabular-nums text-[#111] w-8 text-right"
                                  style={{ fontFamily: "var(--font-outfit)" }}
                                >
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
            </PaperCard>
          );
        })}
      </div>
    </section>
  );
}
