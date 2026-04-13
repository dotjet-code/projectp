import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  getStageById,
  getStageResults,
  listStages,
} from "@/lib/projectp/stage";
import { getTopPredictors } from "@/lib/projectp/prediction";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "結果発表",
  description: "確定済みステージの最終順位と的中者ランキング。",
};

const medals = ["🥇", "🥈", "🥉"];

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: stageParam } = await searchParams;

  const stages = await listStages();
  const closedStages = stages.filter((s) => s.status === "closed");

  // 表示対象の Stage を決定
  const targetStage = stageParam
    ? await getStageById(stageParam)
    : closedStages[0] ?? null;

  if (!targetStage || targetStage.status !== "closed") {
    return (
      <>
        <Header />
        <main className="pb-10">
          <section className="relative overflow-hidden bg-gradient-to-b from-[#fef9c3] via-[#fef3c6]/40 to-transparent pt-10 pb-8 text-center">
            <div className="relative">
              <p className="text-5xl mb-3">🏆</p>
              <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6] bg-clip-text text-transparent">
                結果発表
              </h1>
            </div>
          </section>

          <section className="mx-auto max-w-[720px] px-4 mt-6">
            <div className="rounded-2xl border border-[rgba(254,243,198,0.6)] bg-gradient-to-r from-[rgba(254,249,195,0.6)] to-[rgba(254,243,198,0.6)] p-8 text-center">
              <p className="text-4xl mb-3">⏳</p>
              <h2 className="text-lg font-bold text-foreground">
                まだ結果が確定していません
              </h2>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                特番が終わり順位が確定すると、ここに最終結果が表示されます。
              </p>
              <Link
                href="/ranking"
                className="mt-4 inline-block text-xs underline text-primary-dark"
              >
                現在の暫定ランキングを見る
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const [results, topPredictors] = await Promise.all([
    getStageResults(targetStage.id),
    getTopPredictors(targetStage.id, 10).catch(() => []),
  ]);
  const seriesN = targetStage.seriesNumber;

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
            <p className="text-xs font-bold tracking-wider text-amber-700 mb-1">
              {targetStage.stageNumber !== null
                ? `ステージ ${targetStage.stageNumber}`
                : "ステージ"}
            </p>
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6] bg-clip-text text-transparent">
              {targetStage.title ?? targetStage.name}
            </h1>
            {targetStage.subtitle && (
              <p className="mt-1 text-sm text-muted">{targetStage.subtitle}</p>
            )}
            <p className="mt-2 text-xs text-muted">
              {targetStage.startDate} 〜 {targetStage.endDate}
            </p>

            {seriesN !== null && (
              <Link
                href={`/series/${seriesN}`}
                className="mt-3 inline-block text-[11px] underline text-primary-dark"
              >
                Series {seriesN} 累計を見る →
              </Link>
            )}
          </div>
        </section>

        {/* Stage selector */}
        {closedStages.length > 1 && (
          <section className="mx-auto max-w-[964px] px-4 mt-4">
            <p className="text-[10px] font-semibold text-muted tracking-wider mb-2">
              過去のステージを見る
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {closedStages.map((s) => {
                const isSelected = s.id === targetStage.id;
                return (
                  <Link
                    key={s.id}
                    href={`/results?stage=${s.id}`}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {s.stageNumber !== null
                      ? `ステージ ${s.stageNumber}`
                      : ""}
                    {s.title ? ` ${s.title}` : s.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Final Ranking */}
        <section className="mx-auto max-w-[964px] px-4 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-[#ffd230] to-[#f59e0b]" />
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#b45309] tracking-tight">
              🏆 最終順位
            </h2>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-muted">
              この Stage には集計データがありません。
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((r) => {
                const isReorgLine = r.rank === 7;
                return (
                  <div key={r.memberId}>
                    {isReorgLine && (
                      <div className="relative my-3">
                        <div className="border-t-2 border-dashed border-reorg" />
                        <span className="absolute left-1/2 -translate-x-1/2 -top-3 rounded-full bg-gradient-to-r from-pit to-pit-end px-4 py-1 text-[11px] font-bold text-white tracking-wider shadow-[0_1px_3px_#fee685]">
                          ⚡ 翌月再編成ライン ⚡
                        </span>
                      </div>
                    )}

                    <Link
                      href={r.slug ? `/members/${r.slug}` : "/members"}
                      className="flex items-center gap-3 rounded-2xl bg-white/70 border border-white/80 px-4 py-3 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="w-8 shrink-0 text-center">
                        {r.rank <= 3 ? (
                          <span className="text-xl">{medals[r.rank - 1]}</span>
                        ) : (
                          <span className="font-[family-name:var(--font-outfit)] text-sm font-extrabold text-[#0092b8]">
                            #{r.rank}
                          </span>
                        )}
                      </div>

                      {r.avatarUrl && (
                        <Image
                          src={r.avatarUrl}
                          alt={r.memberName}
                          width={44}
                          height={44}
                          className="size-11 shrink-0 rounded-full object-cover object-top shadow-sm"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {r.memberName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider text-white font-[family-name:var(--font-outfit)] ${
                              r.position === "PLAYER"
                                ? "bg-gradient-to-r from-player to-player-end"
                                : "bg-gradient-to-r from-pit to-pit-end"
                            }`}
                          >
                            {r.position}
                          </span>
                          {r.specialPoints > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 border border-purple-200 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 tracking-wider font-[family-name:var(--font-outfit)]">
                              SPECIAL +{r.specialPoints.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted">
                        <div className="text-right">
                          <p className="font-bold text-[#00d3f3]">
                            {r.buzzPoints.toLocaleString()}
                          </p>
                          <p>バズ</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#2b7fff]">
                            {r.livePoints.toLocaleString()}
                          </p>
                          <p>配信</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#a684ff]">
                            {r.balancePoints.toLocaleString()}
                          </p>
                          <p>収支</p>
                        </div>
                      </div>

                      <div className="w-16 sm:w-24 shrink-0 text-right">
                        <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground">
                          {r.totalPoints.toLocaleString()}
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
          )}
        </section>

        {/* Top predictors */}
        {topPredictors.length > 0 && (
          <section className="mx-auto max-w-[720px] px-4 mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple to-[#c27aff]" />
              <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#7008e7] tracking-tight">
                🎯 的中者ランキング
              </h2>
            </div>
            <p className="text-[10px] text-muted mb-3">
              Stage 確定順位と予想を突合して自動採点（最大 10点）
            </p>
            <ul className="rounded-2xl bg-white/70 border border-white/80 divide-y divide-gray-100 overflow-hidden">
              {topPredictors.map((p) => (
                <li
                  key={p.rank}
                  className="flex items-center justify-between px-4 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 text-center font-[family-name:var(--font-outfit)] font-extrabold text-[#7008e7] shrink-0">
                      {p.rank <= 3
                        ? ["🥇", "🥈", "🥉"][p.rank - 1]
                        : `#${p.rank}`}
                    </span>
                    {p.isFan ? (
                      <span className="font-bold text-foreground truncate">
                        {p.displayName ?? "ファン会員"}
                      </span>
                    ) : (
                      <span className="font-mono text-muted">
                        {p.cookieIdMasked}
                      </span>
                    )}
                    {p.hasReward && (
                      <span className="rounded-full bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shrink-0">
                        🎁 景品獲得
                      </span>
                    )}
                    {p.entryType === "welcome" && (
                      <span className="rounded-full bg-pink-100 border border-pink-200 px-1.5 py-0.5 text-[9px] font-bold text-pink-700 shrink-0">
                        WELCOME
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-[family-name:var(--font-outfit)] text-sm font-black text-foreground">
                      {p.totalScore}
                    </span>
                    <span className="text-[9px] text-muted ml-0.5">/10</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-xl border border-[rgba(255,208,120,0.6)] bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8] px-4 py-2.5 text-[11px] text-[#7a4a00]">
              🎁 <b>会員登録すると景品対象に</b> ── 的中するとライブ会場投票のボーナス票やチェキ無料券。 <a href="/fan/login" className="underline font-bold">登録はこちら →</a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
