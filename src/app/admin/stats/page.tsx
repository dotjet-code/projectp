import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getActiveStage,
  getStageById,
  getStageResults,
  listStages,
  type Stage,
} from "@/lib/projectp/stage";
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
  buzzPoints: number;
  livePoints: number;
  balancePoints: number;
  specialPoints: number;
  totalPoints: number;
  isFinalized: boolean;
};

async function getLiveRowsForStage(stage: Stage): Promise<Row[]> {
  const supabase = createAdminClient();

  const { data: members, error: mErr } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null)
    .order("created_at", { ascending: true });
  if (mErr) throw new Error(mErr.message);
  if (!members || members.length === 0) return [];

  const memberIds = members.map((m) => m.id);

  // 各メンバーの期間内最新スナップショット
  const { data: snaps } = await supabase
    .from("daily_snapshots")
    .select(
      "member_id, snapshot_date, top_video_title, top_video_views, live_view_total, live_broadcast_count"
    )
    .in("member_id", memberIds)
    .eq("period_id", stage.id)
    .order("snapshot_date", { ascending: false });

  const latestByMember = new Map<string, NonNullable<typeof snaps>[number]>();
  for (const s of snaps ?? []) {
    if (!latestByMember.has(s.member_id)) latestByMember.set(s.member_id, s);
  }

  // balance / special を取得
  const [{ data: balances }, { data: specials }] = await Promise.all([
    supabase
      .from("balance_entries")
      .select("member_id, amount")
      .eq("period_id", stage.id),
    supabase
      .from("special_point_entries")
      .select("member_id, points")
      .eq("period_id", stage.id),
  ]);

  const balanceMap = new Map<string, number>();
  for (const b of balances ?? []) balanceMap.set(b.member_id, Number(b.amount));

  const specialMap = new Map<string, number>();
  for (const s of specials ?? []) {
    specialMap.set(
      s.member_id,
      (specialMap.get(s.member_id) ?? 0) + Number(s.points)
    );
  }

  return members.map((m) => {
    const snap = latestByMember.get(m.id);
    const buzz = snap?.top_video_views ?? 0;
    const live = (snap?.live_view_total ?? 0) * 10;
    const balance = balanceMap.get(m.id) ?? 0;
    const special = specialMap.get(m.id) ?? 0;
    return {
      member_id: m.id,
      member_name: m.name,
      snapshot_date: snap?.snapshot_date ?? "—",
      top_video_title: snap?.top_video_title ?? null,
      top_video_views: snap?.top_video_views ?? null,
      live_view_total: snap?.live_view_total ?? null,
      live_broadcast_count: snap?.live_broadcast_count ?? null,
      buzzPoints: buzz,
      livePoints: live,
      balancePoints: balance,
      specialPoints: special,
      totalPoints: buzz + live + balance,
      isFinalized: false,
    };
  });
}

async function getClosedRowsForStage(stage: Stage): Promise<Row[]> {
  const results = await getStageResults(stage.id);
  return results.map((r) => ({
    member_id: r.memberId,
    member_name: r.memberName,
    snapshot_date: "—",
    top_video_title: null,
    top_video_views: null,
    live_view_total: null,
    live_broadcast_count: null,
    buzzPoints: r.buzzPoints,
    livePoints: r.livePoints,
    balancePoints: r.balancePoints,
    specialPoints: r.specialPoints,
    totalPoints: r.totalPoints,
    isFinalized: true,
  }));
}

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("ja-JP");
}

type BatchRunRow = {
  id: number;
  source: string;
  started_at: string;
  finished_at: string | null;
  total: number;
  succeeded_count: number;
  failed_count: number;
  failed_summary: string | null;
};

