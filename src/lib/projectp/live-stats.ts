import { createAdminClient } from "@/lib/supabase/admin";

/**
 * メンバー紹介ページ用の「最新実データ」取得ヘルパー。
 *
 * data.ts のメンバー名 (例: "せなももか") と Supabase members.name を照合し、
 * 連携済みならその人の最新 daily_snapshot から
 * バズ・同接の数字を返す。
 *
 * 連携していない or スナップショットが無い場合は null を返し、
 * 呼び出し側は data.ts のダミー値にフォールバックする。
 */
export type LiveMemberStats = {
  buzzPoints: number;        // = top_video_views
  livePoints: number;        // = live_view_total * 10
  liveViewTotal: number;
  liveBroadcastCount: number;
  snapshotDate: string;
  topVideoTitle: string | null;
};

export async function getLiveStatsByName(
  name: string
): Promise<LiveMemberStats | null> {
  const supabase = createAdminClient();

  const { data: member, error: mErr } = await supabase
    .from("members")
    .select("id")
    .eq("name", name)
    .not("google_refresh_token", "is", null)
    .eq("is_active", true)
    .maybeSingle();

  if (mErr || !member) return null;

  const { data: snap } = await supabase
    .from("daily_snapshots")
    .select(
      "snapshot_date, top_video_title, top_video_views, live_view_total, live_broadcast_count"
    )
    .eq("member_id", member.id)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!snap) return null;

  const liveViewTotal = snap.live_view_total ?? 0;
  return {
    buzzPoints: snap.top_video_views ?? 0,
    livePoints: liveViewTotal * 10,
    liveViewTotal,
    liveBroadcastCount: snap.live_broadcast_count ?? 0,
    snapshotDate: snap.snapshot_date,
    topVideoTitle: snap.top_video_title,
  };
}
