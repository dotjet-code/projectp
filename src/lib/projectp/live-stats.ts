import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers, type Member } from "@/lib/data";

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

/**
 * 実データとダミーをマージした「ランキング用メンバー」型。
 * role/rank は実ポイントで並べ直したもの。
 */
export type RankedMember = Member & {
  hasLiveData: boolean;
  effectivePoints: number;
};

/**
 * 全メンバーの最新実データを一括取得し、data.ts とマージして
 * 「実ポイントで並べ直した 12人」を返す。
 *
 * 実データがあるメンバー → buzz/concurrent を差し替え、TOTAL も再計算
 * 実データが無いメンバー → data.ts のダミー値そのまま
 *
 * 並び替えのベースは effectivePoints（実データ合算 or ダミーの points）。
 * 上位6名を PLAYER、残り6名を PIT に自動振り分け。
 */
export async function getRankedMembers(): Promise<RankedMember[]> {
  const supabase = createAdminClient();

  // 1. 連携済み members を取得
  const { data: rows } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null);

  const connectedMembers = rows ?? [];
  const nameToMemberId = new Map<string, string>();
  for (const r of connectedMembers) nameToMemberId.set(r.name, r.id);

  // 2. 最新スナップショットを一括取得（連携済みメンバーぶん）
  const snapshotsByMemberId = new Map<
    string,
    { top_video_views: number | null; live_view_total: number | null }
  >();

  if (connectedMembers.length > 0) {
    const { data: snaps } = await supabase
      .from("daily_snapshots")
      .select("member_id, snapshot_date, top_video_views, live_view_total")
      .in(
        "member_id",
        connectedMembers.map((m) => m.id)
      )
      .order("snapshot_date", { ascending: false });

    // 各メンバーの最新 1件だけ採用
    for (const s of snaps ?? []) {
      if (!snapshotsByMemberId.has(s.member_id)) {
        snapshotsByMemberId.set(s.member_id, {
          top_video_views: s.top_video_views,
          live_view_total: s.live_view_total,
        });
      }
    }
  }

  // 3. data.ts の 12人をマージ
  const merged: RankedMember[] = dummyMembers.map((m) => {
    const memberId = nameToMemberId.get(m.name);
    const snap = memberId ? snapshotsByMemberId.get(memberId) : undefined;

    if (!snap) {
      return {
        ...m,
        hasLiveData: false,
        effectivePoints: m.points,
      };
    }

    const buzz = snap.top_video_views ?? 0;
    const concurrent = (snap.live_view_total ?? 0) * 10;
    // 収支はまだ実データ連携していないので、ダミー値を残す
    const revenue = m.detail.stats.revenue;
    const total = buzz + concurrent + revenue;

    return {
      ...m,
      detail: {
        ...m.detail,
        stats: {
          ...m.detail.stats,
          buzz,
          concurrent,
        },
      },
      hasLiveData: true,
      effectivePoints: total,
      points: total,
    };
  });

  // 4. effectivePoints 降順でソート → rank/role を再割り当て
  merged.sort((a, b) => b.effectivePoints - a.effectivePoints);
  return merged.map((m, i) => ({
    ...m,
    rank: i + 1,
    role: i < 6 ? "PLAYER" : "PIT",
  }));
}

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
