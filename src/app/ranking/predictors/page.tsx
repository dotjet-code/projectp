import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  getSeriesTopPredictors,
  listSeriesWithClosedStages,
  MAX_PREDICTION_SCORE,
} from "@/lib/projectp/prediction";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "予想ランキング",
  description:
    "かけあがり の順位予想の通算ランキング。Series 内の全バトルステージのスコアを合算した年間王者を決める。",
};

export default async function PredictorsRankingPage({
  searchParams,
}: {
  searchParams: Promise<{ series?: string }>;
}) {
  const { series: seriesParam } = await searchParams;
  const availableSeries = await listSeriesWithClosedStages();
  const selectedSeries =
    (seriesParam ? Number(seriesParam) : null) ?? availableSeries[0] ?? null;

  let predictors: Awaited<ReturnType<typeof getSeriesTopPredictors>> = [];
  if (selectedSeries) {
    predictors = await getSeriesTopPredictors(selectedSeries, 100);
  }

  // 現在ログイン中のファン ID (自分をハイライトする用)
  let myUserId: string | null = null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const role =
        (user.app_metadata as { role?: string } | null | undefined)?.role ??
        null;
      if (role !== "admin") myUserId = user.id;
    }
  } catch {
    // ignore
  }

  return (
    <>
      <Header />
      <main className="pb-16 bg-[#F5F1E8] min-h-[60vh]">
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
              TOP PREDICTORS
            </p>
            <h1
              className="mt-3 text-4xl md:text-6xl font-black leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              予想<span className="text-[#D41E28]">ランキング。</span>
            </h1>
            <div className="mt-6 max-w-2xl">
              <p
                className="text-lg md:text-2xl font-black leading-relaxed text-[#F5F1E8]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <span className="text-[#FFE600]">最も読み切った者は、誰だ。</span>
                <br />
                シリーズを貫く、的中の積み上げ。年間王者の称号は、ひとつだけ。
              </p>
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

        {/* Series タブ */}
        {availableSeries.length > 0 && (
          <section className="mx-auto max-w-[1100px] px-4 mt-8 mb-6">
            <p
              className="text-[10px] font-black tracking-[0.32em] text-[#D41E28] mb-2"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ シリーズ
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {availableSeries.map((n) => {
                const active = n === selectedSeries;
                return (
                  <Link
                    key={n}
                    href={`/ranking/predictors?series=${n}`}
                    className={`inline-flex items-center min-h-[44px] px-4 py-2 text-xs font-black border-2 tracking-wider transition-colors ${
                      active
                        ? "bg-[#111] text-[#FFE600] border-[#111]"
                        : "border-[#111] text-[#111] bg-[#F5F1E8] hover:bg-white"
                    }`}
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    Series {n}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 本体 */}
        <section className="mx-auto max-w-[1100px] px-4">
          {!selectedSeries ? (
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
                まだ確定したシリーズがありません
              </h2>
              <p
                className="mt-3 text-sm text-[#4A5060] leading-relaxed"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                バトルステージ終了後に予想ランキングが集計されて表示される。
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/prediction"
                  className="inline-flex items-center gap-2 bg-[#D41E28] text-white px-6 py-2.5 text-sm font-black hover:translate-y-0.5 transition-transform"
                  style={{
                    fontFamily: "var(--font-noto-serif), serif",
                    boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                  }}
                >
                  今のバトルステージに予想する →
                </Link>
                <Link
                  href="/ranking"
                  className="inline-flex items-center gap-2 border-2 border-[#111] bg-white text-[#111] px-6 py-2.5 text-sm font-black hover:bg-[#FFE600] transition-colors"
                  style={{
                    fontFamily: "var(--font-noto-serif), serif",
                    boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                  }}
                >
                  現在のランキングを見る
                </Link>
              </div>
            </div>
          ) : predictors.length === 0 ? (
            <div
              className="bg-[#F5F1E8] border-2 border-[#111] p-8 md:p-10 text-center"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(17,17,17,0.10) 0.6px, transparent 1px)",
                backgroundSize: "5px 5px",
                boxShadow: "5px 5px 0 rgba(17,17,17,0.18)",
              }}
            >
              <p
                className="text-sm text-[#4A5060]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                Series {selectedSeries} の予想ランキングはまだ集計されていません。
              </p>
            </div>
          ) : (
            <>
              <p
                className="text-[11px] text-[#4A5060] mb-3"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                全バトルステージの合計スコア（最大 {MAX_PREDICTION_SCORE} pt × バトルステージ数）で順位付け。
              </p>
              <ul
                className="border-t-[3px] border-b-[3px] border-[#111] divide-y divide-[#111]/15 bg-[#F5F1E8]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(17,17,17,0.08) 0.6px, transparent 1px)",
                  backgroundSize: "5px 5px",
                }}
              >
                {predictors.map((p) => {
                  const isMe = myUserId === p.userId;
                  return (
                    <li
                      key={p.userId}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        isMe ? "bg-[#FFE600]" : ""
                      }`}
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
                        {isMe && (
                          <span
                            className="bg-[#111] text-[#FFE600] px-1.5 py-0.5 text-[9px] font-black tracking-wider shrink-0"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            YOU
                          </span>
                        )}
                        {p.perfectCount > 0 && (
                          <span
                            className="bg-[#D41E28] text-white px-1.5 py-0.5 text-[9px] font-black tracking-wider shrink-0"
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
                          className="text-lg font-black text-[#111] tabular-nums"
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
                  );
                })}
              </ul>

              {!myUserId && (
                <div
                  className="mt-4 bg-[#FFE600] border-l-4 border-[#D41E28] px-4 py-3 text-[12px] text-[#111]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  <span
                    className="text-[10px] font-black tracking-[0.3em] text-[#D41E28] mr-2"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    ━ 参加
                  </span>
                  <b>会員登録でランキング入り</b> — 的中を積み上げて年間王者を狙おう。
                  <Link
                    href="/fan/login"
                    className="underline font-black ml-1 text-[#D41E28]"
                  >
                    登録はこちら →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