async function listRecentBatchRuns(): Promise<BatchRunRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("batch_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);
  return (data ?? []) as BatchRunRow[];
}

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: stageParam } = await searchParams;
  const stages = await listStages();
  const active = await getActiveStage();
  const batchRuns = await listRecentBatchRuns().catch(() => []);

  // 表示対象 Stage: クエリがあればそれ、無ければ active
  const selected = stageParam
    ? await getStageById(stageParam)
    : active;

  let rows: Row[] = [];
  if (selected) {
    if (selected.status === "closed") {
      rows = await getClosedRowsForStage(selected);
    } else {
      rows = await getLiveRowsForStage(selected);
    }
    // 合計で降順（closed は rank を尊重、でも active も同じ並び順で OK）
    rows.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ポイント状況</h1>
        <RunBatchButton />
      </div>

      {/* Stage selector */}
      {stages.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {stages.map((s) => {
            const isSelected = s.id === selected?.id;
            const href = s.id === active?.id ? "/admin/stats" : `/admin/stats?stage=${s.id}`;
            return (
              <Link
                key={s.id}
                href={href}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-black text-white border-black"
                    : s.status === "active"
                    ? "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    : "border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                }`}
              >
                {s.status === "active" && "● "}
                {s.stageNumber !== null ? `S${s.seriesNumber ?? "?"}-${s.stageNumber}` : ""}
                {s.title ? ` ${s.title}` : s.name}
                {s.status === "closed" && " · closed"}
              </Link>
            );
          })}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-2">
        {selected ? (
          <>
            {selected.status === "closed" ? "確定済み" : "進行中"}:{" "}
            <span className="font-bold text-foreground">
              {selected.title ?? selected.name}
            </span>{" "}
            （{selected.startDate} 〜 {selected.endDate}）
          </>
        ) : (
          <span className="text-gray-500">active なステージはありません</span>
        )}
      </p>
      <p className="text-xs text-gray-500 mb-8">
        {selected?.status === "closed"
          ? "※ 確定済み period_points の値を表示しています"
          : "※ 期間内の最新スナップショットを表示します。バッチで毎日更新されます。"}
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">
          表示するデータがありません。
          <Link href="/admin/connect" className="underline">
            メンバー管理
          </Link>
          で追加、
          <Link href="/admin/stages" className="underline ml-1">
            ステージ管理
          </Link>
          でステージを作成してください。
        </p>
      ) : (
        <div className="space-y-4">
          {rows.map((r, i) => {
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
                      {!r.isFinalized && (
                        <p className="text-xs text-gray-500">
                          snapshot: {r.snapshot_date}
                        </p>
                      )}
                      {r.isFinalized && (
                        <p className="text-xs text-gray-500">
                          確定済み
                        </p>
                      )}
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

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                    <p className="text-[10px] font-bold text-orange-700">
                      🔥 バズ
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-orange-900">
                      {formatNumber(r.buzzPoints)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                    <p className="text-[10px] font-bold text-cyan-700">
                      📡 配信
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-cyan-900">
                      {formatNumber(r.livePoints)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                    <p className="text-[10px] font-bold text-violet-700">
                      💰 収支
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-violet-900">
                      {formatNumber(r.balancePoints)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                    <p className="text-[10px] font-bold text-purple-700">
                      ⭐️ 合計
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-purple-900">
                      {formatNumber(r.totalPoints)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-pink-200 bg-pink-50 p-3">
                    <p className="text-[10px] font-bold text-pink-700">
                      SPECIAL
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-pink-900">
                      +{formatNumber(r.specialPoints)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Batch run history */}
      <section className="mt-12">
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          バッチ実行履歴（直近10件）
        </h2>
        {batchRuns.length === 0 ? (
          <p className="text-xs text-gray-500">
            まだ実行履歴がありません。
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {batchRuns.map((r) => {
              const ok = r.failed_count === 0;
              return (
                <li key={r.id} className="p-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                            ok
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ok ? "OK" : `FAIL ${r.failed_count}`}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-700 tracking-wider">
                          {r.source}
                        </span>
                        <span className="text-gray-700">
                          {new Date(r.started_at).toLocaleString("ja-JP")}
                        </span>
                      </div>
                      {r.failed_summary && (
                        <p className="mt-1 text-[10px] text-red-700 truncate">
                          {r.failed_summary}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 text-gray-500">
                      {r.succeeded_count}/{r.total}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
