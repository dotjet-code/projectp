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
    "Project P の順位予想の通算ランキング。Series 内の全ステージのスコアを合算した年間王者を決める。",
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
      <main className="pb-16">
        <section className="pt-12 pb-6 text-center">
          <p className="text-5xl mb-3">👑</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#f59e0b] via-[#ef4444] to-[#8b5cf6] bg-clip-text text-transparent">
            予想ランキング
          </h1>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Series 内の全ステージを合算した通算ランキング。
            <br />
            的中を積み上げて年間王者を目指せ。
          </p>
        </section>

        {/* Series タブ */}
        {availableSeries.length > 0 && (
          <section className="mx-auto max-w-[720px] px-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 justify-center">
              {availableSeries.map((n) => {
                const active = n === selectedSeries;
                return (
                  <Link
                    key={n}
                    href={`/ranking/predictors?series=${n}`}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "bg-black text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Series {n}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 本体 */}
        <section className="mx-auto max-w-[720px] px-4">
          {!selectedSeries ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-3xl mb-2">⏳</p>
              <p className="text-sm text-muted">
                まだ確定したシリーズがありません。ステージ終了後にランキングが出ます。
              </p>
            </div>
          ) : predictors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-sm text-muted">
                Series {selectedSeries} の予想ランキングはまだ集計されていません。
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-muted mb-3 text-center">
                全ステージの合計スコア(最大 {MAX_PREDICTION_SCORE} pt × ステージ数)で順位付け。
              </p>
              <ul className="rounded-2xl bg-white/70 border border-white/80 divide-y divide-gray-100 overflow-hidden">
                {predictors.map((p) => {
                  const isMe = myUserId === p.userId;
                  return (
                    <li
                      key={p.userId}
                      className={`flex items-center justify-between px-4 py-3 text-xs ${
                        isMe
                          ? "bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8]"
                          : ""
                      }`}
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
                        {isMe && (
                          <span className="rounded-full bg-black text-white px-1.5 py-0.5 text-[9px] font-bold shrink-0">
                            YOU
                          </span>
                        )}
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
                        <span className="font-[family-name:var(--font-outfit)] text-base font-black text-foreground">
                          {p.totalScore}
                        </span>
                        <span className="text-[9px] text-muted ml-0.5">
                          pt / {p.stageCount}stage
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {!myUserId && (
                <div className="mt-4 rounded-xl border border-[rgba(255,208,120,0.6)] bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8] px-4 py-2.5 text-[11px] text-[#7a4a00] text-center">
                  🎟️ <b>会員登録するとランキング入り</b> ── 的中を積み上げて年間王者を狙おう。{" "}
                  <Link href="/fan/login" className="underline font-bold">
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
