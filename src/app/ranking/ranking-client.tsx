"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RankedMember } from "@/lib/projectp/live-stats";
import { LiveBadge } from "@/components/live-badge";
import { SectionHeading } from "@/components/section-heading";

type TabType = "all" | "player" | "pit";

const BOAT_PLATES: Record<
  number,
  { bg: string; border: string }
> = {
  1: { bg: "#F5F5F0", border: "#111111" },
  2: { bg: "#1A1A1A", border: "#1A1A1A" },
  3: { bg: "#D41E28", border: "#D41E28" },
  4: { bg: "#1E4BC8", border: "#1E4BC8" },
  5: { bg: "#F2C81B", border: "#F2C81B" },
  6: { bg: "#0F8F4A", border: "#0F8F4A" },
};

function StatMiniBar({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-[10px] font-medium text-[#4A5060] shrink-0">
        {label}
      </span>
      <div className="w-16 h-[3px] bg-[#E0DCC8]">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span
        className="text-[10px] font-bold tabular-nums text-[#111] w-10 text-right"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function PassLineDivider() {
  return (
    <div className="flex items-center bg-[#D41E28] text-white h-9 px-4">
      <span
        className="text-[11px] font-black tracking-[0.25em]"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        — PASS LINE · 翌月再編成ライン —
      </span>
    </div>
  );
}

export function RankingClient({
  members,
  stageLabel,
}: {
  members: RankedMember[];
  stageLabel?: string;
}) {
  const [tab, setTab] = useState<TabType>("all");

  const sortedMembers = [...members].sort((a, b) => {
    const aComing = a.name === "Coming Soon" ? 1 : 0;
    const bComing = b.name === "Coming Soon" ? 1 : 0;
    if (aComing !== bComing) return aComing - bComing;
    return a.rank - b.rank;
  });
  const filteredMembers =
    tab === "all"
      ? sortedMembers
      : sortedMembers.filter((m) =>
          tab === "player" ? m.role === "PLAYER" : m.role === "PIT"
        );

  const maxBuzz = Math.max(...members.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(...members.map((m) => m.detail.stats.concurrent), 1);
  const maxRev = Math.max(...members.map((m) => m.detail.stats.revenue), 1);

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
            className="mt-3 text-5xl md:text-7xl font-black leading-[0.9] tracking-tight"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            暫定<br />
            <span className="text-[#D41E28]">総合順位。</span>
          </h1>
          <p
            className="mt-6 text-base md:text-lg leading-relaxed max-w-2xl text-[#9BA8BF]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            {stageLabel ?? "バズ / 配信 / 収支 の 3 指標合算"}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-[1200px] mx-auto px-4 mt-10">
        <div className="flex items-stretch border border-[#111]">
          {(
            [
              { key: "all" as TabType, label: "総合", count: members.length },
              { key: "player" as TabType, label: "PLAYER", count: members.filter((m) => m.role === "PLAYER").length },
              { key: "pit" as TabType, label: "PIT", count: members.filter((m) => m.role === "PIT").length },
            ]
          ).map((t, i) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-black tracking-wide transition-colors ${
                i > 0 ? "border-l border-[#111]" : ""
              } ${
                tab === t.key
                  ? "bg-[#D41E28] text-white"
                  : "bg-[#F5F1E8] text-[#111] hover:bg-white"
              }`}
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <span>{t.label}</span>
              <span
                className="text-xs opacity-80 tabular-nums"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ({t.count})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Ranking Table */}
      <section className="max-w-[1200px] mx-auto px-4 mt-8">
        <div className="border-t-[3px] border-[#111]">
          {filteredMembers.map((member) => {
            const isReorgLine = tab === "all" && member.rank === 7;
            const plate = member.rank <= 6 ? BOAT_PLATES[member.rank] : null;
            return (
              <div key={member.id}>
                {isReorgLine && <PassLineDivider />}
                <Link
                  href={`/members/${member.slug}`}
                  className="flex items-center gap-3 md:gap-4 py-4 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group"
                >
                  {/* 順位 */}
                  <div
                    className="shrink-0 w-14 md:w-16 text-center text-4xl md:text-5xl font-black tabular-nums text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {member.rank}
                  </div>

                  {/* 号艇プレート */}
                  <div className="shrink-0">
                    {plate ? (
                      <div
                        className="w-8 h-8 md:w-9 md:h-9 border"
                        style={{ backgroundColor: plate.bg, borderColor: plate.border }}
                        aria-label={`${member.rank}号艇`}
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-[#4A5060] text-white text-[10px] font-black" style={{ fontFamily: "var(--font-outfit)" }}>
                        P
                      </div>
                    )}
                  </div>

                  {/* 写真 */}
                  <div className="shrink-0 relative w-12 h-12 md:w-14 md:h-14 overflow-hidden border border-[#D5CFC0]">
                    <Image
                      src={member.avatarUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="w-full h-full object-cover object-top grayscale contrast-125"
                    />
                  </div>

                  {/* 氏名 + ロール */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-base md:text-lg font-bold text-[#111] truncate"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        {member.name}
                      </p>
                      <LiveBadge slug={member.slug} size="xs" />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-block text-[10px] font-black tracking-wider px-1.5 py-0.5 ${
                          member.role === "PLAYER"
                            ? "bg-[#D41E28] text-white"
                            : "bg-[#4A5060] text-white"
                        }`}
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {member.role}
                      </span>
                      {member.hasLiveData && (
                        <span
                          title="YouTube 連携済み"
                          className="text-[10px] font-bold text-[#0F8F4A]"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          LIVE DATA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats — hidden on mobile */}
                  <div className="hidden md:block shrink-0 space-y-1">
                    <StatMiniBar
                      label="バズ"
                      value={member.detail.stats.buzz}
                      max={maxBuzz}
                      color="#00BCFF"
                    />
                    <StatMiniBar
                      label="配信"
                      value={member.detail.stats.concurrent}
                      max={maxConc}
                      color="#1447E6"
                    />
                    <StatMiniBar
                      label="収支"
                      value={member.detail.stats.revenue}
                      max={maxRev}
                      color="#7A3DFF"
                    />
                  </div>

                  {/* 合計 */}
                  <div className="shrink-0 w-20 md:w-24 text-right">
                    <p
                      className="text-xl md:text-3xl font-black tabular-nums leading-none text-[#111]"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {member.effectivePoints.toLocaleString()}
                    </p>
                    <p
                      className="text-[10px] text-[#4A5060] mt-1"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      pt
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly Special Status */}
      <section className="max-w-[1200px] mx-auto px-4 mt-16">
        <SectionHeading
          title="月末特番の反映状況"
          eyebrow="FINAL STATUS"
          accent="red"
        />
        <div className="border-[3px] border-[#111] bg-[#F5F1E8] px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block w-2 h-2 bg-[#FFE600] animate-pulse" aria-hidden />
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
              月末特番の結果待ち
            </span>
          </div>
          <p
            className="text-sm text-[#4A5060]"
            style={{ fontFamily: "var(--font-noto-serif), serif" }}
          >
            月間 3 指標のみ反映中。月末特番で最終確定 → 翌月の再編成に反映される。
          </p>
        </div>
      </section>
    </main>
  );
}
