import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { members } from "@/lib/data";

const finalRanking = [...members].sort((a, b) => a.rank - b.rank);
const top3 = finalRanking.slice(0, 3);
const runnerUp = finalRanking.slice(3, 6);
const lower = finalRanking.slice(6);

const medals = ["🥇", "🥈", "🥉"];
const top3Sizes = ["size-20", "size-16", "size-16"];
const top3Rings = ["ring-4 ring-[#ffd230]", "ring-2 ring-gray-300", "ring-2 ring-[#cd7f32]"];

const predictionResults = [
  {
    division: "PLAYER",
    type: "連単",
    color: "from-player to-player-end",
    results: [
      { place: 1, name: "塩見きら" },
      { place: 2, name: "ねこみ。" },
    ],
    hitCount: 234,
  },
  {
    division: "PLAYER",
    type: "3連単",
    color: "from-player to-player-end",
    results: [
      { place: 1, name: "塩見きら" },
      { place: 2, name: "ねこみ。" },
      { place: 3, name: "阿久津真央" },
    ],
    hitCount: 42,
  },
  {
    division: "PIT",
    type: "連単",
    color: "from-pit to-pit-end",
    results: [
      { place: 1, name: "せなももか" },
      { place: 2, name: "清宮みゆ" },
    ],
    hitCount: 189,
  },
  {
    division: "PIT",
    type: "3連単",
    color: "from-pit to-pit-end",
    results: [
      { place: 1, name: "せなももか" },
      { place: 2, name: "清宮みゆ" },
      { place: 3, name: "佐々木泉" },
    ],
    hitCount: 31,
  },
];

const highlights = [
  { icon: "✨", title: "最終逆転", desc: "塩見きらが最終盤で逆転し首位奪取" },
  { icon: "🚀", title: "急上昇ドラマ", desc: "清宮みゆが9位から7位に2ランクUP" },
  { icon: "📺", title: "配信記録更新", desc: "阿久津真央の配信が同接1,500人を記録" },
];

const nextPlayer = finalRanking.filter((m) => m.rank <= 6);
const nextPit = finalRanking.filter((m) => m.rank > 6);

