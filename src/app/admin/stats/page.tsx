import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentPeriod } from "@/lib/projectp/period";
import { LogoutButton } from "../logout-button";
import { RunBatchButton } from "./run-batch-button";

export const dynamic = "force-dynamic";

type Row = {
  member_id: string;
  member_name: string;
  snapshot_date: string;
  top_video_title: string | null;
  top_video_views: number | null;
  live_view_total: number | null;
  live_broadcast_count: number | null;
  live_peak_concurrent_max: number | null;
  fetched_at: string;
};

async function getLatestSnapshots(): Promise<Row[]> {
  const supabase = createAdminClient();

  // 連携済みメンバーを取得
  const { data: members, error: mErr } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null)
    .order("created_at", { ascending: true });
  if (mErr) throw new Error(mErr.message);

  if (!members || members.length === 0) return [];

  // 各メンバーの最新スナップショット
  const rows: Row[] = [];
  for (const m of members) {
    const { data: snap } = await supabase
      .from("daily_snapshots")
      .select("*")
      .eq("member_id", m.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    rows.push({
      member_id: m.id,
      member_name: m.name,
      snapshot_date: snap?.snapshot_date ?? "—",
      top_video_title: snap?.top_video_title ?? null,
      top_video_views: snap?.top_video_views ?? null,
      live_view_total: snap?.live_view_total ?? null,
      live_broadcast_count: snap?.live_broadcast_count ?? null,
      live_peak_concurrent_max: snap?.live_peak_concurrent_max ?? null,
      fetched_at: snap?.fetched_at ?? "—",
    });
  }
  return rows;
}

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("ja-JP");
}

export default async function AdminStatsPage() {
  const period = currentPeriod();
  const rows = await getLatestSnapshots();

  // ポイント計算（Project P ルール）
  const enriched = rows.map((r) => {
    const buzzPoints = r.top_video_views ?? 0;
    const livePoints = (r.live_view_total ?? 0) * 10;
    return {
      ...r,
      buzzPoints,
      livePoints,
      totalPoints: buzzPoints + livePoints,
    };
  });

  // 合計ポイントで降順ソート
  enriched.sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project P / Admin: ポイント状況</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/stages"
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            Stage 管理
          </Link>
          <Link
            href="/admin/connect"
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            メンバー管理
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="mb-4 flex items-center justify-end">
        <RunBatchButton />
      </div>
      <p className="text-sm text-gray-600 mb-2">
        集計期間: <span className="font-mono">{period.name}</span> （
        {period.startDate} 〜 {period.endDate}）
      </p>
      <p className="text-xs text-gray-500 mb-8">
        ※ 各メンバーの最新スナップショットを表示します。バッチで毎日更新されます。
      </p>

      {enriched.length === 0 ? (
        <p className="text-sm text-gray-500">
          連携済みメンバーがいません。
          <Link href="/admin/connect" className="underline">
            メンバー管理
          </Link>
          で追加してください。
        </p>
      ) : (
        <div className="space-y-4">
          {enriched.map((r, i) => {
            const rank = i + 1;
            const isPlayer = rank <= 6;
            return (
              <article
                key={r.member_id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <header className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-9 items-center justify-center rounded-full font-bold text-white ${
                        rank === 1
                          ? "bg-yellow-500"
                          : rank <= 6
                          ? "bg-blue-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {rank}
                    </span>
                    <div>
                      <h2 className="text-lg font-bold">{r.member_name}</h2>
                      <p className="text-xs text-gray-500">
                        snapshot: {r.snapshot_date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider ${
                      isPlayer
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isPlayer ? "PLAYER" : "PIT"}
                  </span>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-bold text-orange-700">
                      🔥 バズポイント
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-orange-900">
                      {formatNumber(r.buzzPoints)}
                    </p>
                    <p className="mt-2 text-xs text-orange-700/80 line-clamp-1">
                      {r.top_video_title ?? "（期間内動画なし）"}
                    </p>
                    <p className="text-[10px] text-orange-700/60">
                      最大再生 1本: {formatNumber(r.top_video_views)} views
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                    <p className="text-xs font-bold text-cyan-700">
                      📡 配信（ライブ視聴）
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-cyan-900">
                      {formatNumber(r.livePoints)}
                    </p>
                    <p className="mt-2 text-xs text-cyan-700/80">
                      ライブ {formatNumber(r.live_broadcast_count)} 配信
                    </p>
                    <p className="text-[10px] text-cyan-700/60">
                      ライブ視聴合計: {formatNumber(r.live_view_total)} × 10
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-xs font-bold text-purple-700">
                      ⭐️ 合計ポイント
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-purple-900">
                      {formatNumber(r.totalPoints)}
                    </p>
                    <p className="mt-2 text-[10px] text-purple-700/60">
                      ※ 収支ポイントは未反映
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="mt-10 rounded-xl border border-dashed border-gray-300 p-5 text-xs text-gray-600">
        <p className="font-bold mb-2">手動でデータを更新する</p>
        <p>
          バッチを手動で叩いて最新化したい場合（dev 時）：
        </p>
        <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-[11px] text-green-300">
          curl -H &quot;Authorization: Bearer dev-local-cron-secret&quot;
          {"  \\\n"}
          {"  "}http://localhost:3000/api/batch/snapshot
        </pre>
      </section>
    </main>
  );
}
