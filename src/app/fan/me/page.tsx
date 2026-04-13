import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createServerSupabase } from "@/lib/supabase/server";
import { getFanProfile } from "@/lib/projectp/fan-profile";
import { listRewardsForUser, REWARD_LABELS } from "@/lib/projectp/reward";
import { listPredictionsForUser } from "@/lib/projectp/prediction";
import { FanMeActions } from "./actions";

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

  const [profile, rewards, history] = await Promise.all([
    getFanProfile(user.id),
    listRewardsForUser(user.id),
    listPredictionsForUser(user.id),
  ]);

  return (
    <>
      <Header />
      <main className="pb-16">
        <section className="pt-12 pb-6 text-center">
          <p className="text-4xl mb-2">🎟️</p>
          <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            マイページ
          </h1>
        </section>

        <section className="mx-auto max-w-[520px] px-4">
          <div className="rounded-2xl bg-white/80 border border-white/80 p-6 shadow-sm space-y-4">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted">
                EMAIL
              </p>
              <p className="text-sm font-bold text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-muted">
                ステータス
              </p>
              <p className="text-sm font-bold text-foreground">
                {profile?.status ?? "active"}
              </p>
            </div>
            <div className="rounded-xl bg-[#ecfeff]/60 border border-[rgba(206,250,254,0.5)] px-4 py-3 text-xs text-muted">
              🎁 順位予想を提出すると景品（ライブ会場投票ボーナス / チェキ券）の対象になります。景品の受取りは会場限定です。
            </div>
            <FanMeActions />
          </div>
        </section>

        <section className="mx-auto max-w-[520px] px-4 mt-6">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-extrabold mb-3">
            📊 予想履歴
          </h2>
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-xs text-muted">
              まだ予想を提出していません。
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li
                  key={h.predictionId}
                  className="rounded-xl border border-gray-200 bg-white/80 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {h.periodName ?? "Stage"}
                    </p>
                    <p className="text-[10px] text-muted">
                      {h.periodStartDate} 〜 {h.periodEndDate}
                    </p>
                  </div>
                  <div className="text-right">
                    {h.scoredAt ? (
                      <>
                        <p className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark">
                          {h.totalScore ?? 0}
                          <span className="text-[10px] font-bold text-muted ml-0.5">
                            /10
                          </span>
                        </p>
                        <p className="text-[9px] text-muted">採点済</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-muted">採点待ち</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mx-auto max-w-[520px] px-4 mt-6">
          <h2 className="font-[family-name:var(--font-outfit)] text-lg font-extrabold mb-3">
            🎁 マイ景品
          </h2>
          {rewards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-xs text-muted">
              まだ景品はありません。順位予想を提出して的中させると、Stage 終了後に発行されます。
            </div>
          ) : (
            <ul className="space-y-3">
              {rewards.map((r) => {
                const used = !!r.redeemedAt;
                return (
                  <li
                    key={r.id}
                    className={`rounded-2xl border p-4 ${
                      used
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-[rgba(255,208,120,0.6)] bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8]"
                    }`}
                  >
                    <p className="text-[10px] font-semibold tracking-wider text-muted">
                      {used ? "USED" : "AVAILABLE"}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {REWARD_LABELS[r.rewardType]}
                    </p>
                    <p className="mt-2 text-2xl font-mono font-extrabold tracking-[0.25em] text-[#7a4a00] select-all">
                      {r.rewardCode}
                    </p>
                    {used ? (
                      <p className="mt-1 text-[10px] text-muted">
                        {new Date(r.redeemedAt!).toLocaleString()} 消込済
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] text-muted">
                        会場スタッフにこのコードを見せてください
                      </p>
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
