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
  listPredictionsForUser,
} from "@/lib/projectp/prediction";
import type { BetKey } from "@/lib/projectp/prediction";
import { DisplayNameForm, FanMeActions } from "./actions";

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
            <DisplayNameForm initial={profile?.displayName ?? null} />
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
                    className="rounded-xl border border-gray-200 bg-white/80 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {h.periodName ?? "Stage"}
                        </p>
                        <p className="text-[10px] text-muted">
                          {h.periodStartDate} 〜 {h.periodEndDate}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {h.scoredAt ? (
                          <>
                            <p className="font-[family-name:var(--font-outfit)] text-xl font-extrabold text-primary-dark">
                              {h.totalScore ?? 0}
                              <span className="text-[10px] font-bold text-muted ml-0.5">
                                /{MAX_PREDICTION_SCORE}
                              </span>
                            </p>
                            <p className="text-[9px] text-muted">採点済</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-muted">採点待ち</p>
                        )}
                      </div>
                    </div>
                    {/* 選択内容 + 的中結果 */}
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      {h.actualTop3 && (
                        <p className="text-[10px] text-muted">
                          🏁 確定:{" "}
                          <span className="font-bold text-foreground">
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
                            className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-[10px] ${
                              !isScored
                                ? "bg-gray-50"
                                : hit
                                ? "bg-emerald-50"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-muted w-12 shrink-0">
                                {BET_LABELS[k]}
                              </span>
                              <span className="text-foreground truncate">
                                {picks.length === 0
                                  ? "—"
                                  : picks.map(resolveName).join(" / ")}
                              </span>
                            </div>
                            {isScored && (
                              <span
                                className={`shrink-0 font-bold ${
                                  hit ? "text-emerald-700" : "text-gray-400"
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
                const expired = !used && isExpired(r);
                const inactive = used || expired;
                return (
                  <li
                    key={r.id}
                    className={`rounded-2xl border p-4 ${
                      inactive
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-[rgba(255,208,120,0.6)] bg-gradient-to-r from-[#fff7e6] to-[#ffe9c8]"
                    }`}
                  >
                    <p className="text-[10px] font-semibold tracking-wider text-muted">
                      {used ? "USED" : expired ? "EXPIRED" : "AVAILABLE"}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {REWARD_LABELS[r.rewardType]}
                    </p>
                    <p
                      className={`mt-2 text-2xl font-mono font-extrabold tracking-[0.25em] select-all ${
                        inactive ? "text-gray-400 line-through" : "text-[#7a4a00]"
                      }`}
                    >
                      {r.rewardCode}
                    </p>
                    {used ? (
                      <p className="mt-1 text-[10px] text-muted">
                        {new Date(r.redeemedAt!).toLocaleString()} 消込済
                      </p>
                    ) : expired ? (
                      <p className="mt-1 text-[10px] text-red-600">
                        {new Date(r.expiresAt!).toLocaleDateString()} に期限切れ
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] text-muted">
                        {r.expiresAt
                          ? `${new Date(r.expiresAt).toLocaleDateString()} までに会場で使用`
                          : "会場スタッフにこのコードを見せてください"}
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
