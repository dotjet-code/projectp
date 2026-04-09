import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/debug/snapshots
 * 直近のスナップショットを返す（開発用）。
 */
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("daily_snapshots")
    .select(
      "id, member_id, snapshot_date, top_video_title, top_video_views, live_view_total, live_broadcast_count, live_peak_concurrent_max, fetched_at"
    )
    .order("fetched_at", { ascending: false })
    .limit(20);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ snapshots: data });
}
