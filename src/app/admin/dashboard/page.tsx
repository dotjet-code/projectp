import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { listStages, type Stage } from "@/lib/projectp/stage";
import { listRecentAuditLogs } from "@/lib/projectp/audit";

export const dynamic = "force-dynamic";

type MemberSummary = {
  id: string;
  name: string;
  connected: boolean;
  stagePoints: Map<string, { rank: number; total: number; position: string }>;
};

async function buildDashboardData() {
  const supabase = createAdminClient();
  const stages = await listStages();

  // 全メンバー
  const { data: membersData } = await supabase
    .from("members")
    .select("id, name, google_refresh_token")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  const members = (membersData ?? []) as Array<{
    id: string;
    name: string;
    google_refresh_token: string | null;
  }>;

  // closed stages の period_points を一括取得
  const closedIds = stages
    .filter((s) => s.status === "closed")
    .map((s) => s.id);

  let ppRows: Array<{
    period_id: string;
    member_id: string;
    rank: number | null;
    total_points: number;
    position: string | null;
  }> = [];

  if (closedIds.length > 0) {
    const { data } = await supabase
      .from("period_points")
      .select("period_id, member_id, rank, total_points, position")
      .in("period_id", closedIds);
    ppRows = (data ?? []) as typeof ppRows;
  }

  // メンバーごとの Stage 成績マップ
  const memberSummaries: MemberSummary[] = members.map((m) => {
    const stagePoints = new Map<
      string,
      { rank: number; total: number; position: string }
    >();
    for (const pp of ppRows) {
      if (pp.member_id === m.id) {
        stagePoints.set(pp.period_id, {
          rank: pp.rank ?? 0,
          total: Number(pp.total_points),
          position: pp.position ?? "PIT",
        });
      }
    }
    return {
      id: m.id,
      name: m.name,
      connected: Boolean(m.google_refresh_token),
      stagePoints,
    };
  });

  return { stages, members: memberSummaries };
}

export default async function AdminDashboardPage() {
  const { stages, members } = await buildDashboardData();
  const closedStages = stages.filter((s) => s.status === "closed");
  const activeStage = stages.find((s) => s.status === "active") ?? null;
  const auditLogs = await listRecentAuditLogs(15).catch(() => []);

  // 連携状況
  const connectedCount = members.filter((m) => m.connected).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">ダッシュボード</h1>
      <p className="text-sm text-gray-600 mb-8">
        Series 全体の進行状況を俯瞰します。
      </p>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted tracking-wider">
            メンバー
          </p>
          <p className="text-2xl font-black text-foreground font-[family-name:var(--font-outfit)]">
            {members.length}
          </p>
          <p className="text-[10px] text-muted">
            連携済み {connectedCount}/{members.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted tracking-wider">
            STAGE 数
          </p>
          <p className="text-2xl font-black text-foreground font-[family-name:var(--font-outfit)]">
            {stages.length}
          </p>
          <p className="text-[10px] text-muted">
            確定済み {closedStages.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-[10px] font-bold text-emerald-700 tracking-wider">
            現在の STAGE
          </p>
          <p className="text-sm font-bold text-foreground mt-1">
            {activeStage
              ? activeStage.title ?? activeStage.name
              : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-muted tracking-wider">
            現 STAGE 期間
          </p>
          <p className="text-xs font-bold text-foreground mt-1">
            {activeStage
              ? `${activeStage.startDate} 〜 ${activeStage.endDate}`
              : "—"}
          </p>
        </div>
      </div>

      {/* Cross-stage comparison table */}
      {closedStages.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            ステージ横断 メンバー順位
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="sticky left-0 bg-white px-4 py-3 font-bold text-muted z-10">
                    メンバー
                  </th>
                  {closedStages.map((s) => (
                    <th key={s.id} className="px-3 py-3 font-bold text-muted text-center min-w-[80px]">
                      <Link
                        href={`/admin/stages`}
                        className="hover:text-primary-dark"
                      >
                        {s.stageNumber !== null
                          ? `S${s.seriesNumber ?? "?"}-${s.stageNumber}`
                          : s.name.slice(0, 10)}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="sticky left-0 bg-white px-4 py-2.5 font-bold text-foreground z-10">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="hover:text-primary-dark"
                      >
                        {m.name}
                      </Link>
                      {!m.connected && (
                        <span className="ml-1 text-[9px] text-gray-400">
                          未連携
                        </span>
                      )}
                    </td>
                    {closedStages.map((s) => {
                      const sp = m.stagePoints.get(s.id);
                      if (!sp) {
                        return (
                          <td key={s.id} className="px-3 py-2.5 text-center text-gray-300">
                            —
                          </td>
                        );
                      }
                      return (
                        <td key={s.id} className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white ${
                              sp.position === "PLAYER"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                          >
                            #{sp.rank}
                          </span>
                          <p className="text-[10px] text-muted mt-0.5">
                            {sp.total.toLocaleString()}
                          </p>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Quick links */}
      <section>
        <h2 className="text-lg font-semibold mb-3">クイックリンク</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/stages", label: "ステージ管理", icon: "🎬" },
            { href: "/admin/connect", label: "メンバー管理", icon: "👥" },
            { href: "/admin/stats", label: "ポイント状況", icon: "📊" },
            { href: "/admin/settings", label: "設定", icon: "⚙️" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-gray-200 bg-white p-4 text-center hover:shadow-md transition-shadow"
            >
              <p className="text-2xl mb-1">{link.icon}</p>
              <p className="text-xs font-bold text-foreground">{link.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Audit log */}
      {auditLogs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3">操作ログ（直近15件）</h2>
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {auditLogs.map((log) => (
              <li key={log.id} className="px-4 py-2.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-700 tracking-wider">
                        {log.action}
                      </span>
                      {log.actor && (
                        <span className="text-[10px] text-muted">{log.actor}</span>
                      )}
                    </div>
                    {log.detail && (
                      <p className="mt-0.5 text-[11px] text-foreground truncate">
                        {log.detail}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted shrink-0">
                    {new Date(log.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
