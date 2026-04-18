import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  getStageById,
  getStageResults,
  listStages,
} from "@/lib/projectp/stage";
import {
  getTopPredictors,
  getSeriesTopPredictors,
  MAX_PREDICTION_SCORE,
} from "@/lib/projectp/prediction";

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
          <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-12 md:py-16 overflow-hidden">
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
                RESULTS
              </p>
              <h1
                className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                結果<span className="text-[#D41E28]">発表。</span>
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

  const [results, topPredictors, seriesPredictors] = await Promise.all([
    getStageResults(targetStage.id),
    getTopPredictors(targetStage.id, 10).catch(() => []),
    targetStage.seriesNumber
      ? getSeriesTopPredictors(targetStage.seriesNumber, 10).catch(() => [])
      : Promise.resolve([]),
  ]);
  const seriesN = targetStage.seriesNumber;

  return (
    <>
      <Header />
      <main className="pb-10">
        {/* Hero */}
        <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-12 md:py-16 overflow-hidden">
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
              RESULTS ·{" "}
              {targetStage.stageNumber !== null
                ? `STAGE ${targetStage.stageNumber}`
                : "STAGE"}
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              {targetStage.title ?? targetStage.name}
              <span className="text-[#D41E28]">。</span>
            </h1>
            {targetStage.subtitle && (
              <p
                className="mt-3 text-sm md:text-base text-[#9BA8BF]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {targetStage.subtitle}
              </p>
            )}
            <p
              className="mt-4 text-xs font-bold tracking-widest text-[#9BA8BF]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {targetStage.startDate.replace(/-/g, ".")} —{" "}
              {targetStage.endDate.replace(/-/g, ".")}
            </p>

            {seriesN !== null && (
              <Link
                href={`/series/${seriesN}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#FFE600] hover:underline"
                style={{ fontFamily: "var(--font-outfit)" }}
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
              このステージには集計データがありません。
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
              ステージ確定順位と 6 種類の賭式予想を突合して自動採点(最大 {MAX_PREDICTION_SCORE} 点)
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
                    <span className="text-[9px] text-muted ml-0.5">
                      /{MAX_PREDICTION_SCORE}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-xl border border-[rgba(255,208,120,0.6)] bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8] px-4 py-2.5 text-[11px] text-[#7a4a00]">
              🎁 <b>会員登録すると景品対象に</b> ── 的中するとライブ会場投票のボーナス票やチェキ無料券。 <a href="/fan/login" className="underline font-bold">登録はこちら →</a>
            </div>
          </section>
        )}

        {/* Series 通算ランキング */}
        {seriesN && seriesPredictors.length > 0 && (
          <section className="mx-auto max-w-[720px] px-4 mt-12">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                <h2 className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-[#c2410c] tracking-tight">
                  👑 Series {seriesN} 通算ランキング
                </h2>
              </div>
              <Link
                href={`/ranking/predictors?series=${seriesN}`}
                className="text-[11px] font-bold text-[#c2410c] underline"
              >
                全体を見る →
              </Link>
            </div>
            <p className="text-[10px] text-muted mb-3">
              Series {seriesN} の全ステージの予想を合算した年間王者ランキング（ファン会員のみ・上位 10 件）
            </p>
            <ul className="rounded-2xl bg-white/70 border border-white/80 divide-y divide-gray-100 overflow-hidden">
              {seriesPredictors.map((p) => (
                <li
                  key={p.userId}
                  className="flex items-center justify-between px-4 py-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 text-center font-[family-name:var(--font-outfit)] font-extrabold text-[#c2410c] shrink-0">
                      {p.rank <= 3
                        ? ["🥇", "🥈", "🥉"][p.rank - 1]
                        : `#${p.rank}`}
                    </span>
                    <span className="font-bold text-foreground truncate">
                      {p.displayName ?? "ファン会員"}
                    </span>
                    {p.perfectCount > 0 && (
                      <span className="rounded-full bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shrink-0">
                        完全的中 {p.perfectCount}
                      </span>
                    )}
                    {p.rewardCount > 0 && (
                      <span className="text-[10px] text-muted shrink-0">
                        🎁×{p.rewardCount}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-foreground">
                      {p.totalScore}
                    </span>
                    <span className="text-[9px] text-muted ml-0.5">
                      pt / {p.stageCount}stage
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
