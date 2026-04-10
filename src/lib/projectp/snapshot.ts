import { createAdminClient } from "@/lib/supabase/admin";
import { currentPeriod, stageToPeriod } from "./period";
import { getActiveStage } from "./stage";
import {
  fetchLiveAggregate,
  fetchMyChannel,
  fetchRecentVideoIds,
  fetchTopVideoInPeriod,
} from "./youtube";

export type SnapshotResult = {
  memberId: string;
  memberName: string;
  buzzPoints: number;
  livePoints: number;
  topVideoTitle: string | null;
  topVideoViews: number | null;
  liveBroadcastCount: number;
  liveViewTotal: number;
};

/**
 * 1人分のスナップショットを取得して daily_snapshots に upsert する。
 * persist=false の時は取得結果を返すだけ（dry run）。
 */
export async function takeSnapshotForMember(
  member: { id: string; name: string; google_refresh_token: string | null },
  options: { persist: boolean }
): Promise<SnapshotResult> {
  if (!member.google_refresh_token) {
    throw new Error("member is not connected to Google");
  }

  // active Stage があればそれを期間として使う。無ければ暦上の当月にフォールバック
  const activeStage = await getActiveStage();
  const period = activeStage ? stageToPeriod(activeStage) : currentPeriod();
  const channel = await fetchMyChannel(member.google_refresh_token);
  const [topVideo, live, recentVideoIds] = await Promise.all([
    fetchTopVideoInPeriod(
      member.google_refresh_token,
      channel.uploadsPlaylistId,
      period
    ),
    fetchLiveAggregate(
      member.google_refresh_token,
      channel.uploadsPlaylistId,
      period
    ),
    fetchRecentVideoIds(
      member.google_refresh_token,
      channel.uploadsPlaylistId,
      50
    ),
  ]);

  const buzzPoints = topVideo?.viewCount ?? 0;
  const livePoints = live.totalLiveViews * 10;

  if (options.persist) {
    const supabase = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("daily_snapshots").upsert(
      {
        member_id: member.id,
        snapshot_date: today,
        period_id: activeStage?.id ?? null,
        top_video_id: topVideo?.videoId ?? null,
        top_video_title: topVideo?.title ?? null,
        top_video_views: topVideo?.viewCount ?? null,
        live_view_total: live.totalLiveViews,
        live_broadcast_count: live.broadcastCount,
        live_peak_concurrent_max: live.broadcasts.reduce(
          (m, b) => Math.max(m, b.peakConcurrent),
          0
        ),
        channel_total_views: channel.viewCount,
        channel_subscriber_count: channel.subscriberCount,
        raw: {
          period,
          channel,
          topVideo,
          live,
        } as unknown as Record<string, unknown>,
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "member_id,snapshot_date" }
    );
    if (error) {
      throw new Error(`upsert failed: ${error.message}`);
    }

    // ライブ判定用の直近動画IDキャッシュも更新
    const { error: recentErr } = await supabase
      .from("members")
      .update({
        recent_video_ids: recentVideoIds,
        updated_at: new Date().toISOString(),
      })
      .eq("id", member.id);
    if (recentErr) {
      throw new Error(`recent_video_ids update failed: ${recentErr.message}`);
    }
  }

  return {
    memberId: member.id,
    memberName: member.name,
    buzzPoints,
    livePoints,
    topVideoTitle: topVideo?.title ?? null,
    topVideoViews: topVideo?.viewCount ?? null,
    liveBroadcastCount: live.broadcastCount,
    liveViewTotal: live.totalLiveViews,
  };
}
