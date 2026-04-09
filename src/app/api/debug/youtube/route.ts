import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentPeriod } from "@/lib/projectp/period";
import {
  fetchLiveAggregate,
  fetchMyChannel,
  fetchTopVideoInPeriod,
} from "@/lib/projectp/youtube";

/**
 * GET /api/debug/youtube?member_id=xxx[&persist=1]
 *
 * 指定メンバーの当月データを YouTube API から取得して返す。
 * persist=1 を付けると daily_snapshots に upsert する。
 */
export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("member_id");
  const persist = req.nextUrl.searchParams.get("persist") === "1";
  if (!memberId) {
    return NextResponse.json(
      { error: "member_id is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name, youtube_channel_id, google_refresh_token")
    .eq("id", memberId)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!member)
    return NextResponse.json({ error: "member not found" }, { status: 404 });
  if (!member.google_refresh_token)
    return NextResponse.json(
      { error: "member is not connected to Google" },
      { status: 400 }
    );

  const period = currentPeriod();

  try {
    const channel = await fetchMyChannel(member.google_refresh_token);
    const [topVideo, live] = await Promise.all([
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
    ]);

    const buzzPoints = topVideo?.viewCount ?? 0;
    const livePoints = live.totalLiveViews * 10;

    const result = {
      member: { id: member.id, name: member.name },
      period,
      channel,
      buzz: {
        topVideo,
        points: buzzPoints,
      },
      live: {
        ...live,
        points: livePoints,
      },
    };

    if (persist) {
      const today = new Date().toISOString().slice(0, 10);
      const { error: upsertError } = await supabase
        .from("daily_snapshots")
        .upsert(
          {
            member_id: member.id,
            snapshot_date: today,
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
            raw: result as unknown as Record<string, unknown>,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: "member_id,snapshot_date" }
        );
      if (upsertError) {
        return NextResponse.json(
          { ok: false, error: upsertError.message, result },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true, persisted: persist, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
