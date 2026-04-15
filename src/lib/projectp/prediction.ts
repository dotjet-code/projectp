import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stage 順位予想ヘルパー。
 * 6 種類の賭式で予想し、Stage 確定後に採点する。
 *
 * 賭式                 枠   配点
 *   fukusho     (複勝)   1   1
 *   tansho      (単勝)   1   2
 *   nirenpuku   (二連複) 2   5
 *   nirentan    (二連単) 2  10
 *   sanrenpuku  (三連複) 3  15
 *   sanrentan   (三連単) 3  30
 *                       ---- 最大 63
 */

export type PredictionEntryType = "normal" | "welcome";

export type BetKey =
  | "tansho"
  | "fukusho"
  | "nirenpuku"
  | "nirentan"
  | "sanrenpuku"
  | "sanrentan";

export const BET_SLOT_COUNTS: Record<BetKey, number> = {
  fukusho: 1,
  tansho: 1,
  nirenpuku: 2,
  nirentan: 2,
  sanrenpuku: 3,
  sanrentan: 3,
};

export const BET_POINTS: Record<BetKey, number> = {
  fukusho: 1,
  tansho: 2,
  nirenpuku: 5,
  nirentan: 10,
  sanrenpuku: 15,
  sanrentan: 30,
};

export const BET_LABELS: Record<BetKey, string> = {
  fukusho: "複勝",
  tansho: "単勝",
  nirenpuku: "二連複",
  nirentan: "二連単",
  sanrenpuku: "三連複",
  sanrentan: "三連単",
};

export const MAX_PREDICTION_SCORE = Object.values(BET_POINTS).reduce(
  (s, v) => s + v,
  0
);

export type Prediction = {
  id: number;
  cookieId: string;
  userId: string | null;
  periodId: string;
  entryType: PredictionEntryType;
  // 旧カラム(互換のため残す)
  playerWin: string[];
  playerTri: string[];
  pitWin: string[];
  pitTri: string[];
  // 新カラム
  tansho: string[];
  fukusho: string[];
  nirenpuku: string[];
  nirentan: string[];
  sanrenpuku: string[];
  sanrentan: string[];
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: number;
  cookie_id: string;
  user_id: string | null;
  period_id: string;
  entry_type: string;
  player_win: unknown;
  player_tri: unknown;
  pit_win: unknown;
  pit_tri: unknown;
  tansho: unknown;
  fukusho: unknown;
  nirenpuku: unknown;
  nirentan: unknown;
  sanrenpuku: unknown;
  sanrentan: unknown;
  created_at: string;
  updated_at: string;
};

function asIdArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function mapRow(r: Row): Prediction {
  return {
    id: r.id,
    cookieId: r.cookie_id,
    userId: r.user_id,
    periodId: r.period_id,
    entryType: (r.entry_type === "welcome" ? "welcome" : "normal"),
    playerWin: asIdArray(r.player_win),
    playerTri: asIdArray(r.player_tri),
    pitWin: asIdArray(r.pit_win),
    pitTri: asIdArray(r.pit_tri),
    tansho: asIdArray(r.tansho),
    fukusho: asIdArray(r.fukusho),
    nirenpuku: asIdArray(r.nirenpuku),
    nirentan: asIdArray(r.nirentan),
    sanrenpuku: asIdArray(r.sanrenpuku),
    sanrentan: asIdArray(r.sanrentan),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getMyPrediction(
  cookieId: string,
  periodId: string,
  userId?: string | null
): Promise<Prediction | null> {
  const supabase = createAdminClient();
  // ログイン済なら user_id で引く（Cookie がクリアされても追跡可能）
  if (userId) {
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_id", userId)
      .eq("period_id", periodId)
      .maybeSingle();
    if (data) return mapRow(data as Row);
  }
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("cookie_id", cookieId)
    .eq("period_id", periodId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Row);
}

export type PredictionBets = {
  tansho: string[];
  fukusho: string[];
  nirenpuku: string[];
  nirentan: string[];
  sanrenpuku: string[];
  sanrentan: string[];
};

export async function upsertPrediction(input: {
  cookieId: string;
  userId?: string | null;
  periodId: string;
  entryType: PredictionEntryType;
  bets: PredictionBets;
}): Promise<Prediction> {
  const supabase = createAdminClient();

  const payload = {
    cookie_id: input.cookieId,
    user_id: input.userId ?? null,
    period_id: input.periodId,
    entry_type: input.entryType,
    tansho: input.bets.tansho,
    fukusho: input.bets.fukusho,
    nirenpuku: input.bets.nirenpuku,
    nirentan: input.bets.nirentan,
    sanrenpuku: input.bets.sanrenpuku,
    sanrentan: input.bets.sanrentan,
    updated_at: new Date().toISOString(),
  };

  // ログイン済の場合は user_id を identity として扱い、
  // 同一ユーザーが複数 Cookie から重複予想しないようにする。
  if (input.userId) {
    const { data: existing } = await supabase
      .from("predictions")
      .select("id")
      .eq("user_id", input.userId)
      .eq("period_id", input.periodId)
      .maybeSingle();

    if (existing) {
      const { cookie_id: _cookie, user_id: _u, period_id: _p, ...update } =
        payload;
      void _cookie;
      void _u;
      void _p;
      const { data, error } = await supabase
        .from("predictions")
        .update({ ...update, cookie_id: input.cookieId })
        .eq("id", (existing as { id: number }).id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return mapRow(data as Row);
    }
  }

  const { data, error } = await supabase
    .from("predictions")
    .upsert(payload, { onConflict: "cookie_id,period_id" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

/**
 * Stage 内の予想数を返す（ファン会員の予想のみカウント）。
 */
export async function countPredictionsForPeriod(
  periodId: string
): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("predictions")
    .select("*", { count: "exact", head: true })
    .eq("period_id", periodId)
    .not("user_id", "is", null);
  return count ?? 0;
}

// =====================================================================
// 集計
// =====================================================================

/**
 * 賭式ごとの「この位置にこのメンバーが選ばれた件数」。
 * 単勝/複勝は positionIndex=0 のみ。
 */
export type SummarySlotTally = {
  positionIndex: number;
  rows: { memberId: string; count: number }[];
};

export type PredictionSummary = {
  totalCount: number;
  bySlot: Record<BetKey, SummarySlotTally[]>;
};

// =====================================================================
// 的中判定
// =====================================================================

/** 賭式ごとの的中判定 (0 = 外れ / 1 = 的中) と獲得ポイント */
export type BetResult = { hit: 0 | 1; points: number };

export type SlotScores = Record<BetKey, BetResult>;

export type PredictionScore = {
  predictionId: number;
  cookieId: string;
  entryType: PredictionEntryType;
  totalScore: number;
  slotScores: SlotScores;
};

/**
 * Stage 確定後、その Stage の全予想を採点して predictions に保存する。
 *
 * ルール:
 *   fukusho    : 選んだ 1 名が rank 1-3 に含まれれば 1 pt
 *   tansho     : 選んだ 1 名が rank 1 なら 2 pt
 *   nirenpuku  : 選んだ 2 名のセットが rank 1-2 と一致(順不同)なら 5 pt
 *   nirentan   : 選んだ [1着,2着] が rank 1,2 と一致(順通り)なら 10 pt
 *   sanrenpuku : 選んだ 3 名のセットが rank 1-3 と一致(順不同)なら 15 pt
 *   sanrentan  : 選んだ [1着,2着,3着] が rank 1,2,3 と一致(順通り)なら 30 pt
 *   最大 63 pt
 */
export async function scoreStagePredictions(
  periodId: string
): Promise<{ scored: number; scores: PredictionScore[] }> {
  const supabase = createAdminClient();

  // 1) period_points から確定順位の member_id を取得
  const { data: pps, error: ppsErr } = await supabase
    .from("period_points")
    .select("member_id, rank")
    .eq("period_id", periodId)
    .order("rank", { ascending: true });
  if (ppsErr) throw new Error(ppsErr.message);

  const rankToMember = new Map<number, string>();
  for (const r of pps ?? []) {
    const row = r as unknown as { member_id: string; rank: number | null };
    if (row.rank !== null) rankToMember.set(row.rank, row.member_id);
  }

  if (rankToMember.size === 0) {
    return { scored: 0, scores: [] };
  }

  const rank1 = rankToMember.get(1) ?? null;
  const rank2 = rankToMember.get(2) ?? null;
  const rank3 = rankToMember.get(3) ?? null;
  const topSet = new Set<string>(
    [rank1, rank2, rank3].filter((x): x is string => !!x)
  );

  // 2) 全予想を取得
  const { data: preds, error: predsErr } = await supabase
    .from("predictions")
    .select(
      "id, cookie_id, entry_type, tansho, fukusho, nirenpuku, nirentan, sanrenpuku, sanrentan"
    )
    .eq("period_id", periodId);
  if (predsErr) throw new Error(predsErr.message);

  const rows = (preds ?? []) as Array<{
    id: number;
    cookie_id: string;
    entry_type: string;
    tansho: unknown;
    fukusho: unknown;
    nirenpuku: unknown;
    nirentan: unknown;
    sanrenpuku: unknown;
    sanrentan: unknown;
  }>;

  const ids = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  const scores: PredictionScore[] = [];
  const nowIso = new Date().toISOString();

  for (const r of rows) {
    const tansho = ids(r.tansho);
    const fukusho = ids(r.fukusho);
    const nirenpuku = ids(r.nirenpuku);
    const nirentan = ids(r.nirentan);
    const sanrenpuku = ids(r.sanrenpuku);
    const sanrentan = ids(r.sanrentan);

    // 複勝: 1 人が rank 1-3 に含まれる
    const fukushoHit: 0 | 1 =
      fukusho[0] && topSet.has(fukusho[0]) ? 1 : 0;

    // 単勝: 1 人が rank 1 と一致
    const tanshoHit: 0 | 1 = tansho[0] && tansho[0] === rank1 ? 1 : 0;

    // 二連複: 2 人のセットが {rank1, rank2} と一致
    const nirenpukuHit: 0 | 1 =
      nirenpuku.length === 2 &&
      rank1 &&
      rank2 &&
      new Set(nirenpuku).size === 2 &&
      nirenpuku.includes(rank1) &&
      nirenpuku.includes(rank2)
        ? 1
        : 0;

    // 二連単: [rank1, rank2] 順通り
    const nirentanHit: 0 | 1 =
      nirentan[0] === rank1 && nirentan[1] === rank2 ? 1 : 0;

    // 三連複: 3 人のセットが {rank1, rank2, rank3} と一致
    const sanrenpukuHit: 0 | 1 =
      sanrenpuku.length === 3 &&
      rank1 &&
      rank2 &&
      rank3 &&
      new Set(sanrenpuku).size === 3 &&
      sanrenpuku.includes(rank1) &&
      sanrenpuku.includes(rank2) &&
      sanrenpuku.includes(rank3)
        ? 1
        : 0;

    // 三連単: [rank1, rank2, rank3] 順通り
    const sanrentanHit: 0 | 1 =
      sanrentan[0] === rank1 &&
      sanrentan[1] === rank2 &&
      sanrentan[2] === rank3
        ? 1
        : 0;

    const slot: SlotScores = {
      fukusho: { hit: fukushoHit, points: fukushoHit * BET_POINTS.fukusho },
      tansho: { hit: tanshoHit, points: tanshoHit * BET_POINTS.tansho },
      nirenpuku: {
        hit: nirenpukuHit,
        points: nirenpukuHit * BET_POINTS.nirenpuku,
      },
      nirentan: { hit: nirentanHit, points: nirentanHit * BET_POINTS.nirentan },
      sanrenpuku: {
        hit: sanrenpukuHit,
        points: sanrenpukuHit * BET_POINTS.sanrenpuku,
      },
      sanrentan: {
        hit: sanrentanHit,
        points: sanrentanHit * BET_POINTS.sanrentan,
      },
    };

    const total = Object.values(slot).reduce((s, b) => s + b.points, 0);

    scores.push({
      predictionId: r.id,
      cookieId: r.cookie_id,
      entryType: r.entry_type === "welcome" ? "welcome" : "normal",
      totalScore: total,
      slotScores: slot,
    });

    const { error: upErr } = await supabase
      .from("predictions")
      .update({
        total_score: total,
        slot_scores: slot,
        scored_at: nowIso,
      })
      .eq("id", r.id);
    if (upErr) {
      console.error("score update failed:", upErr.message);
    }
  }

  return { scored: scores.length, scores };
}

export type UserPredictionHistory = {
  predictionId: number;
  periodId: string;
  periodName: string | null;
  periodStartDate: string | null;
  periodEndDate: string | null;
  totalScore: number | null;
  slotScores: SlotScores | null;
  scoredAt: string | null;
  createdAt: string;
  // 自分の選択内容 (賭式ごとのメンバー ID 配列)
  bets: Record<BetKey, string[]>;
  // Stage の確定順位 (rank → memberId) 採点済の場合のみ入る
  actualTop3: string[] | null;
};

function parseSlotScores(v: unknown): SlotScores | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  const bet = (key: BetKey): BetResult => {
    const x = s[key];
    if (x && typeof x === "object") {
      const obj = x as { hit?: unknown; points?: unknown };
      const hit: 0 | 1 = obj.hit === 1 ? 1 : 0;
      const points =
        typeof obj.points === "number" ? obj.points : hit * BET_POINTS[key];
      return { hit, points };
    }
    return { hit: 0, points: 0 };
  };
  return {
    fukusho: bet("fukusho"),
    tansho: bet("tansho"),
    nirenpuku: bet("nirenpuku"),
    nirentan: bet("nirentan"),
    sanrenpuku: bet("sanrenpuku"),
    sanrentan: bet("sanrentan"),
  };
}

export async function listPredictionsForUser(
  userId: string
): Promise<UserPredictionHistory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("predictions")
    .select(
      "id, period_id, total_score, slot_scores, scored_at, created_at, tansho, fukusho, nirenpuku, nirentan, sanrenpuku, sanrentan, periods(name, start_date, end_date)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  type Joined = {
    id: number;
    period_id: string;
    total_score: number | null;
    slot_scores: unknown;
    scored_at: string | null;
    created_at: string;
    tansho: unknown;
    fukusho: unknown;
    nirenpuku: unknown;
    nirentan: unknown;
    sanrenpuku: unknown;
    sanrentan: unknown;
    periods:
      | { name: string | null; start_date: string | null; end_date: string | null }
      | null;
  };
  const rows = data as unknown as Joined[];

  // 採点済みの Stage の確定順位 (rank 1-3) を一括取得
  const scoredPeriodIds = rows
    .filter((r) => r.scored_at)
    .map((r) => r.period_id);
  const actualByPeriod = new Map<string, string[]>();
  if (scoredPeriodIds.length > 0) {
    const { data: pps } = await supabase
      .from("period_points")
      .select("period_id, member_id, rank")
      .in("period_id", scoredPeriodIds)
      .lte("rank", 3)
      .order("rank", { ascending: true });
    for (const p of (pps ?? []) as {
      period_id: string;
      member_id: string;
      rank: number | null;
    }[]) {
      const arr = actualByPeriod.get(p.period_id) ?? [];
      if (p.rank !== null && p.rank >= 1 && p.rank <= 3) {
        arr[p.rank - 1] = p.member_id;
      }
      actualByPeriod.set(p.period_id, arr);
    }
  }

  return rows.map((r) => ({
    predictionId: r.id,
    periodId: r.period_id,
    periodName: r.periods?.name ?? null,
    periodStartDate: r.periods?.start_date ?? null,
    periodEndDate: r.periods?.end_date ?? null,
    totalScore: r.total_score,
    slotScores: parseSlotScores(r.slot_scores),
    scoredAt: r.scored_at,
    createdAt: r.created_at,
    bets: {
      tansho: asIdArray(r.tansho),
      fukusho: asIdArray(r.fukusho),
      nirenpuku: asIdArray(r.nirenpuku),
      nirentan: asIdArray(r.nirentan),
      sanrenpuku: asIdArray(r.sanrenpuku),
      sanrentan: asIdArray(r.sanrentan),
    },
    actualTop3: actualByPeriod.get(r.period_id) ?? null,
  }));
}

export type TopPredictor = {
  rank: number;
  cookieIdMasked: string; // 表示用にマスクした Cookie ID
  totalScore: number;
  entryType: PredictionEntryType;
  isFan: boolean;            // ログイン済ファンの予想か
  displayName: string | null; // ファンユーザーの表示名
  hasReward: boolean;        // この Stage で景品を獲得したか
};

/**
 * Stage の的中スコアランキング（上位N件）。
 * cookie_id は表示用にマスク。
 */
export type FanSeriesStanding = {
  seriesNumber: number;
  rank: number;
  totalScore: number;
  stageCount: number;
  perfectCount: number;
  totalParticipants: number;
};

/**
 * ファン会員の現在の Series 通算ランキング内の位置を返す。
 * 最新の採点済み予想がある Series を対象にする。
 */
export async function getFanSeriesStanding(
  userId: string
): Promise<FanSeriesStanding | null> {
  const supabase = createAdminClient();

  // 1) このユーザーの採点済み予想から、最新の Series を見つける
  const { data: myPred } = await supabase
    .from("predictions")
    .select("period_id, periods(series_number, start_date)")
    .eq("user_id", userId)
    .not("scored_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  type MyPredJoin = {
    period_id: string;
    periods: { series_number: number | null; start_date: string | null } | null;
  };
  const latestSeries =
    (myPred as unknown as MyPredJoin | null)?.periods?.series_number ?? null;
  if (!latestSeries) return null;

  // 2) その Series の全 closed Stage
  const { data: stages } = await supabase
    .from("periods")
    .select("id")
    .eq("series_number", latestSeries)
    .eq("status", "closed");
  const stageIds = ((stages ?? []) as { id: string }[]).map((s) => s.id);
  if (stageIds.length === 0) return null;

  // 3) 全ファン予想
  const { data: preds } = await supabase
    .from("predictions")
    .select("user_id, total_score")
    .in("period_id", stageIds)
    .not("user_id", "is", null)
    .not("total_score", "is", null);

  type PredRow = { user_id: string; total_score: number | null };
  const rows = (preds ?? []) as PredRow[];

  // 4) ユーザーごとに集計
  type Agg = { totalScore: number; stageCount: number; perfectCount: number };
  const byUser = new Map<string, Agg>();
  for (const r of rows) {
    const a = byUser.get(r.user_id) ?? {
      totalScore: 0,
      stageCount: 0,
      perfectCount: 0,
    };
    const s = r.total_score ?? 0;
    a.totalScore += s;
    a.stageCount += 1;
    if (s >= MAX_PREDICTION_SCORE) a.perfectCount += 1;
    byUser.set(r.user_id, a);
  }
  const userIds = [...byUser.keys()];
  if (!byUser.has(userId)) return null;

  // 5) banned / flagged を除外
  const { data: profiles } = await supabase
    .from("fan_profiles")
    .select("user_id, status")
    .in("user_id", userIds);
  const active = new Set(
    ((profiles ?? []) as { user_id: string; status: string }[])
      .filter((p) => p.status === "active")
      .map((p) => p.user_id)
  );

  // 6) ランキング順に並べる
  const sorted = [...byUser.entries()]
    .filter(([uid]) => active.has(uid))
    .map(([uid, a]) => ({ uid, ...a }))
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.perfectCount - a.perfectCount ||
        b.stageCount - a.stageCount
    );

  const myIndex = sorted.findIndex((x) => x.uid === userId);
  if (myIndex < 0) return null;

  const my = sorted[myIndex];
  return {
    seriesNumber: latestSeries,
    rank: myIndex + 1,
    totalScore: my.totalScore,
    stageCount: my.stageCount,
    perfectCount: my.perfectCount,
    totalParticipants: sorted.length,
  };
}

export type SeriesTopPredictor = {
  rank: number;
  userId: string;
  displayName: string | null;
  totalScore: number;
  stageCount: number;
  perfectCount: number;
  rewardCount: number;
};

/**
 * 指定 Series のファン会員の予想を通算して上位を返す。
 * closed Stage かつ total_score が確定しているもののみ対象。
 */
export async function getSeriesTopPredictors(
  seriesNumber: number,
  limit = 10
): Promise<SeriesTopPredictor[]> {
  const supabase = createAdminClient();

  // 1) 対象シリーズの Stage 一覧
  const { data: stages } = await supabase
    .from("periods")
    .select("id")
    .eq("series_number", seriesNumber)
    .eq("status", "closed");
  const stageIds = ((stages ?? []) as { id: string }[]).map((s) => s.id);
  if (stageIds.length === 0) return [];

  // 2) それら Stage のファン予想
  const { data: preds } = await supabase
    .from("predictions")
    .select("user_id, total_score")
    .in("period_id", stageIds)
    .not("user_id", "is", null)
    .not("total_score", "is", null);

  type PredRow = { user_id: string; total_score: number | null };
  const rows = (preds ?? []) as PredRow[];

  // 3) ユーザーごとに累積
  type Agg = {
    totalScore: number;
    stageCount: number;
    perfectCount: number;
  };
  const byUser = new Map<string, Agg>();
  for (const r of rows) {
    const a = byUser.get(r.user_id) ?? {
      totalScore: 0,
      stageCount: 0,
      perfectCount: 0,
    };
    const score = r.total_score ?? 0;
    a.totalScore += score;
    a.stageCount += 1;
    if (score === 10) a.perfectCount += 1;
    byUser.set(r.user_id, a);
  }

  const userIds = [...byUser.keys()];
  if (userIds.length === 0) return [];

  // 4) 表示名
  const { data: profiles } = await supabase
    .from("fan_profiles")
    .select("user_id, display_name, status")
    .in("user_id", userIds);
  const nameByUser = new Map<string, string | null>();
  const activeUsers = new Set<string>();
  for (const p of (profiles ?? []) as {
    user_id: string;
    display_name: string | null;
    status: string;
  }[]) {
    nameByUser.set(p.user_id, p.display_name);
    if (p.status === "active") activeUsers.add(p.user_id);
  }

  // 5) 景品獲得数
  const { data: rewards } = await supabase
    .from("prediction_rewards")
    .select("user_id")
    .in("period_id", stageIds)
    .in("user_id", userIds);
  const rewardCountByUser = new Map<string, number>();
  for (const r of (rewards ?? []) as { user_id: string }[]) {
    rewardCountByUser.set(
      r.user_id,
      (rewardCountByUser.get(r.user_id) ?? 0) + 1
    );
  }

  // 6) active なユーザーのみランキング化、通算スコア降順 → 完全的中数 → ステージ数
  return [...byUser.entries()]
    .filter(([uid]) => activeUsers.has(uid))
    .map(([uid, a]) => ({
      userId: uid,
      displayName: nameByUser.get(uid) ?? null,
      totalScore: a.totalScore,
      stageCount: a.stageCount,
      perfectCount: a.perfectCount,
      rewardCount: rewardCountByUser.get(uid) ?? 0,
    }))
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.perfectCount - a.perfectCount ||
        b.stageCount - a.stageCount
    )
    .slice(0, limit)
    .map((x, i) => ({ rank: i + 1, ...x }));
}

export async function getTopPredictors(
  periodId: string,
  limit = 10
): Promise<TopPredictor[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("cookie_id, user_id, entry_type, total_score")
    .eq("period_id", periodId)
    .not("total_score", "is", null)
    .not("user_id", "is", null)
    .order("total_score", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    cookie_id: string;
    user_id: string | null;
    entry_type: string;
    total_score: number | null;
  }>;

  // ファンの表示名を取得
  const fanIds = rows
    .map((r) => r.user_id)
    .filter((x): x is string => !!x);
  const nameByUserId = new Map<string, string | null>();
  if (fanIds.length > 0) {
    const { data: fans } = await supabase
      .from("fan_profiles")
      .select("user_id, display_name")
      .in("user_id", fanIds);
    for (const f of (fans ?? []) as {
      user_id: string;
      display_name: string | null;
    }[]) {
      nameByUserId.set(f.user_id, f.display_name);
    }
  }

  // この Stage で景品を獲得したユーザー
  const rewardedUserIds = new Set<string>();
  if (fanIds.length > 0) {
    const { data: rs } = await supabase
      .from("prediction_rewards")
      .select("user_id")
      .eq("period_id", periodId)
      .in("user_id", fanIds);
    for (const r of (rs ?? []) as { user_id: string }[]) {
      rewardedUserIds.add(r.user_id);
    }
  }

  return rows.map((r, i) => {
    const isFan = !!r.user_id;
    const displayName = isFan ? nameByUserId.get(r.user_id!) ?? null : null;
    return {
      rank: i + 1,
      cookieIdMasked: `${r.cookie_id.slice(0, 4)}…${r.cookie_id.slice(-2)}`,
      totalScore: r.total_score ?? 0,
      entryType: r.entry_type === "welcome" ? "welcome" : "normal",
      isFan,
      displayName,
      hasReward: isFan && rewardedUserIds.has(r.user_id!),
    };
  });
}

export async function getPredictionSummary(
  periodId: string
): Promise<PredictionSummary> {
  const supabase = createAdminClient();
  // ファン会員の予想のみ集計（不正対策として匿名予想は除外）
  const { data, error } = await supabase
    .from("predictions")
    .select("tansho, fukusho, nirenpuku, nirentan, sanrenpuku, sanrentan")
    .eq("period_id", periodId)
    .not("user_id", "is", null);
  if (error) throw new Error(error.message);

  type PredRow = Record<BetKey, unknown>;
  const rows = (data ?? []) as PredRow[];

  function buildTally(
    key: BetKey,
    size: number,
    orderless = false
  ): SummarySlotTally[] {
    // 順不同の賭式はすべて positionIndex=0 にまとめて「選ばれたメンバーの総数」
    // として集計する。順序通りの賭式は各 positionIndex ごとに分けて集計。
    const slotCount = orderless ? 1 : size;
    const perPos: Map<string, number>[] = Array.from(
      { length: slotCount },
      () => new Map()
    );
    for (const r of rows) {
      const arr = r[key];
      if (!Array.isArray(arr)) continue;
      if (orderless) {
        for (const v of arr) {
          if (typeof v !== "string" || !v) continue;
          perPos[0].set(v, (perPos[0].get(v) ?? 0) + 1);
        }
      } else {
        for (let i = 0; i < size; i++) {
          const v = arr[i];
          if (typeof v !== "string" || !v) continue;
          perPos[i].set(v, (perPos[i].get(v) ?? 0) + 1);
        }
      }
    }
    return perPos.map((m, i) => ({
      positionIndex: i,
      rows: [...m.entries()]
        .map(([memberId, count]) => ({ memberId, count }))
        .sort((a, b) => b.count - a.count),
    }));
  }

  return {
    totalCount: rows.length,
    bySlot: {
      fukusho: buildTally("fukusho", 1),
      tansho: buildTally("tansho", 1),
      nirenpuku: buildTally("nirenpuku", 2, true),
      nirentan: buildTally("nirentan", 2),
      sanrenpuku: buildTally("sanrenpuku", 3, true),
      sanrentan: buildTally("sanrentan", 3),
    },
  };
}
