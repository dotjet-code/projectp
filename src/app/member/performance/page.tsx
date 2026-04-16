import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getMemberIdByAuthUser } from "@/lib/projectp/member-dashboard";
import { getMemberPerformance } from "@/lib/projectp/member-performance";

export const dynamic = "force-dynamic";
export const metadata = { title: "パフォーマンス分析" };

export default async function MemberPerformancePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) redirect("/member/dashboard");

  const perf = await getMemberPerformance(memberId);

  const maxTotal = Math.max(...perf.stages.map((s) => s.totalPoints), 1);

  return (
    <main className="mx-auto max-w-[800px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-6">パフォーマンス分析</h1>

      {/* 強み / 弱み */}
      {(perf.strengths.length > 0 || perf.weaknesses.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[10px] font-bold text-emerald-700 mb-1">
              💪 強み
            </p>
            <p className="text-sm font-bold text-emerald-900">
              {perf.strengths.length > 0
                ? perf.strengths.join(" / ")
                : "—"}
            </p>
            <p className="text-[10px] text-emerald-700 mt-1">
              全体平均を 20%+ 上回っている指標
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[10px] font-bold text-amber-700 mb-1">
              📈 伸びしろ
            </p>
            <p className="text-sm font-bold text-amber-900">
              {perf.weaknesses.length > 0
                ? perf.weaknesses.join(" / ")
                : "—"}
            </p>
            <p className="text-[10px] text-amber-700 mt-1">
              全体平均を 20%+ 下回っている指標
            </p>
          </div>
        </div>
      )}

      {/* 全体平均との比較 */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-muted mb-3">
          📊 直近 Stage: 自分 vs 全体平均
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          {[
            {
              label: "バズ",
              me: perf.avgComparison.buzz.me,
              avg: perf.avgComparison.buzz.avg,
              color: "#00d3f3",
            },
            {
              label: "配信",
              me: perf.avgComparison.live.me,
              avg: perf.avgComparison.live.avg,
              color: "#2b7fff",
            },
            {
              label: "収支",
              me: perf.avgComparison.balance.me,
              avg: perf.avgComparison.balance.avg,
              color: "#a684ff",
            },
          ].map((c) => {
            const max = Math.max(c.me, c.avg, 1);
            return (
              <div key={c.label}>
                <p className="text-[10px] font-bold text-muted mb-1">
                  {c.label}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-10 text-right font-bold">
                      自分
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(c.me / max) * 100}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold w-12 text-right">
                      {c.me.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-10 text-right text-muted">
                      平均
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-300"
                        style={{ width: `${(c.avg / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted w-12 text-right">
                      {c.avg.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stage 推移 */}
      <section>
        <h2 className="text-sm font-bold text-muted mb-3">
          📈 Stage 別パフォーマンス
        </h2>
        {perf.stages.length === 0 ? (
          <p className="text-xs text-muted">
            まだ確定した Stage がありません。
          </p>
        ) : (
          <div className="space-y-2">
            {perf.stages.map((s) => (
              <div
                key={s.periodId}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-outfit)] text-lg font-black text-primary-dark">
                      #{s.rank}
                    </span>
                    <span className="text-xs font-bold">{s.periodName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold text-white ${
                        s.position === "PLAYER"
                          ? "bg-gradient-to-r from-player to-player-end"
                          : "bg-gradient-to-r from-pit to-pit-end"
                      }`}
                    >
                      {s.position}
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-outfit)] text-lg font-black">
                    {s.totalPoints.toLocaleString()}
                    <span className="text-[9px] text-muted ml-0.5">pts</span>
                  </span>
                </div>
                {/* ポイント内訳バー */}
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
                  <div
                    className="h-full"
                    style={{
                      width: `${(s.buzzPoints / maxTotal) * 100}%`,
                      background: "#00d3f3",
                    }}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${(s.livePoints / maxTotal) * 100}%`,
                      background: "#2b7fff",
                    }}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${(s.balancePoints / maxTotal) * 100}%`,
                      background: "#a684ff",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-1 text-[9px] text-muted">
                  <span>
                    🔵 バズ {s.buzzPoints.toLocaleString()}
                  </span>
                  <span>
                    🔷 配信 {s.livePoints.toLocaleString()}
                  </span>
                  <span>
                    🟣 収支 {s.balancePoints.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
