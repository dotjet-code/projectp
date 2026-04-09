"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { RankedMember } from "@/lib/projectp/live-stats";

type TabType = "all" | "player" | "pit";

const medals = ["🥇", "🥈", "🥉"];

const liveBonus = [
  { slug: "shiomi-kira", name: "塩見きら", bonus: 0 },
  { slug: "nekomi", name: "ねこみ。", bonus: 17 },
  { slug: "akutsu-mao", name: "阿久津真央", bonus: 32 },
  { slug: "koike-yuuno", name: "小池ゆうの", bonus: 92 },
];

const monthLabels = ["1月", "2月", "3月", "4月"];
const lineColors = ["#00d3f3", "#ff6467", "#ffb900", "#a684ff", "#00d492", "#2b7fff"];

function MiniSparkline({ data }: { data: number[] }) {
  const last4 = data.slice(-4);
  const max = Math.max(...last4);
  const min = Math.min(...last4);
  const range = max - min || 1;
  const h = 24;
  const w = 48;
  const points = last4.map((v, i) => ({
    x: (i / 3) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg viewBox={`-2 -2 ${w + 4} ${h + 4}`} className="h-6 w-12">
      <path d={d} fill="none" stroke="#00d3f3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} fill="#00d3f3" />
    </svg>
  );
}

function StatMiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-[family-name:var(--font-outfit)] text-[11px] font-semibold text-muted w-7 text-right">{value}</span>
    </div>
  );
}

