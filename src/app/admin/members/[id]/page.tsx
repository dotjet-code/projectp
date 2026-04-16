import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberStageHistory } from "@/lib/projectp/stage";
import { InviteButton } from "./invite-button";
import { CopyInput } from "./copy-input";

export const dynamic = "force-dynamic";

type MemberDetail = {
  id: string;
  name: string;
  handle: string | null;
  youtube_channel_id: string | null;
  google_connected_at: string | null;
  google_scopes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recent_video_ids: unknown;
};

type SnapshotRow = {
  snapshot_date: string;
  top_video_title: string | null;
  top_video_views: number | null;
  live_view_total: number | null;
  live_broadcast_count: number | null;
  fetched_at: string;
};

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: member, error } = await supabase
    .from("members")
    .select(
      "id, name, handle, youtube_channel_id, google_connected_at, google_scopes, is_active, created_at, updated_at, recent_video_ids, auth_user_id"
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !member) notFound();

  const m = member as unknown as MemberDetail & { auth_user_id: string | null };
  const connected = Boolean(m.google_connected_at);
  const isInvited = Boolean(m.auth_user_id);

  // 直近 14 日のスナップショット
  const { data: snaps } = await supabase
    .from("daily_snapshots")
    .select(
      "snapshot_date, top_video_title, top_video_views, live_view_total, live_broadcast_count, fetched_at"
    )
    .eq("member_id", id)
    .order("snapshot_date", { ascending: false })
    .limit(14);
  const snapshots = (snaps ?? []) as SnapshotRow[];

  // 過去 Stage 履歴
  const stageHistory = await getMemberStageHistory(m.name).catch(() => []);

  // 認可 URL
  const connectUrl = `https://projectp-six.vercel.app/api/auth/google/start?member_id=${m.id}`;

  // recent_video_ids
  const videoIds = Array.isArray(m.recent_video_ids)
    ? (m.recent_video_ids as string[])
    : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{m.name}</h1>
          <InviteButton memberId={m.id} isInvited={isInvited} />
        </div>
        <Link
          href="/admin/connect"
          className="text-xs text-gray-500 hover:text-gray-900 underline"
        >
          ← メンバー管理
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 text-xs">
          <h2 className="font-bold text-foreground text-sm">基本情報</h2>
          <p>
            <span className="font-bold text-gray-500">ハンドル:</span>{" "}
            {m.handle ?? "—"}
          </p>
          <p>
            <span className="font-bold text-gray-500">YouTube Channel:</span>{" "}
            {m.youtube_channel_id ?? "—"}
          </p>
          <p>
            <span className="font-bold text-gray-500">Active:</span>{" "}
            {m.is_active ? "✅ Yes" : "❌ No"}
          </p>
          <p>
            <span className="font-bold text-gray-500">作成日:</span>{" "}
            {m.created_at.slice(0, 10)}
          </p>
          <p>
            <span className="font-bold text-gray-500">更新日:</span>{" "}
            {m.updated_at.slice(0, 10)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2 text-xs">
          <h2 className="font-bold text-foreground text-sm">Google 連携</h2>
          <p>
            <span className="font-bold text-gray-500">状態:</span>{" "}
            {connected ? (
              <span className="text-green-700">
                ✅ 連携済み ({m.google_connected_at?.slice(0, 10)})
              </span>
            ) : (
              <span className="text-gray-500">⏳ 未連携</span>
            )}
          </p>
          <p>
            <span className="font-bold text-gray-500">スコープ:</span>{" "}
            <span className="text-[10px] break-all">
              {m.google_scopes ?? "—"}
            </span>
          </p>
          <p>
            <span className="font-bold text-gray-500">認可 URL:</span>
          </p>
          <CopyInput value={connectUrl} />
          <p>
            <span className="font-bold text-gray-500">
              直近動画IDキャッシュ:
            </span>{" "}
            {videoIds.length} 本
          </p>
        </div>
      </div>

      {/* Snapshot history */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">
          直近スナップショット（{snapshots.length} 日分）
        </h2>
        {snapshots.length === 0 ? (
          <p className="text-xs text-gray-500">
            スナップショットがまだありません。
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-3 py-2 font-bold text-muted">日付</th>
                  <th className="px-3 py-2 font-bold text-muted">
                    バズ (views)
                  </th>
                  <th className="px-3 py-2 font-bold text-muted">トップ動画</th>
                  <th className="px-3 py-2 font-bold text-muted">
                    配信視聴合計
                  </th>
                  <th className="px-3 py-2 font-bold text-muted">配信数</th>
                  <th className="px-3 py-2 font-bold text-muted">取得時刻</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr
                    key={s.snapshot_date}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-3 py-2 font-mono font-bold text-foreground">
                      {s.snapshot_date}
                    </td>
                    <td className="px-3 py-2 text-right font-[family-name:var(--font-outfit)] font-bold">
                      {s.top_video_views?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-3 py-2 truncate max-w-[200px]">
                      {s.top_video_title ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-[family-name:var(--font-outfit)]">
                      {s.live_view_total?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {s.live_broadcast_count ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {new Date(s.fetched_at).toLocaleString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Stage history */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Stage 成績 ({stageHistory.length} Stage)
        </h2>
        {stageHistory.length === 0 ? (
          <p className="text-xs text-gray-500">確定済みの Stage がありません。</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 overflow-hidden bg-white">
            {stageHistory.map((h) => (
              <li
                key={h.stageId}
                className="flex items-center justify-between px-4 py-3 text-xs"
              >
                <div>
                  <p className="font-bold text-foreground">
                    {h.stageTitle ?? h.stageName}
                  </p>
                  <p className="text-[10px] text-muted">
                    {h.startDate} 〜 {h.endDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {h.position && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-white ${
                        h.position === "PLAYER"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                    >
                      #{h.rank} {h.position}
                    </span>
                  )}
                  <span className="font-[family-name:var(--font-outfit)] font-bold text-foreground">
                    {h.totalPoints.toLocaleString()} pts
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