export default function ResultsPage() {
  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fef9c3] via-[#fef3c6]/40 to-transparent pt-10 pb-8 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-[20%] top-[10%] size-32 rounded-full bg-[#ffd230] blur-[60px]" />
            <div className="absolute right-[20%] top-[20%] size-24 rounded-full bg-primary blur-[50px]" />
          </div>
          <div className="relative">
            <p className="text-5xl mb-3">🏆</p>
            <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6] bg-clip-text text-transparent">
              今月の最終結果
            </h1>
            <p className="mt-2 text-sm text-muted">
              2026年4月クール — 全レース終了
            </p>
          </div>
        </section>

        {/* Final Ranking - Top 3 */}
        <section className="mx-auto max-w-[964px] px-4 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#ffd230] to-[#f59e0b]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#b45309] tracking-tight">
              🏆 最終順位
            </h2>
          </div>

          {/* Top 3 cards — display order: 2nd, 1st, 3rd */}
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-5 mb-6">
            {[top3[1], top3[0], top3[2]].map((member) => {
              const i = top3.indexOf(member);
              const isFirst = i === 0;
              return (
                <Link
                  key={member.id}
                  href={`/members/${member.slug}`}
                  className={`group relative flex flex-col items-center rounded-2xl bg-white border border-white/80 shadow-sm hover:shadow-md transition-all ${
                    isFirst ? "p-4 sm:p-7 shadow-lg border-[#ffd230]/40" : "p-3 sm:p-5"
                  }`}
                >
                  <span className={`absolute left-1/2 -translate-x-1/2 ${isFirst ? "-top-4 text-4xl" : "-top-3 text-3xl"}`}>
                    {medals[i]}
                  </span>
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={isFirst ? 104 : 80}
                    height={isFirst ? 104 : 80}
                    className={`${isFirst ? "size-16 sm:size-26" : "size-12 sm:size-16"} mt-4 rounded-full object-cover object-top shadow-md ${top3Rings[i]}`}
                  />
                  <p className={`mt-2 sm:mt-3 font-bold text-foreground group-hover:text-primary-dark transition-colors ${isFirst ? "text-sm sm:text-lg" : "text-xs sm:text-base"}`}>
                    {member.name}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                      member.role === "PLAYER"
                        ? "bg-gradient-to-r from-player to-player-end"
                        : "bg-gradient-to-r from-pit to-pit-end"
                    }`}
                  >
                    {member.role}
                  </span>
                  <p className={`mt-2 font-[family-name:var(--font-outfit)] font-black text-[#0092b8] ${isFirst ? "text-2xl" : "text-lg"}`}>
                    {member.points.toLocaleString()}
                    <span className={`font-bold text-muted ml-1 ${isFirst ? "text-sm" : "text-xs"}`}>pts</span>
                  </p>
                </Link>
              );
            })}
          </div>

          {/* 4-6位 — 次期PLAYER確定枠 */}
          <div className="rounded-2xl border border-primary/10 bg-gradient-to-r from-[#ecfeff]/60 to-[#f0f9ff]/60 p-4 mb-4">
            <p className="text-[11px] font-bold text-primary-dark mb-3 font-[family-name:var(--font-outfit)] tracking-wider">
              ⭐ 次期 PLAYER 確定
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {runnerUp.map((member) => (
                <Link
                  key={member.id}
                  href={`/members/${member.slug}`}
                  className="flex items-center gap-3 rounded-2xl bg-white border border-white/80 px-4 py-3.5 shadow-sm hover:shadow-md transition-all group"
                >
                  <span className="w-6 font-[family-name:var(--font-outfit)] text-base font-extrabold text-[#0092b8] text-center">
                    #{member.rank}
                  </span>
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover object-top shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary-dark transition-colors">{member.name}</p>
                    <span className="inline-block rounded-full bg-gradient-to-r from-player to-player-end px-2 py-0.5 text-[9px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">
                      PLAYER
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-outfit)] text-base font-bold text-foreground">
                    {member.points.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 再編成ライン */}
          <div className="relative my-5">
            <div className="border-t-2 border-dashed border-reorg" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-gradient-to-r from-pit to-pit-end px-4 py-1 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#fee685]">
              ⚡ 翌月再編成ライン ⚡
            </span>
          </div>

          {/* 7-12位 — PIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 opacity-80">
            {lower.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.slug}`}
                className="flex items-center gap-3 rounded-2xl bg-white/50 border border-gray-100 px-4 py-3 hover:shadow-sm transition-all group"
              >
                <span className="w-6 font-[family-name:var(--font-outfit)] text-sm font-extrabold text-muted text-center">
                  #{member.rank}
                </span>
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={36}
                  height={36}
                  className="size-9 rounded-full object-cover object-top shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-primary-dark transition-colors">{member.name}</p>
                  <span className="inline-block rounded-full bg-gradient-to-r from-pit to-pit-end px-2 py-0.5 text-[9px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">
                    PIT
                  </span>
                </div>
                <span className="font-[family-name:var(--font-outfit)] text-sm font-bold text-muted">
                  {member.points.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Prediction Results */}
        <section className="mx-auto max-w-[964px] px-4 mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-primary-blue" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark tracking-tight">
              🎯 的中結果
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {predictionResults.map((pr, idx) => (
              <div key={idx} className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`rounded-full bg-gradient-to-r ${pr.color} px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]`}>
                    {pr.division}
                  </span>
                  <span className="text-sm font-bold text-foreground">{pr.type}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {pr.results.map((r, ri) => (
                    <span key={ri} className="flex items-center gap-1">
                      {ri > 0 && <span className="text-muted mx-1">→</span>}
                      <span className="font-[family-name:var(--font-outfit)] text-xs font-bold text-[#0092b8]">{r.place}.</span>
                      <span className="font-bold text-foreground">{r.name}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-gradient-to-r from-[#ecfeff] to-[#f0f9ff] px-4 py-2 text-center">
                  <span className="font-[family-name:var(--font-outfit)] text-sm font-bold text-primary-dark">
                    🎯 的中者 {pr.hitCount}名
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Celebration Banner */}
        <section className="mx-auto max-w-[964px] px-4 mt-12">
          <div className="rounded-2xl bg-gradient-to-r from-[#fef9c3] via-[#fef3c6] to-[#fef9c3] border border-[#fde68a]/50 p-8 text-center">
            <p className="text-4xl mb-3">🎊</p>
            <h3 className="text-xl font-bold text-foreground">的中おめでとう！</h3>
            <p className="mt-2 text-sm text-muted">
              見事に順位を的中させたファンの皆さん、最高です！
            </p>
          </div>
        </section>

        {/* Highlights */}
        <section className="mx-auto max-w-[964px] px-4 mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-live to-[#fb64b6]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#e7000b] tracking-tight">
              🔥 今月の名シーン
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {highlights.map((h, i) => (
              <div key={i} className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
                <p className="text-2xl mb-2">{h.icon}</p>
                <h3 className="text-sm font-bold text-foreground mb-1">{h.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Next Month Formation */}
        <section className="mx-auto max-w-[964px] px-4 mt-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-pit to-[#fdc700]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#bb4d00] tracking-tight">
              ⚡ 翌月の編成が決定
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* PLAYER */}
            <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-gradient-to-r from-player to-player-end px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">
                  PLAYER
                </span>
                <span className="text-xs font-semibold text-muted">5月のステージに立つ</span>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {nextPlayer.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/80 transition-colors"
                  >
                    <span className="w-5 font-[family-name:var(--font-outfit)] text-xs font-bold text-[#0092b8]">{member.rank}</span>
                    <Image src={member.avatarUrl} alt={member.name} width={28} height={28} className="size-7 rounded-full object-cover object-top shadow-sm" />
                    <span className="text-sm font-bold text-foreground">{member.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* PIT */}
            <div className="rounded-2xl bg-white/70 border border-white/80 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-gradient-to-r from-pit to-pit-end px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)]">
                  PIT
                </span>
                <span className="text-xs font-semibold text-muted">5月の逆襲を待つメンバー</span>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {nextPit.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.slug}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/80 transition-colors"
                  >
                    <span className="w-5 font-[family-name:var(--font-outfit)] text-xs font-bold text-[#0092b8]">{member.rank}</span>
                    <Image src={member.avatarUrl} alt={member.name} width={28} height={28} className="size-7 rounded-full object-cover object-top shadow-sm" />
                    <span className="text-sm font-bold text-foreground">{member.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Next Season CTA */}
        <section className="mx-auto max-w-[964px] px-4 mt-12 text-center">
          <Link
            href="/prediction"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-blue px-10 py-3.5 text-base font-bold text-white shadow-[0_10px_15px_rgba(83,234,253,0.4)] hover:shadow-[0_10px_20px_rgba(83,234,253,0.5)] transition-all"
          >
            🎯 次クールの予想受付中 →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