export function RankingClient({ members }: { members: RankedMember[] }) {
  const [tab, setTab] = useState<TabType>("all");

  const sortedMembers = [...members].sort((a, b) => a.rank - b.rank);
  const filteredMembers =
    tab === "all"
      ? sortedMembers
      : sortedMembers.filter((m) => (tab === "player" ? m.role === "PLAYER" : m.role === "PIT"));

  const maxBuzz = Math.max(...members.map((m) => m.detail.stats.buzz), 1);
  const maxConc = Math.max(...members.map((m) => m.detail.stats.concurrent), 1);
  const maxRev = Math.max(...members.map((m) => m.detail.stats.revenue), 1);

  // Bar chart data
  const barChartMembers = sortedMembers.slice(0, 8);
  const barMax = Math.max(
    ...barChartMembers.flatMap((m) => [m.detail.stats.buzz, m.detail.stats.concurrent, m.detail.stats.revenue]),
    1
  );

  // Line chart data - top 6
  const lineChartMembers = sortedMembers.slice(0, 6);

  return (
    <main className="pb-10">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2]/30 to-transparent pt-10 pb-8 text-center">
        <p className="text-4xl mb-2">📊</p>
        <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
          総合ランキング
        </h1>
        <p className="mt-2 text-sm text-muted">
          2026年4月クール — バズ / 配信 / 収支 の3指標合算
        </p>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-[964px] px-4 -mt-2">
        <div className="flex items-center gap-2">
          {([
            { key: "all" as TabType, icon: "🏆", label: "総合" },
            { key: "player" as TabType, icon: "⭐", label: "PLAYER" },
            { key: "pit" as TabType, icon: "🔥", label: "PIT" },
          ]).map((t) => (
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
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-full object-cover object-top shadow-sm"
                  />

                  {/* Name + Role */}
                  <div className="flex-1 md:flex-none md:w-28 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary-dark transition-colors truncate">
                      {member.name}
                    </p>
                    <span
                      className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                        member.role === "PLAYER"
                          ? "bg-gradient-to-r from-player to-player-end"
                          : "bg-gradient-to-r from-pit to-pit-end"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>

                  {/* LIVE DATA indicator */}
                  <div className="w-8 shrink-0 text-center">
                    {member.hasLiveData && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                        ●
                      </span>
                    )}
                  </div>

                  {/* Stats — hidden on mobile */}
                  <div className="hidden md:flex flex-1 items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">バズ</p>
                      <StatMiniBar value={member.detail.stats.buzz} max={maxBuzz} color="#00d3f3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">配信</p>
                      <StatMiniBar value={member.detail.stats.concurrent} max={maxConc} color="#2b7fff" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] text-muted mb-0.5 font-[family-name:var(--font-outfit)]">収支</p>
                      <StatMiniBar value={member.detail.stats.revenue} max={maxRev} color="#a684ff" />
                    </div>
                  </div>

                  {/* Mini sparkline — hidden on mobile */}
                  <div className="hidden sm:block w-14 shrink-0">
                    <MiniSparkline data={member.detail.monthlyPoints} />
                  </div>

                  {/* Total */}
                  <div className="w-14 sm:w-20 shrink-0 text-right">
                    <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground">
                      {member.points.toLocaleString()}
                    </span>
                    <p className="text-[9px] text-muted font-[family-name:var(--font-outfit)]">pts</p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Bonus Section */}
      <section className="mx-auto max-w-[964px] px-4 mt-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple to-[#c27aff]" />
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#7008e7] tracking-tight">
            🎤 ライブ応援反映履歴
          </h2>
        </div>

        <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="rounded-full bg-gradient-to-r from-purple to-purple-end px-3 py-1 text-[10px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
              SPECIAL
            </span>
            <span className="rounded-full bg-gradient-to-r from-live to-live-end px-3 py-1 text-[10px] font-bold text-white tracking-wider font-[family-name:var(--font-outfit)]">
              LIVE DAY ONLY
            </span>
            <span className="text-xs text-muted">当月の7日配信ボーナスのみ反映</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {liveBonus.map((item) => {
              const member = members.find((m) => m.slug === item.slug);
              if (!member) return null;
              return (
                <div key={item.slug} className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-[rgba(237,233,254,0.5)] to-white/50 p-4">
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={48}
                    height={48}
                    className="size-12 rounded-full object-cover object-top shadow-sm"
                  />
                  <p className="text-xs font-bold text-foreground">{member.name}</p>
                  <span className={`font-[family-name:var(--font-outfit)] text-sm font-bold ${item.bonus > 0 ? "text-[#7008e7]" : "text-muted"}`}>
                    +{item.bonus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bar Chart - Buzz / Concurrent / Revenue */}
      <section className="mx-auto max-w-[964px] px-4 mt-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-blue" />
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
            📊 バズ / 配信 / 収支
          </h2>
        </div>

        <div className="rounded-2xl bg-white/70 border border-white/80 p-6 shadow-sm">
          <div className="relative h-[240px]">
            <svg viewBox="0 0 500 200" className="size-full" preserveAspectRatio="xMidYMid meet">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = 180 - t * 160;
                return (
                  <g key={t}>
                    <line x1={30} y1={y} x2={490} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
                    <text x={25} y={y + 3} fontSize={7} fill="#7a8ba0" textAnchor="end">
                      {Math.round(t * barMax)}
                    </text>
                  </g>
                );
              })}
              {/* Bars */}
              {barChartMembers.map((member, i) => {
                const x = 40 + i * 56;
                const bw = 12;
                const { buzz, concurrent, revenue } = member.detail.stats;
                const bh = (buzz / barMax) * 160;
                const ch = (concurrent / barMax) * 160;
                const rh = (revenue / barMax) * 160;
                return (
                  <g key={member.id}>
                    <rect x={x} y={180 - bh} width={bw} height={bh} rx={2} fill="#00d3f3" opacity={0.8} />
                    <rect x={x + bw + 2} y={180 - ch} width={bw} height={ch} rx={2} fill="#2b7fff" opacity={0.8} />
                    <rect x={x + (bw + 2) * 2} y={180 - rh} width={bw} height={rh} rx={2} fill="#a684ff" opacity={0.8} />
                    <text x={x + 20} y={195} fontSize={6} fill="#7a8ba0" textAnchor="middle">
                      {member.name.slice(0, 4)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-primary" />
              <span className="text-[11px] text-muted">バズ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-primary-blue" />
              <span className="text-[11px] text-muted">配信</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-purple" />
              <span className="text-[11px] text-muted">収支</span>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Trend Line Chart */}
      <section className="mx-auto max-w-[964px] px-4 mt-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-trending to-[#00d5be]" />
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#007a55] tracking-tight">
            📈 月間推移
          </h2>
        </div>

        <div className="rounded-2xl bg-white/70 border border-white/80 p-6 shadow-sm">
          <div className="relative h-[220px]">
            <svg viewBox="0 0 400 180" className="size-full" preserveAspectRatio="xMidYMid meet">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = 150 - t * 130;
                return (
                  <g key={t}>
                    <line x1={30} y1={y} x2={380} y2={y} stroke="#e5e7eb" strokeWidth={0.3} />
                  </g>
                );
              })}
              {/* Month labels */}
              {monthLabels.map((label, i) => (
                <text key={label} x={30 + (i / 3) * 350} y={168} fontSize={7} fill="#7a8ba0" textAnchor="middle">{label}</text>
              ))}
              {/* Lines */}
              {lineChartMembers.map((member, mi) => {
                const last4 = member.detail.monthlyPoints.slice(-4);
                const allVals = lineChartMembers.flatMap((m) => m.detail.monthlyPoints.slice(-4));
                const max = Math.max(...allVals);
                const min = Math.min(...allVals);
                const range = max - min || 1;
                const pts = last4.map((v, i) => ({
                  x: 30 + (i / 3) * 350,
                  y: 150 - ((v - min) / range) * 130,
                }));
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                return (
                  <g key={member.id}>
                    <path d={d} fill="none" stroke={lineColors[mi]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={lineColors[mi]} stroke="white" strokeWidth={0.8} />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 flex-wrap">
            {lineChartMembers.map((m, i) => (
              <div key={m.id} className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full" style={{ background: lineColors[i] }} />
                <span className="text-[11px] text-muted">{m.name}</span>
              </div>
            ))}
          </div>
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
            <span className="text-sm font-bold text-foreground">— 月末特番の結果待ち</span>
          </div>
          <p className="text-xs text-muted">
            月間3指標のみ反映中。月末特番で最終確定 → 翌月の再編成に反映されます。
          </p>
        </div>
      </section>
    </main>
  );
}
