"use client";

import { useState } from "react";
import type { RankedMember } from "@/lib/projectp/live-stats";
import { SectionHeading } from "@/components/section-heading";
import { MemberRow } from "@/components/member-row";

type TabType = "all" | "player" | "pit";

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
  const maxShuyaku = Math.max(
    ...members.map((m) => m.detail.stats.shuyaku ?? 0),
    1,
  );

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
              バズ・配信・収支・投票 ── 4 つの数字が、来月の主役を決める。
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
            月間 4 指標（バズ・配信・収支・投票）のみ反映中。月末特番で最終確定 → 翌月の再編成に反映される。
          </p>
        </div>
      </section>
    </main>
  );
}
