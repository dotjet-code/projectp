import type { RankedMember } from "@/lib/projectp/live-stats";
import { SectionHeading } from "@/components/section-heading";
import { MemberRow } from "@/components/member-row";
import Image from "next/image";
import Link from "next/link";

function PassLineDivider() {
  return (
    <div className="flex items-center bg-[#D41E28] text-white h-9 px-4">
      <span
        className="text-[11px] font-black tracking-[0.25em]"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        — PASS LINE · 次バトルステージ再編成ライン —
      </span>
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"] as const;

type IndicatorKey = "buzz" | "concurrent" | "revenue" | "shuyaku";

const INDICATORS: {
  key: IndicatorKey;
  label: string;
  desc: string;
  color: string;
  getValue: (m: RankedMember) => number;
}[] = [
  {
    key: "buzz",
    label: "バズ",
    desc: "SNS の話題性・動画再生数・トレンド力。注目を集めた量で点が入る。",
    color: "#00BCFF",
    getValue: (m) => m.detail.stats.buzz,
  },
  {
    key: "concurrent",
    label: "配信",
    desc: "配信の同時接続数と配信時間。リアルタイムで推しを動かせたかで点が入る。",
    color: "#1447E6",
    getValue: (m) => m.detail.stats.concurrent,
  },
  {
    key: "revenue",
    label: "収支",
    desc: "グッズ・投げ銭・チケットなどの経済指標。応援がそのまま数字になる。",
    color: "#7A3DFF",
    getValue: (m) => m.detail.stats.revenue,
  },
  {
    key: "shuyaku",
    label: "投票",
    desc: "毎日のサイコロ投票と順位予想で集まる、ファンからの直接指名。",
    color: "#D41E28",
    getValue: (m) => m.detail.stats.shuyaku ?? 0,
  },
];

function IndicatorRanking({
  indicator,
  members,
  limit = 10,
  defaultOpen = true,
}: {
  indicator: (typeof INDICATORS)[number];
  members: RankedMember[];
  limit?: number;
  defaultOpen?: boolean;
}) {
  const sorted = [...members]
    .filter((m) => m.name !== "Coming Soon")
    .sort((a, b) => indicator.getValue(b) - indicator.getValue(a))
    .slice(0, limit);
  const maxVal = Math.max(...sorted.map(indicator.getValue), 1);

  return (
    <details
      open={defaultOpen}
      className="group bg-[#F5F1E8] border-2 border-[#111]"
      style={{ boxShadow: "4px 4px 0 rgba(17,17,17,0.18)" }}
    >
      {/* ヘッダー (summary) */}
      <summary className="list-none cursor-pointer px-4 py-3 border-b-2 border-transparent group-open:border-[#111] transition-colors hover:bg-white/40">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="inline-block w-3 h-3 shrink-0"
            style={{ backgroundColor: indicator.color }}
            aria-hidden
          />
          <h3
            className="text-lg md:text-xl font-black text-[#111]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {indicator.label}
          </h3>
          <span
            className="ml-auto flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-[#4A5060]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <span>TOP {sorted.length}</span>
            <span
              className="text-[#111] text-sm transition-transform group-open:rotate-180"
              aria-hidden
            >
              ▼
            </span>
          </span>
        </div>
        <p
          className="text-[11px] md:text-xs text-[#4A5060] leading-snug"
          style={{ fontFamily: "var(--font-noto-serif), serif" }}
        >
          {indicator.desc}
        </p>
      </summary>

      {/* リスト */}
      <ol className="divide-y divide-[#111]/15">
        {sorted.map((m, i) => {
          const value = indicator.getValue(m);
          const pct = Math.max(2, (value / maxVal) * 100);
          return (
            <li key={m.id}>
              <Link
                href={`/members/${m.slug}`}
                className="flex items-center gap-2 md:gap-3 px-4 py-2 hover:bg-white/60 transition-colors"
              >
                <span
                  className="shrink-0 w-6 text-xs font-black text-[#4A5060] tabular-nums text-center"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {i + 1}
                </span>
                <span className="shrink-0 relative w-8 h-8 overflow-hidden border border-[#111]">
                  <Image
                    src={m.avatarUrl}
                    alt={m.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                    style={{ objectPosition: "50% 18%" }}
                  />
                </span>
                <span
                  className="flex-1 min-w-0 text-xs md:text-sm font-black text-[#111] truncate"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {m.name}
                </span>
                {/* 値 + 小バー */}
                <div className="shrink-0 flex items-center gap-2 w-[120px] md:w-[140px]">
                  <span className="flex-1 relative h-1.5 bg-[#111]/10">
                    <span
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: indicator.color,
                      }}
                    />
                  </span>
                  <span
                    className="text-xs font-black text-[#111] tabular-nums min-w-[40px] text-right"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {value.toLocaleString()}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

export function RankingClient({
  members,
  stageLabel,
}: {
  members: RankedMember[];
  stageLabel?: string;
}) {
  const sortedMembers = [...members].sort((a, b) => {
    const aComing = a.name === "Coming Soon" ? 1 : 0;
    const bComing = b.name === "Coming Soon" ? 1 : 0;
    if (aComing !== bComing) return aComing - bComing;
    return a.rank - b.rank;
  });

  const maxBuzz = Math.max(...members.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(...members.map((m) => m.detail.stats.concurrent), 1);
  const maxRev = Math.max(...members.map((m) => m.detail.stats.revenue), 1);
  const maxShuyaku = Math.max(
    ...members.map((m) => m.detail.stats.shuyaku ?? 0),
    1,
  );

  const top3 = sortedMembers.slice(0, 3);

  return (
    <main className="pb-20">
      {/* Hero */}
      <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-16 md:py-20 overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
          style={{
            clipPath:
              "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
          }}
          aria-hidden
        />
        <div className="max-w-[1200px] mx-auto">
          <p
            className="text-xs md:text-sm font-black tracking-[0.35em] text-[#FFE600]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            RANKING
          </p>
          <h1
            className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            暫定<span className="text-[#D41E28]">総合順位。</span>
          </h1>
          <div className="mt-6 max-w-2xl">
            <p
              className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <span className="text-[#FFE600]">いま、走っているのは誰だ。</span>
              <br />
              バズ・配信・収支・投票 ── 4 つの数字が、次の主役を決める。
            </p>
            {stageLabel && (
              <p
                className="mt-3 text-xs md:text-sm font-bold tracking-wider text-[#9BA8BF]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ {stageLabel}
              </p>
            )}
            <div
              className="mt-4 h-2 max-w-[220px] bg-[#D41E28]"
              style={{
                clipPath:
                  "polygon(0 60%, 4% 20%, 10% 70%, 18% 30%, 28% 65%, 38% 25%, 48% 70%, 58% 30%, 68% 68%, 78% 28%, 86% 70%, 94% 34%, 100% 66%, 100% 100%, 0 100%)",
              }}
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* TOP 3 (表彰台) */}
      {top3.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 mt-10">
          <SectionHeading
            title="TOP 3"
            eyebrow="CURRENT TOP 3"
            accent="red"
          />
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {top3.map((m, i) => (
              <Link
                key={m.id}
                href={`/members/${m.slug}`}
                className={`flex flex-col items-center text-center bg-[#F5F1E8] border-2 border-[#111] px-3 py-5 md:py-6 transition-transform active:translate-y-0.5 hover:bg-[#FFE600] ${i === 0 ? "md:py-8" : ""}`}
                style={{ boxShadow: "4px 4px 0 rgba(17,17,17,0.22)" }}
              >
                <span className="text-3xl md:text-4xl leading-none mb-2" aria-hidden>
                  {MEDALS[i]}
                </span>
                <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden border-2 border-[#111] mb-3">
                  <Image
                    src={m.avatarUrl}
                    alt={m.name}
                    fill
                    sizes="(max-width: 768px) 64px, 80px"
                    className="object-cover"
                    style={{ objectPosition: "50% 18%" }}
                  />
                </div>
                <p
                  className="text-xs md:text-base font-black text-[#111] leading-tight"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  {m.name}
                </p>
                <p
                  className="mt-1 text-base md:text-xl font-black text-[#D41E28] tabular-nums leading-none"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {m.effectivePoints.toLocaleString()}
                  <span className="ml-0.5 text-[10px] md:text-xs text-[#4A5060]">
                    pt
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 指標別ランキング */}
      <section className="max-w-[1200px] mx-auto px-4 mt-12">
        <SectionHeading
          title="指標別ランキング"
          eyebrow="CATEGORY RANKINGS"
          accent="red"
          aside={
            <span className="text-[#4A5060]">
              4 指標それぞれの TOP 10。総合順位とは違う強みが見える。
            </span>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {INDICATORS.map((ind) => (
            <IndicatorRanking
              key={ind.key}
              indicator={ind}
              members={sortedMembers}
              limit={10}
            />
          ))}
        </div>
      </section>

      {/* Ranking Table */}
      <section className="max-w-[1200px] mx-auto px-4 mt-12">
        <SectionHeading
          title="総合順位"
          eyebrow="CURRENT STANDINGS"
          accent="red"
          aside={
            <span className="text-[#4A5060]">
              4 指標の合計ポイント順。
              <span className="inline-block ml-1 text-[#D41E28] font-bold">
                7 位以下は次バトルステージ PIT
              </span>
              。
            </span>
          }
        />
        <div className="border-t-[3px] border-[#111]">
          {sortedMembers.map((member) => {
            const isReorgLine = member.rank === 7;
            return (
              <div key={member.id}>
                {isReorgLine && <PassLineDivider />}
                <MemberRow
                  member={member}
                  rank={member.rank}
                  maxBuzz={maxBuzz}
                  maxConc={maxConc}
                  maxRev={maxRev}
                  maxShuyaku={maxShuyaku}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly Special Status */}
      <section className="max-w-[1200px] mx-auto px-4 mt-16">
        <SectionHeading
          title="閉幕特番の反映状況"
          eyebrow="FINAL STATUS"
          accent="red"
        />
        <div className="border-[3px] border-[#111] bg-[#F5F1E8] px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="inline-block w-2 h-2 bg-[#FFE600] animate-pulse"
              aria-hidden
            />
            <span
              className="text-xs font-black tracking-[0.3em] text-[#4A5060]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              未反映
            </span>
            <span
              className="text-base md:text-lg font-black text-[#111]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              閉幕特番の結果待ち
            </span>
          </div>
          <p
            className="text-sm text-[#4A5060]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            4 指標（バズ・配信・収支・投票）のみ反映中。閉幕特番で最終確定 → 次バトルステージの再編成に反映される。
          </p>
        </div>
      </section>
    </main>
  );
}
