import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveStage } from "./stage";

/**
 * メンバー詳細ページ用の日次推移データ取得。
 *
 * active Stage の期間内 (period_id でフィルタ) のスナップショットを
 * 古い順に並べて返す。
 */

export type TrendPoint = {
  date: string; // YYYY-MM-DD
  buzzPoints: number;
  livePoints: number;
  totalPoints: number;
};

export type TrendData = {
  stageName: string | null;
  stageTitle: string | null;
  stageStartDate: string | null;
  stageEndDate: string | null;
  points: TrendPoint[];
};

export async function getStageTrendByMemberName(
  memberName: string
): Promise<TrendData> {
  const supabase = createAdminClient();
  const stage = await getActiveStage();
  if (!stage) return { stageName: null, stageTitle: null, stageStartDate: null, stageEndDate: null, points: [] };

  const { data: m } = await supabase
    .from("members")
    .select("id")
    .eq("name", memberName)
    .maybeSingle();
  if (!m) return { stageName: stage.name, stageTitle: stage.title, stageStartDate: stage.startDate, stageEndDate: stage.endDate, points: [] };

  const { data: snaps } = await supabase
    .from("daily_snapshots")
    .select("snapshot_date, top_video_views, live_view_total")
    .eq("member_id", m.id)
    .eq("period_id", stage.id)
    .order("snapshot_date", { ascending: true });

  const points = (snaps ?? []).map((s) => {
    const buzz = Number(s.top_video_views ?? 0);
    const live = Number(s.live_view_total ?? 0) * 10;
    return {
      date: s.snapshot_date as string,
      buzzPoints: buzz,
      livePoints: live,
      totalPoints: buzz + live,
    };
  });

  return { stageName: stage.name, stageTitle: stage.title, stageStartDate: stage.startDate, stageEndDate: stage.endDate, points };
}
