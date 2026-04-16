import { createAdminClient } from "@/lib/supabase/admin";
import { members as dummyMembers, type Member } from "@/lib/data";
import {
  getBalanceTotalsByStage,
  getSpecialTotalsByStage,
} from "./balance-special";
import { getActiveStage, type Stage } from "./stage";

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
 *
 * specialPoints はルール上「別レイヤー」なので effectivePoints には
 * 含めず、UI でだけ SPECIAL バッジ等で表示する。
 */
export type RankedMember = Member & {
  hasLiveData: boolean;
  effectivePoints: number;
  specialPoints: number;
};

export type RankingContext = {
  stage: Stage | null;
  members: RankedMember[];
};

/**
 * 全メンバーの最新実データを一括取得し、data.ts とマージして返す。
 *
 * ダミー数字は一切表示しない方針。
 * - 実データあり → buzz/concurrent は実データ、revenue は 0（手動入力未実装）
 * - 実データなし → すべて 0
 *
 * 並び替えは effectivePoints（実データ合算）降順。同点は名前順。
 * 上位6名を PLAYER、残り6名を PIT に自動振り分け。
 */
export async function getRankedMembers(): Promise<RankedMember[]> {
  const ctx = await getRankingContext();
  return ctx.members;
}

/**
 * active Stage を含むランキング取得。
 * Stage が無い時は全期間の最新スナップショットを使うフォールバック。
 */
export async function getRankingContext(): Promise<RankingContext> {
  const supabase = createAdminClient();
  const activeStage = await getActiveStage();

  // 1. 連携済み members を取得（boat_color も含む）
  const { data: rows } = await supabase
    .from("members")
    .select("id, name, boat_color")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null);

  const connectedMembers = (rows ?? []) as Array<{
    id: string;
    name: string;
    boat_color: number | null;
  }>;
  const nameToMemberId = new Map<string, string>();
  const nameToBoatColor = new Map<string, number | null>();
  for (const r of connectedMembers) {
    nameToMemberId.set(r.name, r.id);
    nameToBoatColor.set(r.name, r.boat_color);
  }

  // 2. 最新スナップショットを一括取得（Stage があれば期間内のものだけ）
  const snapshotsByMemberId = new Map<
    string,
    { top_video_views: number | null; live_view_total: number | null }
  >();

  if (connectedMembers.length > 0) {
    let query = supabase
      .from("daily_snapshots")
      .select("member_id, snapshot_date, top_video_views, live_view_total")
      .in(
        "member_id",
        connectedMembers.map((m) => m.id)
      )
      .order("snapshot_date", { ascending: false });

    if (activeStage) {
      query = query.eq("period_id", activeStage.id);
    }

    const { data: snaps } = await query;

    for (const s of snaps ?? []) {
      if (!snapshotsByMemberId.has(s.member_id)) {
        snapshotsByMemberId.set(s.member_id, {
          top_video_views: s.top_video_views,
          live_view_total: s.live_view_total,
        });
      }
    }
  }

  // 2.5 active Stage があれば収支・特別ポイントも取得
  const balanceMap = activeStage
    ? await getBalanceTotalsByStage(activeStage.id)
    : new Map<string, number>();
  const specialMap = activeStage
    ? await getSpecialTotalsByStage(activeStage.id)
    : new Map<string, number>();

  // 3. data.ts の 12人をマージ（ダミーは 0 で上書き）
  const merged: RankedMember[] = dummyMembers.map((m) => {
    const memberId = nameToMemberId.get(m.name);
    const snap = memberId ? snapshotsByMemberId.get(memberId) : undefined;

    const buzz = snap?.top_video_views ?? 0;
    const concurrent = (snap?.live_view_total ?? 0) * 10;
    const revenue = memberId ? (balanceMap.get(memberId) ?? 0) : 0;
    const special = memberId ? (specialMap.get(memberId) ?? 0) : 0;
    // 合計は buzz + concurrent + revenue。special は別レイヤーなので含めない
    const total = buzz + concurrent + revenue;

    // Supabase に boat_color があればそれを優先、無ければ data.ts の値
    const bc = nameToBoatColor.get(m.name) ?? m.boatColor ?? null;

    return {
      ...m,
      detail: {
        ...m.detail,
        stats: { buzz, concurrent, revenue },
      },
      hasLiveData: Boolean(snap),
      effectivePoints: total,
      specialPoints: special,
      points: total,
      boatColor: bc as 1 | 2 | 3 | 4 | 5 | 6 | null,
      isTrending: false,
      isLive: false,
    };
  });

  // 4. effectivePoints 降順ソート（Coming Soon は常に最後）
  merged.sort((a, b) => {
    const aComing = a.name === "Coming Soon" ? 1 : 0;
    const bComing = b.name === "Coming Soon" ? 1 : 0;
    if (aComing !== bComing) return aComing - bComing;
    if (b.effectivePoints !== a.effectivePoints) {
      return b.effectivePoints - a.effectivePoints;
    }
    return a.name.localeCompare(b.name, "ja");
  });
  const ranked = merged.map((m, i) => ({
    ...m,
    rank: i + 1,
    role: i < 6 ? ("PLAYER" as const) : ("PIT" as const),
  }));

  return { stage: activeStage, members: ranked };
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
