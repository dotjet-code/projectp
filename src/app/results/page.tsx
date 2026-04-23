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
  description: "確定済みバトルステージの最終順位と的中者ランキング。",
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

          <section className="mx-auto max-w-[1100px] px-4 mt-8 bg-[#F5F1E8]">
            <div
              className="bg-[#F5F1E8] border-2 border-[#111] p-8 md:p-10 text-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(17,17,17,0.10) 0.6px, transparent 1px)",
                backgroundSize: "5px 5px",
                boxShadow: "5px 5px 0 rgba(17,17,17,0.18)",
              }}
            >
              <h2
                className="text-2xl md:text-3xl font-black text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                まだ結果が確定していません
              </h2>
              <p
                className="mt-3 text-sm text-[#4A5060] leading-relaxed"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                特番が終わり順位が確定すると、ここに最終結果が表示される。
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-2 bg-[#D41E28] text-white px-6 py-2.5 text-sm font-black hover:translate-y-0.5 transition-transform"
                  style={{
                    fontFamily: "var(--font-noto-serif), serif",
                    boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                  }}
                >
                  順位予想を提出する →
                </Link>
                <Link
                  href="/ranking"
                  className="inline-flex items-center gap-2 border-2 border-[#111] bg-white text-[#111] px-6 py-2.5 text-sm font-black hover:bg-[#FFE600] transition-colors"
                  style={{
                    fontFamily: "var(--font-noto-serif), serif",
                    boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                  }}
                >
                  現在の暫定ランキング
                </Link>
              </div>
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
      <main className="pb-10 bg-[#F5F1E8]">
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
          <section className="mx-auto max-w-[1100px] px-4 mt-6">
            <p
              className="text-[10px] font-black tracking-[0.32em] text-[#D41E28] mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ 過去バトルステージ
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {closedStages.map((s) => {
                const isSelected = s.id === targetStage.id;
                return (
                  <Link
                    key={s.id}
                    href={`/results?stage=${s.id}`}
                    className={`inline-flex items-center min-h-[44px] px-3 py-2 text-[11px] font-black border-2 tracking-wider transition-colors ${
                      isSelected
                        ? "bg-[#111] text-[#FFE600] border-[#111]"
                        : "border-[#111] text-[#111] bg-[#F5F1E8] hover:bg-white"
                    }`}
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    {s.stageNumber !== null
                      ? `バトルステージ ${s.stageNumber}`
                      : ""}
                    {s.title ? ` ${s.title}` : s.name}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Final Ranking */}
        <section className="mx-auto max-w-[1100px] px-4 mt-8">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ 最終順位
            </p>
            <h2
              className="text-2xl md:text-3xl font-black text-[#111] leading-none"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              最終順位
            </h2>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>

          {results.length === 0 ? (
            <p
              className="text-sm text-[#4A5060]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              このバトルステージには集計データがありません。
            </p>
          ) : (
            <div className="border-t-[3px] border-[#111]">
              {results.map((r) => {
                const isReorgLine = r.rank === 7;
                return (
                  <div key={r.memberId}>
                    {isReorgLine && (
                      <div className="relative my-2 py-2">
                        <div className="border-t-2 border-dashed border-[#D41E28]" />
                        <span
                          className="absolute left-1/2 -translate-x-1/2 -top-1 bg-[#D41E28] text-white px-4 py-1 text-[10px] font-black tracking-wider"
                          style={{
                            fontFamily: "var(--font-outfit)",
                            boxShadow: "2px 2px 0 rgba(17,17,17,0.22)",
                          }}
                        >
                          ━ 次バトルステージ再編成ライン ━
                        </span>
                      </div>
                    )}

                    <Link
                      href={r.slug ? `/members/${r.slug}` : "/members"}
                      className="flex items-center gap-3 md:gap-4 px-3 py-3 border-b border-[#D5CFC0] hover:bg-white/60 transition-colors group"
                    >
                      <div className="w-8 shrink-0 text-center">
                        {r.rank <= 3 ? (
                          <span className="text-2xl">{medals[r.rank - 1]}</span>
                        ) : (
                          <span
                            className="text-base font-black text-[#111] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            #{r.rank}
                          </span>
                        )}
                      </div>

                      {r.avatarUrl && (
                        <Image
                          src={r.avatarUrl}
                          alt={r.memberName}
                          width={48}
                          height={48}
                          className="w-12 h-12 shrink-0 object-cover border border-[#111]/40 md:grayscale md:contrast-125 md:group-hover:grayscale-0 md:group-hover:contrast-100 transition-[filter] duration-300"
                          style={{ objectPosition: "50% 18%" }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-base font-black text-[#111] truncate leading-tight"
                          style={{ fontFamily: "var(--font-noto-serif), serif" }}
                        >
                          {r.memberName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white ${
                              r.position === "PLAYER"
                                ? "bg-[#D41E28]"
                                : "bg-[#4A5060]"
                            }`}
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.position}
                          </span>
                          {r.specialPoints > 0 && (
                            <span
                              className="inline-flex items-center gap-1 bg-[#FFE600] text-[#111] px-1.5 py-0.5 text-[9px] font-black tracking-wider"
                              style={{ fontFamily: "var(--font-outfit)" }}
                            >
                              SPECIAL +{r.specialPoints.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-4 text-[10px]">
                        <div className="text-right">
                          <p
                            className="font-black text-[#00BCFF] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.buzzPoints.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[#4A5060]">バズ</p>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-black text-[#1447E6] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.livePoints.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[#4A5060]">配信</p>
                        </div>
                        <div className="text-right">
                          <p
                            className="font-black text-[#7A3DFF] tabular-nums"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {r.balancePoints.toLocaleString()}
                          </p>
                          <p className="text-[9px] text-[#4A5060]">収支</p>
                        </div>
                      </div>

                      <div className="w-20 sm:w-24 shrink-0 text-right">
                        <span
                          className="text-2xl md:text-3xl font-black text-[#111] tabular-nums leading-none"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {r.totalPoints.toLocaleString()}
                        </span>
                        <p
                          className="text-[9px] text-[#4A5060] mt-0.5"
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
          )}
        </section>

        {/* Top predictors */}
        {topPredictors.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 mt-14">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="inline-block w-2 h-2 bg-[#D41E28]" />
              <p
                className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ 的中
              </p>
              <h2
                className="text-2xl md:text-3xl font-black text-[#111] leading-none"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                的中者ランキング
              </h2>
              <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
            </div>
            <p
              className="text-[11px] text-[#4A5060] mb-4"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              バトルステージ確定順位と 6 賭式予想を突合して自動採点（最大 {MAX_PREDICTION_SCORE} 点）。
            </p>
            <ul className="border-t-[3px] border-b-[3px] border-[#111] divide-y divide-[#111]/15 bg-[#F5F1E8]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
                backgroundSize: "5px 5px",
              }}
            >
              {topPredictors.map((p) => (
                <li
                  key={p.rank}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-7 text-center text-base font-black text-[#111] shrink-0 tabular-nums"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {p.rank <= 3
                        ? ["🥇", "🥈", "🥉"][p.rank - 1]
                        : `#${p.rank}`}
                    </span>
                    {p.isFan ? (
                      <span
                        className="font-black text-[#111] truncate"
                        style={{ fontFamily: "var(--font-noto-serif), serif" }}
                      >
                        {p.displayName ?? "ファン会員"}
                      </span>
                    ) : (
                      <span className="font-mono text-[#4A5060] text-xs">
                        {p.cookieIdMasked}
                      </span>
                    )}
                    {p.hasReward && (
                      <span
                        className="bg-[#FFE600] text-[#111] px-1.5 py-0.5 text-[9px] font-black tracking-wider shrink-0"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        🎁 景品獲得
                      </span>
                    )}
                    {p.entryType === "welcome" && (
                      <span
                        className="bg-[#ED2B86] text-white px-1.5 py-0.5 text-[9px] font-black tracking-wider shrink-0"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        WELCOME
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="text-lg font-black text-[#111] tabular-nums"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {p.totalScore}
                    </span>
                    <span
                      className="text-[10px] text-[#4A5060] ml-0.5"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      /{MAX_PREDICTION_SCORE}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div
              className="mt-4 bg-[#FFE600] border-l-4 border-[#D41E28] px-4 py-3 text-[12px] text-[#111]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <span className="text-[10px] font-black tracking-[0.3em] text-[#D41E28] mr-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ 特典
              </span>
              <b>会員登録で景品対象</b> — 的中でライブ会場投票のボーナス票やチェキ無料券。
              <a href="/fan/login" className="underline font-black ml-1 text-[#D41E28]">
                登録はこちら →
              </a>
            </div>
          </section>
        )}

        {/* Series 通算ランキング */}
        {seriesN && seriesPredictors.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 mt-14">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div className="flex items-baseline gap-3">
                <span className="inline-block w-2 h-2 bg-[#D41E28]" />
                <p
                  className="text-[10px] md:text-xs font-black tracking-[0.32em] text-[#D41E28]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  ━ シリーズ {seriesN}
                </p>
                <h2
                  className="text-2xl md:text-3xl font-black text-[#111] leading-none"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  通算ランキング
                </h2>
              </div>
              <Link
                href={`/ranking/predictors?series=${seriesN}`}
                className="text-[11px] font-black text-[#D41E28] underline"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                全体を見る →
              </Link>
            </div>
            <p
              className="text-[11px] text-[#4A5060] mb-4"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              Series {seriesN} 全バトルステージの予想を合算した年間王者ランキング（ファン会員のみ・上位 10 件）。
            </p>
            <ul className="border-t-[3px] border-b-[3px] border-[#111] divide-y divide-[#111]/15 bg-[#F5F1E8]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
                backgroundSize: "5px 5px",
              }}
            >
              {seriesPredictors.map((p) => (
                <li
                  key={p.userId}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-7 text-center text-base font-black text-[#111] shrink-0 tabular-nums"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {p.rank <= 3
                        ? ["🥇", "🥈", "🥉"][p.rank - 1]
                        : `#${p.rank}`}
                    </span>
                    <span
                      className="font-black text-[#111] truncate"
                      style={{ fontFamily: "var(--font-noto-serif), serif" }}
                    >
                      {p.displayName ?? "ファン会員"}
                    </span>
                    {p.perfectCount > 0 && (
                      <span
                        className="bg-[#FFE600] text-[#111] px-1.5 py-0.5 text-[9px] font-black tracking-wider shrink-0"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        完全的中 {p.perfectCount}
                      </span>
                    )}
                    {p.rewardCount > 0 && (
                      <span
                        className="text-[10px] text-[#4A5060] shrink-0"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        🎁×{p.rewardCount}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="text-xl font-black text-[#111] tabular-nums"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {p.totalScore}
                    </span>
                    <span
                      className="text-[10px] text-[#4A5060] ml-0.5"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
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
