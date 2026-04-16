"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RankedMember } from "@/lib/projectp/live-stats";
import { getBoatColor } from "@/lib/projectp/boat-colors";
import { LiveBadge } from "@/components/live-badge";

type TabType = "all" | "player" | "pit";

const medals = ["🥇", "🥈", "🥉"];

function StatMiniBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="font-[family-name:var(--font-outfit)] text-[11px] font-semibold text-muted w-10 text-right">
        {value.toLocaleString()}
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
    <main className="pb-10">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2]/30 to-transparent pt-10 pb-8 text-center">
        <p className="text-4xl mb-2">📊</p>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
          総合ランキング
        </h1>
        <p className="mt-2 text-sm text-muted">
          {stageLabel ?? "バズ / 配信 / 収支 の3指標合算"}
        </p>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-[964px] px-4 -mt-2">
        <div className="flex items-center gap-2">
          {(
            [
              { key: "all" as TabType, icon: "🏆", label: "総合" },
              { key: "player" as TabType, icon: "⭐", label: "PLAYER" },
              { key: "pit" as TabType, icon: "🔥", label: "PIT" },
            ]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-all ${
                tab === t.key
                  ? "bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] text-primary-dark shadow-sm"
                  : "bg-white/70 text-muted hover:bg-white"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Ranking Table */}
      <section className="mx-auto max-w-[964px] px-4 mt-6">
        <div className="flex flex-col gap-2">
          {filteredMembers.map((member) => {
            const isReorgLine = tab === "all" && member.rank === 7;
            return (
              <div key={member.id}>
                {/* Reorg line */}
                {isReorgLine && (
                  <div className="relative my-3">
                    <div className="border-t-2 border-dashed border-reorg" />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-gradient-to-r from-pit to-pit-end px-4 py-1 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#fee685]">
                      ⚡ 翌月再編成ライン ⚡
                    </span>
                  </div>
                )}

                <Link
                  href={`/members/${member.slug}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-4 py-3 shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    {member.rank <= 3 ? (
                      <span className="text-xl">{medals[member.rank - 1]}</span>
                    ) : (
                      <span className="font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#0092b8]">
                        #{member.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  {(() => {
                    const mbc = getBoatColor(member.boatColor);
                    return (
                      <Image
                        src={member.avatarUrl}
                        alt={member.name}
                        width={44}
                        height={44}
                        className="size-11 shrink-0 rounded-full object-cover object-top"
                        style={{
                          boxShadow: mbc
                            ? `0 0 0 2.5px ${mbc.main}, 0 1px 3px rgba(0,0,0,0.1)`
                            : "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      />
                    );
                  })()}

                  {/* Name + Role */}
                  <div className="flex-1 md:flex-none md:w-32 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary-dark transition-colors truncate">
                      {member.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                          member.role === "PLAYER"
                            ? "bg-gradient-to-r from-player to-player-end"
                            : "bg-gradient-to-r from-pit to-pit-end"
                        }`}
                      >
                        {member.role}
                      </span>
                      <LiveBadge slug={member.slug} size="xs" />
                    </div>
                  </div>

                  {/* LIVE DATA indicator */}
                  <div className="w-8 shrink-0 text-center">
                    {member.hasLiveData && (
                      <span
                        title="YouTube連携済み"
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600"
                      >
                        ●
                      </span>
                    )}
                  </div>

                  {/* Stats — hidden on mobile */}
                  <div className="hidden md:flex flex-1 items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">
                        バズ
                      </p>
                      <StatMiniBar
                        value={member.detail.stats.buzz}
                        max={maxBuzz}
                        color="#00d3f3"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">
                        配信
                      </p>
                      <StatMiniBar
                        value={member.detail.stats.concurrent}
                        max={maxConc}
                        color="#2b7fff"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">
                        収支
                      </p>
                      <StatMiniBar
                        value={member.detail.stats.revenue}
                        max={maxRev}
                        color="#a684ff"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="w-16 sm:w-24 shrink-0 text-right">
                    <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground">
                      {member.points.toLocaleString()}
                    </span>
                    <p className="text-[9px] text-muted font-[family-name:var(--font-outfit)]">
                      pts
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly Special Status */}
      <section className="mx-auto max-w-[964px] px-4 mt-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-pit to-[#fdc700]" />
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#bb4d00] tracking-tight">
            📺 月末特番の反映状況
          </h2>
        </div>

        <div className="rounded-2xl border border-[rgba(206,250,254,0.5)] bg-gradient-to-r from-[rgba(236,254,255,0.8)] to-[rgba(240,249,255,0.8)] px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">⏳</span>
            <span className="rounded-full bg-gradient-to-r from-pit to-pit-end px-3 py-1 text-[11px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
              未反映
            </span>
            <span className="text-sm font-bold text-foreground">
              — 月末特番の結果待ち
            </span>
          </div>
          <p className="text-xs text-muted">
            月間3指標のみ反映中。月末特番で最終確定 → 翌月の再編成に反映されます。
          </p>
        </div>
      </section>
    </main>
  );
}
