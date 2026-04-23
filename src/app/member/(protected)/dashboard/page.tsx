import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  getMemberDashboard,
  getMemberIdByAuthUser,
  getMemberSubmissions,
} from "@/lib/projectp/member-dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "メンバーダッシュボード" };

export default async function MemberDashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/member/login");

  const memberId = await getMemberIdByAuthUser(user.id);
  if (!memberId) {
    return (
      <main className="mx-auto max-w-[800px] px-6 py-12 text-center">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-sm text-muted">
          メンバー情報が見つかりません。運営に連絡してください。
        </p>
      </main>
    );
  }

  const [dashboard, submissions] = await Promise.all([
    getMemberDashboard(memberId),
    getMemberSubmissions(memberId),
  ]);

  if (!dashboard) {
    return (
      <main className="mx-auto max-w-[800px] px-6 py-12 text-center">
        <p className="text-sm text-muted">データを取得できませんでした。</p>
      </main>
    );
  }

  const pendingSubmissions = submissions.filter(
    (s) => s.status === "pending"
  ).length;
  const rejectedSubmissions = submissions.filter(
    (s) => s.status === "rejected"
  ).length;

  return (
    <main className="mx-auto max-w-[800px] px-6 py-8">
      {/* 順位 + ポイント */}
      <div className="rounded-2xl bg-gradient-to-br from-[#ecfeff] via-[#f0f9ff] to-white border border-[rgba(206,250,254,0.5)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-primary-dark">
              現在の順位
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-outfit)] text-5xl font-black text-primary-dark">
                #{dashboard.rank}
              </span>
              <span className="text-sm text-muted">
                / {dashboard.totalMembers} 人中
              </span>
            </div>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white ${
                dashboard.role === "PLAYER"
                  ? "bg-gradient-to-r from-player to-player-end"
                  : "bg-gradient-to-r from-pit to-pit-end"
              }`}
            >
              {dashboard.role}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold tracking-wider text-muted">
              合計ポイント
            </p>
            <p className="font-[family-name:var(--font-outfit)] text-3xl font-black text-foreground">
              {dashboard.points.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted">pts</p>
          </div>
        </div>

        {dashboard.pointsToNextRank !== null && dashboard.pointsToNextRank > 0 && (
          <p className="mt-3 text-xs text-primary-dark">
            📈 あと <b>{dashboard.pointsToNextRank.toLocaleString()} pts</b> で{" "}
            {dashboard.rank - 1} 位に追いつけます
          </p>
        )}
      </div>

      {/* ポイント内訳 */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          {
            label: "バズ",
            value: dashboard.stats.buzz,
            color: "from-[#00d3f3] to-[#00bcff]",
          },
          {
            label: "配信",
            value: dashboard.stats.concurrent,
            color: "from-[#2b7fff] to-[#5b9bff]",
          },
          {
            label: "収支",
            value: dashboard.stats.revenue,
            color: "from-[#a684ff] to-[#c27aff]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white border border-gray-200 p-4 text-center"
          >
            <p className="text-[10px] font-semibold text-muted">{s.label}</p>
            <p className="mt-1 font-[family-name:var(--font-outfit)] text-2xl font-black text-foreground">
              {s.value.toLocaleString()}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                style={{
                  width: `${Math.min(
                    (s.value / Math.max(dashboard.points, 1)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 通知カード群 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* ファンの応援 */}
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-[10px] font-semibold text-muted">🎯 ファンの予想</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {dashboard.fanPredictionCount} 回選ばれています
          </p>
          <p className="text-[10px] text-muted">全賭式・全バトルステージ合計</p>
        </div>

        {/* 収支提出状況 */}
        <div className="rounded-xl bg-white border border-gray-200 p-4">
          <p className="text-[10px] font-semibold text-muted">
            💰 収支提出
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-lg font-bold text-foreground">
              {submissions.length} 件提出済
            </span>
          </div>
          <div className="flex gap-2 mt-1">
            {pendingSubmissions > 0 && (
              <span className="text-[10px] text-amber-700 font-bold">
                審査中 {pendingSubmissions}
              </span>
            )}
            {rejectedSubmissions > 0 && (
              <span className="text-[10px] text-red-600 font-bold">
                却下 {rejectedSubmissions}
              </span>
            )}
          </div>
          <a
            href="/member/submissions"
            className="mt-2 inline-block text-[10px] text-primary-dark font-bold underline"
          >
            提出履歴・アップロード →
          </a>
        </div>
      </div>
    </main>
  );
}
