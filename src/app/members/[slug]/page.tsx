import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { members } from "@/lib/data";

export function generateStaticParams() {
  return members.map((m) => ({ slug: m.slug }));
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-xs font-bold text-muted">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-10 text-right font-[family-name:var(--font-outfit)] text-xs font-bold text-foreground">{value}</span>
    </div>
  );
}

function SimpleLineChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const months = ["1月", "2月", "3月", "4月"];
  const h = 160;
  const w = 100;
  const points = data.slice(-4).map((v, i) => ({
    x: (i / 3) * w,
    y: h - ((v - min) / range) * (h - 20) - 10,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="relative h-[200px]">
      <svg viewBox={`-10 -10 ${w + 20} ${h + 30}`} className="size-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = h - t * (h - 20) - 10;
          const val = Math.round(min + t * range);
          return (
            <g key={t}>
              <line x1={0} y1={y} x2={w} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
              <text x={-8} y={y + 3} fontSize={5} fill="#7a8ba0" textAnchor="end">{val}</text>
            </g>
          );
        })}
        {/* Line */}
        <path d={pathD} fill="none" stroke="#00d3f3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#00d3f3" stroke="white" strokeWidth={1} />
        ))}
        {/* Month labels */}
        {months.map((m, i) => (
          <text key={m} x={(i / 3) * w} y={h + 15} fontSize={5} fill="#7a8ba0" textAnchor="middle">{m}</text>
        ))}
      </svg>
    </div>
  );
}

function RadarChart({ stats }: { stats: { buzz: number; concurrent: number; revenue: number } }) {
  const labels = ["バズ", "支持率", "同接", "収支", "成長"];
  const maxVal = 1000;
  const values = [stats.buzz, 400, stats.concurrent, stats.revenue, 500];
  const cx = 50, cy = 50, r = 35;
  const n = labels.length;

  function polarToXY(i: number, val: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const ratio = val / maxVal;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = values.map((v, i) => polarToXY(i, v));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="relative h-[200px]">
      <svg viewBox="0 0 100 100" className="size-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => polarToXY(i, maxVal * level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return <path key={level} d={path} fill="none" stroke="#e5e7eb" strokeWidth={0.3} />;
        })}
        {/* Axes */}
        {Array.from({ length: n }, (_, i) => {
          const p = polarToXY(i, maxVal);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={0.3} />;
        })}
        {/* Data */}
        <path d={dataPath} fill="rgba(0,211,243,0.15)" stroke="#00d3f3" strokeWidth={0.8} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.5} fill="#00d3f3" />
        ))}
        {/* Labels */}
        {labels.map((label, i) => {
          const p = polarToXY(i, maxVal * 1.2);
          return <text key={i} x={p.x} y={p.y} fontSize={4} fill="#7a8ba0" textAnchor="middle" dominantBaseline="central">{label}</text>;
        })}
      </svg>
    </div>
  );
}

