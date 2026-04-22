import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFanProfile } from "@/lib/projectp/fan-profile";
import { listRewardsForUser, REWARD_LABELS, isExpired } from "@/lib/projectp/reward";
import {
  BET_LABELS,
  BET_POINTS,
  MAX_PREDICTION_SCORE,
  getFanSeriesStanding,
  listPredictionsForUser,
} from "@/lib/projectp/prediction";
import type { BetKey } from "@/lib/projectp/prediction";
import {
  getChinchiroStatsByCookie,
  getSupporterRank,
} from "@/lib/projectp/shuyaku-vote";
import { VOTE_COOKIE } from "@/lib/projectp/vote-cookie";
import { StreakBadge, getStreakTier } from "@/components/streak-badge";
import { DisplayNameForm, FanMeActions } from "./actions";
import { PredictionDraftBanner } from "./draft-banner";
import { RewardQR } from "./reward-qr";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "マイページ",
};

export default async function FanMePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/fan/login");
  }

  const role =
    (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
  if (role === "admin") {
    // 管理者はファン用マイページではなく admin 側へ
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const voteCookieId = cookieStore.get(VOTE_COOKIE)?.value ?? null;

  const [profile, rewards, history, standing, chinchiroStats, supporterRank] =
    await Promise.all([
      getFanProfile(user.id),
      listRewardsForUser(user.id),
      listPredictionsForUser(user.id),
      getFanSeriesStanding(user.id),
      voteCookieId
        ? getChinchiroStatsByCookie(voteCookieId).catch(() => null)
        : Promise.resolve(null),
      voteCookieId
        ? getSupporterRank(voteCookieId).catch(() => null)
        : Promise.resolve(null),
    ]);

  // メンバー名解決用
  const adminClient = createAdminClient();
  const { data: memberRows } = await adminClient
    .from("members")
    .select("id, name")
    .eq("is_active", true);
  const memberNameById = new Map<string, string>(
    ((memberRows ?? []) as { id: string; name: string }[]).map((m) => [
      m.id,
      m.name,
    ])
  );
  const resolveName = (id: string | undefined): string =>
    id ? memberNameById.get(id) ?? "?" : "—";

  return (
    <>
      <Header />
      <main className="pb-16 bg-[#F5F1E8] min-h-[60vh]">
        <section className="relative bg-[#111] text-[#F5F1E8] px-6 py-10 md:py-12 overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-[#D41E28]"
            style={{
              clipPath:
                "polygon(0 30%, 4% 20%, 10% 40%, 18% 15%, 26% 45%, 34% 10%, 42% 40%, 50% 18%, 58% 42%, 66% 16%, 74% 40%, 82% 14%, 90% 42%, 96% 20%, 100% 40%, 100% 100%, 0 100%)",
            }}
            aria-hidden
          />
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="inline-block w-2 h-2 bg-[#FFE600] animate-pulse" />
              <p
                className="text-[10px] md:text-xs font-black tracking-[0.35em] text-[#FFE600]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ あなたの戦歴
              </p>
            </div>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              マイ<span className="text-[#D41E28]">ページ</span>
            </h1>
            {supporterRank && (
              <p
                className="mt-3 text-sm md:text-base text-[#F5F1E8]/90"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                応援者ランキング{" "}
                <b
                  className="text-[#FFE600] text-xl md:text-2xl"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  #{supporterRank.rank}
                </b>{" "}
                / {supporterRank.totalParticipants.toLocaleString()} 人中
                <span className="text-[#F5F1E8]/60 text-xs ml-2">
                  ({supporterRank.myValue.toLocaleString()} 票献上 · 1位は{" "}
                  {supporterRank.topValue.toLocaleString()} 票)
                </span>
              </p>
            )}
          </div>
        </section>

        <PredictionDraftBanner />

        <section className="mx-auto max-w-[520px] px-4 mt-6">
          <div
            className="bg-[#F5F1E8] border-2 border-[#111] p-5 space-y-4"
            style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.18)" }}
          >
            <div className="flex items-baseline gap-3">
              <span className="inline-block w-2 h-2 bg-[#D41E28]" />
              <p
                className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ━ アカウント
              </p>
              <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
            </div>
            <div>
              <p
                className="text-[10px] font-black tracking-[0.2em] text-[#4A5060]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                EMAIL
              </p>
              <p
                className="text-sm font-black text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {user.email}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] font-black tracking-[0.2em] text-[#4A5060]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                ステータス
              </p>
              <p
                className="text-sm font-black text-[#111]"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                {profile?.status ?? "active"}
              </p>
            </div>
            <DisplayNameForm initial={profile?.displayName ?? null} />
            <div
              className="bg-[#FFE600] border-l-4 border-[#D41E28] px-4 py-3 text-xs text-[#111]"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              🎁 <b>景品について</b> — 順位予想を提出すると、ライブ会場のボーナス票やチェキ券の対象に。景品の受取りは会場限定。
            </div>
            <FanMeActions />
          </div>
        </section>

        {standing && (
          <section className="mx-auto max-w-[520px] px-4 mt-6">
            <a
              href={`/ranking/predictors?series=${standing.seriesNumber}`}
              className="block bg-[#FFE600] border-2 border-[#111] p-5 transition-transform active:translate-y-0.5"
              style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.22)" }}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="inline-block w-2 h-2 bg-[#D41E28]" />
                  <p
                    className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    ━ シリーズ {standing.seriesNumber} 通算
                  </p>
                </div>
                <span
                  className="text-[10px] text-[#111] underline font-black"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  ランキング →
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-5xl md:text-6xl font-black text-[#D41E28] leading-none"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  #{standing.rank}
                </span>
                <span
                  className="text-xs text-[#111]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  / {standing.totalParticipants} 人中
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="border-2 border-[#111] bg-[#F5F1E8] py-2">
                  <p
                    className="text-[9px] text-[#4A5060] tracking-wider"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    通算スコア
                  </p>
                  <p
                    className="text-lg font-black text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {standing.totalScore}
                  </p>
                </div>
                <div className="border-2 border-[#111] bg-[#F5F1E8] py-2">
                  <p
                    className="text-[9px] text-[#4A5060] tracking-wider"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    参加ステージ
                  </p>
                  <p
                    className="text-lg font-black text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {standing.stageCount}
                  </p>
                </div>
                <div className="border-2 border-[#111] bg-[#F5F1E8] py-2">
                  <p
                    className="text-[9px] text-[#4A5060] tracking-wider"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    完全的中
                  </p>
                  <p
                    className="text-lg font-black text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {standing.perfectCount}
                  </p>
                </div>
              </div>
            </a>
          </section>
        )}

        {chinchiroStats && chinchiroStats.totalRolls > 0 && (
          <section className="mx-auto max-w-[520px] px-4 mt-6">
            <div
              className="relative bg-[#F5F1E8] border-2 border-[#111] p-5"
              style={{ boxShadow: "5px 5px 0 rgba(17,17,17,0.18)" }}
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="inline-block w-2 h-2 bg-[#D41E28]" />
                <p
                  className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  ━ 賽記録
                </p>
                <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
              </div>
              <div
                className="grid grid-cols-3 gap-3 text-center"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                <div>
                  <p className="text-[9px] text-[#4A5060] tracking-wider">
                    総献上票
                  </p>
                  <p
                    className="mt-1 text-2xl font-black text-[#D41E28]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {chinchiroStats.totalValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#4A5060] tracking-wider">
                    振った日数
                  </p>
                  <p
                    className="mt-1 text-2xl font-black text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {chinchiroStats.totalRolls}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#4A5060] tracking-wider">
                    連続
                  </p>
                  <p
                    className="mt-1 text-2xl font-black text-[#111]"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {chinchiroStats.rolledToday
                      ? chinchiroStats.rolledToday.streakDays
                      : 0}
                    <span className="text-xs ml-1">日</span>
                  </p>
                  <div className="mt-1">
                    <StreakBadge
                      days={
                        chinchiroStats.rolledToday
                          ? chinchiroStats.rolledToday.streakDays
                          : 0
                      }
                      size="sm"
                    />
                  </div>
                </div>
              </div>
              {chinchiroStats.rolledToday &&
                getStreakTier(chinchiroStats.rolledToday.streakDays)
                  .nextInDays && (
                  <p
                    className="mt-3 text-center text-[11px] text-[#4A5060]"
                    style={{ fontFamily: "var(--font-noto-serif), serif" }}
                  >
                    あと{" "}
                    <b className="text-[#D41E28]">
                      {
                        getStreakTier(
                          chinchiroStats.rolledToday.streakDays,
                        ).nextInDays
                      }
                    </b>{" "}
                    日で{" "}
                    {
                      getStreakTier(chinchiroStats.rolledToday.streakDays)
                        .nextLabel
                    }{" "}
                    ランク
                  </p>
                )}
              {chinchiroStats.topMember && (
                <p
                  className="mt-3 text-center text-[11px] text-[#4A5060]"
                  style={{ fontFamily: "var(--font-noto-serif), serif" }}
                >
                  最も献上したのは{" "}
                  <b className="text-[#111]">
                    {memberNameById.get(chinchiroStats.topMember.memberId) ??
                      "?"}
                  </b>
                  ({chinchiroStats.topMember.value.toLocaleString()} 票)
                </p>
              )}
              {!chinchiroStats.rolledToday && (
                <a
                  href="/?chinchiro=1"
                  className="mt-4 inline-flex items-center justify-center w-full bg-[#D41E28] text-white px-4 py-2.5 text-sm font-black"
                  style={{
                    fontFamily: "var(--font-noto-serif), serif",
                    boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                  }}
                >
                  🎲 今日の賽を振る →
                </a>
              )}
              <p
                className="mt-2 text-[9px] text-center text-[#4A5060]/80"
                style={{ fontFamily: "var(--font-noto-serif), serif" }}
              >
                ※このブラウザでの記録 (Cookie ベース)
              </p>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[520px] px-4 mt-6">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ 予想履歴
            </p>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          {history.length === 0 ? (
            <div
              className="bg-[#F5F1E8] border-2 border-dashed border-[#111]/40 p-6 text-center"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <p className="text-sm text-[#4A5060] mb-3">
                まだ予想を提出していません。
              </p>
              <a
                href="/prediction"
                className="inline-flex items-center gap-2 bg-[#D41E28] text-white px-5 py-2 text-xs font-black"
                style={{
                  boxShadow: "3px 3px 0 rgba(17,17,17,0.22)",
                }}
              >
                予想を提出する →
              </a>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => {
                const betKeys: BetKey[] = [
                  "fukusho",
                  "tansho",
                  "nirenpuku",
                  "nirentan",
                  "sanrenpuku",
                  "sanrentan",
                ];
                return (
                  <li
                    key={h.predictionId}
                    className="bg-[#F5F1E8] border-2 border-[#111] p-3"
                    style={{ boxShadow: "3px 3px 0 rgba(17,17,17,0.15)" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className="text-xs font-black text-[#111] truncate"
                          style={{ fontFamily: "var(--font-noto-serif), serif" }}
                        >
                          {h.periodName ?? "ステージ"}
                        </p>
                        <p
                          className="text-[10px] text-[#4A5060]"
                          style={{ fontFamily: "var(--font-outfit)" }}
                        >
                          {h.periodStartDate} 〜 {h.periodEndDate}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {h.scoredAt ? (
                          <>
                            <p
                              className="text-xl font-black text-[#D41E28]"
                              style={{ fontFamily: "var(--font-outfit)" }}
                            >
                              {h.totalScore ?? 0}
                              <span className="text-[10px] font-black text-[#4A5060] ml-0.5">
                                /{MAX_PREDICTION_SCORE}
                              </span>
                            </p>
                            <p className="text-[9px] text-[#4A5060] tracking-wider">
                              採点済
                            </p>
                          </>
                        ) : (
                          <p className="text-[10px] text-[#4A5060] tracking-wider">
                            採点待ち
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#111]/20 space-y-1">
                      {h.actualTop3 && (
                        <p
                          className="text-[10px] text-[#4A5060]"
                          style={{ fontFamily: "var(--font-noto-serif), serif" }}
                        >
                          🏁 確定:{" "}
                          <span className="font-black text-[#111]">
                            {h.actualTop3
                              .map((id, i) => `${i + 1}着 ${resolveName(id)}`)
                              .join(" / ")}
                          </span>
                        </p>
                      )}
                      {betKeys.map((k) => {
                        const r = h.slotScores?.[k];
                        const hit = r?.hit === 1;
                        const picks = h.bets[k] ?? [];
                        const isScored = !!h.scoredAt;
                        return (
                          <div
                            key={k}
                            className={`flex items-center justify-between gap-2 px-2 py-1 text-[10px] ${
                              !isScored
                                ? "bg-white/50"
                                : hit
                                  ? "bg-[#FFE600]/60"
                                  : "bg-white/40"
                            }`}
                            style={{ fontFamily: "var(--font-noto-serif), serif" }}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[#4A5060] w-12 shrink-0">
                                {BET_LABELS[k]}
                              </span>
                              <span className="text-[#111] truncate">
                                {picks.length === 0
                                  ? "—"
                                  : picks.map(resolveName).join(" / ")}
                              </span>
                            </div>
                            {isScored && (
                              <span
                                className={`shrink-0 font-black ${
                                  hit ? "text-[#D41E28]" : "text-[#4A5060]/60"
                                }`}
                              >
                                {hit ? `+${BET_POINTS[k]}` : "—"}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mx-auto max-w-[520px] px-4 mt-6">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="inline-block w-2 h-2 bg-[#D41E28]" />
            <p
              className="text-[10px] font-black tracking-[0.32em] text-[#D41E28]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              ━ 景品
            </p>
            <span className="flex-1 h-px bg-[#111]/30" aria-hidden />
          </div>
          {rewards.length === 0 ? (
            <div
              className="bg-[#F5F1E8] border-2 border-dashed border-[#111]/40 p-6 text-center"
              style={{ fontFamily: "var(--font-noto-serif), serif" }}
            >
              <p className="text-sm text-[#4A5060]">
                まだ景品はありません。順位予想を的中させると、ステージ終了後に発行されます。
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rewards.map((r) => {
                const used = !!r.redeemedAt;
                const expired = !used && isExpired(r);
                const inactive = used || expired;
                return (
                  <li
                    key={r.id}
                    className={`border-2 border-[#111] p-4 ${
                      inactive ? "bg-[#F5F1E8] opacity-60" : "bg-[#FFE600]"
                    }`}
                    style={{
                      boxShadow: inactive
                        ? "none"
                        : "5px 5px 0 rgba(17,17,17,0.22)",
                    }}
                  >
                    <p
                      className="text-[10px] font-black tracking-[0.3em] text-[#D41E28]"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {used ? "消込済" : expired ? "期限切れ" : "受取可能"}
                    </p>
                    <p
                      className="text-sm font-black text-[#111]"
                      style={{ fontFamily: "var(--font-noto-serif), serif" }}
                    >
                      {REWARD_LABELS[r.rewardType]}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-mono font-black tracking-[0.25em] select-all ${
                        inactive ? "text-[#4A5060] line-through" : "text-[#111]"
                      }`}
                    >
                      {r.rewardCode}
                    </p>
                    {used ? (
                      <p
                        className="mt-1 text-[10px] text-[#4A5060]"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {new Date(r.redeemedAt!).toLocaleString("ja-JP")} 消込済
                      </p>
                    ) : expired ? (
                      <p
                        className="mt-1 text-[10px] text-[#D41E28] font-black"
                        style={{ fontFamily: "var(--font-outfit)" }}
                      >
                        {new Date(r.expiresAt!).toLocaleDateString("ja-JP")} に期限切れ
                      </p>
                    ) : (
                      <>
                        <RewardQR rewardCode={r.rewardCode} />
                        {r.expiresAt && (
                          <p
                            className="mt-1 text-[10px] text-[#4A5060] text-center"
                            style={{ fontFamily: "var(--font-outfit)" }}
                          >
                            {new Date(r.expiresAt).toLocaleDateString("ja-JP")} まで有効
                          </p>
                        )}
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