export default async function MemberDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = members.find((m) => m.slug === slug);
  if (!member) notFound();

  const { detail } = member;
  const isPlayer = member.role === "PLAYER";
  const maxStat = Math.max(detail.stats.buzz, detail.stats.concurrent, detail.stats.revenue) * 1.2;

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#e0f7fa] via-[#b2ebf2] to-transparent pb-10 pt-8">
          <div className="mx-auto flex flex-col sm:flex-row max-w-[996px] items-center sm:items-start gap-6 sm:gap-10 px-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Image
                src={member.avatarUrl}
                alt={member.name}
                width={180}
                height={180}
                className="size-[140px] sm:size-[180px] rounded-[24px] object-cover object-top shadow-lg"
              />
              {member.isLive && (
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#fb2c36] px-2.5 py-1 shadow-md">
                  <span className="size-1.5 rounded-full bg-white opacity-60 animate-pulse" />
                  <span className="text-[10px] font-bold text-white">LIVE</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2 text-center sm:text-left">
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                  isPlayer
                    ? "bg-gradient-to-r from-player to-player-end shadow-[0_1px_3px_#bedbff]"
                    : "bg-gradient-to-r from-pit to-pit-end shadow-[0_1px_3px_#fee685]"
                }`}
              >
                {member.role}
              </span>

              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">{member.name}</h1>

              <p className="mt-1 font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#0092b8]">
                #{member.rank}
                {member.isTrending && <span className="ml-1 text-sm text-[#00d492]">↑</span>}
              </p>

              {/* Stat bars */}
              <div className="mt-4 flex flex-col gap-2 max-w-[380px] mx-auto sm:mx-0">
                <StatBar label="バズ" value={detail.stats.buzz} max={maxStat} color="linear-gradient(90deg, #00d3f3, #2b7fff)" />
                <StatBar label="同接" value={detail.stats.concurrent} max={maxStat} color="linear-gradient(90deg, #00bcff, #2b7fff)" />
                <StatBar label="収支" value={detail.stats.revenue} max={maxStat} color="linear-gradient(90deg, #a684ff, #c27aff)" />
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-outfit)] text-xs font-semibold tracking-wider text-muted">TOTAL</span>
                <span className="font-[family-name:var(--font-outfit)] text-2xl font-black italic text-foreground">
                  {member.points.toLocaleString()}
                </span>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-bold italic text-muted">pts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Position Forecast */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-pit to-[#fdc700]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#bb4d00] tracking-tight">
              ⚡ 来月のポジション予測
            </h2>
          </div>
          <div className="rounded-2xl bg-white/70 border border-white/80 p-6 shadow-sm">
            <p className="text-xs text-muted mb-1">再編成ラインとの距離</p>
            <div className="flex items-center gap-3">
              <p className="text-lg font-bold text-foreground">
                ⭐ {detail.positionForecast}（{detail.positionMargin}）
              </p>
            </div>
            {/* Gauge */}
            <div className="mt-4 relative">
              <div className="flex justify-between text-[10px] font-semibold text-muted font-[family-name:var(--font-outfit)] mb-1">
                <span>低 (PIT)</span>
                <span className="text-reorg">再編成ライン</span>
                <span>安定 (PLAYER)</span>
              </div>
              <div className="h-3 rounded-full bg-gradient-to-r from-pit/20 via-reorg/30 to-primary/20 overflow-hidden relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-reorg" />
                <div
                  className={`absolute top-[-2px] size-[18px] rounded-full border-2 border-white shadow-md ${
                    isPlayer ? "bg-primary" : "bg-pit"
                  }`}
                  style={{ left: `${isPlayer ? 60 + member.rank * 3 : 20 + (12 - member.rank) * 3}%`, transform: "translateX(-50%)" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Line chart */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
                <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
                  📈 推移グラフ
                </h2>
              </div>
              <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
                <SimpleLineChart data={detail.monthlyPoints} />
              </div>
            </div>

            {/* Radar chart */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-cyan" />
                <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
                  🎯 能力チャート
                </h2>
              </div>
              <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
                <RadarChart stats={detail.stats} />
              </div>
            </div>
          </div>
        </section>

        {/* Status badges */}
        <section className="mx-auto max-w-[964px] px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-5 py-4 shadow-sm">
              <span className="text-xl">📡</span>
              <div>
                <p className="text-xs font-bold text-muted">配信状況</p>
                <p className="text-sm font-bold text-foreground">
                  {detail.streamingStatus === "配信中！" ? (
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#fb2c36] animate-pulse" />
                      {detail.streamingStatus}
                    </span>
                  ) : (
                    detail.streamingStatus
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-5 py-4 shadow-sm">
              <span className="text-xl">💬</span>
              <div>
                <p className="text-xs font-bold text-muted">バズ状況</p>
                <p className={`text-sm font-bold ${detail.buzzStatus === "急上昇" ? "text-[#00d492]" : "text-foreground"}`}>
                  {detail.buzzStatus}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Support Rate */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-live to-[#fb64b6]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#e7000b] tracking-tight">
              💖 予想支持率
            </h2>
          </div>
          <div className="rounded-2xl bg-white/70 border border-white/80 p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ecfeff] to-[#f0f9ff]">
                <span className="font-[family-name:var(--font-outfit)] text-xl font-black text-primary-dark">
                  {detail.supportRate}%
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">
                  ファンの{detail.supportRate}%が上位入りを予想
                </p>
                <p className="text-xs text-muted mt-0.5">
                  全ユーザーの予想データに基づく支持率
                </p>
                <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-live to-[#fb64b6]"
                    style={{ width: `${detail.supportRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SNS */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-blue" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              📱 SNS / チャンネル
            </h2>
          </div>

          {/* YouTube card */}
          <div className="rounded-2xl bg-gradient-to-r from-[#dc2626] to-[#ef4444] p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-white/70 tracking-wider font-[family-name:var(--font-outfit)]">YOUTUBE CHANNEL</p>
                  <p className="text-sm font-bold text-white">{member.name} 公式チャンネル</p>
                  <p className="text-[11px] text-white/60">配信・動画をチェック</p>
                </div>
              </div>
              <svg className="size-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Social links */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 border border-white/80 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <svg className="size-7 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-xs font-bold text-foreground">X</span>
              <span className="text-[10px] text-muted">つぶやきをチェック</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 border border-white/80 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <svg className="size-7 text-[#e1306c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-xs font-bold text-foreground">Instagram</span>
              <span className="text-[10px] text-muted">写真をチェック</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 border border-white/80 py-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <svg className="size-7 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.98a8.18 8.18 0 004.76 1.52V7.08a4.83 4.83 0 01-1-.39z" />
              </svg>
              <span className="text-xs font-bold text-foreground">TikTok</span>
              <span className="text-[10px] text-muted">ショート動画</span>
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="mx-auto max-w-[964px] px-4 mt-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-trending to-[#00d5be]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#007a55] tracking-tight">
              📋 最近の動き
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {detail.activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-white/70 border border-white/80 px-5 py-3.5 shadow-sm"
              >
                <span className="w-16 shrink-0 font-[family-name:var(--font-outfit)] text-xs font-semibold text-muted">
                  {activity.time}
                </span>
                <span className="text-sm font-medium text-foreground">{activity.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[964px] px-4 mt-10 text-center">
          <Link
            href="/live/vote"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-live to-[#fb64b6] px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(255,100,103,0.3)] transition hover:shadow-[0_10px_20px_rgba(255,100,103,0.4)]"
          >
            💖 応援する →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
