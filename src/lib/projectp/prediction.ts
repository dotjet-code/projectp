import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stage 順位予想ヘルパー。
 * 匿名 Cookie × Stage で1つの予想を upsert。
 */

export type PredictionEntryType = "normal" | "welcome";

export type Prediction = {
  id: number;
  cookieId: string;
  userId: string | null;
  periodId: string;
  entryType: PredictionEntryType;
  playerWin: string[]; // member uuid x2
  playerTri: string[]; // member uuid x3
  pitWin: string[];
  pitTri: string[];
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

export async function upsertPrediction(input: {
  cookieId: string;
  userId?: string | null;
  periodId: string;
  entryType: PredictionEntryType;
  playerWin: string[];
  playerTri: string[];
  pitWin: string[];
  pitTri: string[];
}): Promise<Prediction> {
  const supabase = createAdminClient();

  // ログイン済の場合は user_id を identity として扱い、
  // 同一ユーザーが複数 Cookie から重複予想しないようにする。
  // - 既に (user_id, period_id) の行があればそれを更新。
  // - 無ければ (cookie_id, period_id) で upsert し、user_id を紐付ける。
  if (input.userId) {
    const { data: existing } = await supabase
      .from("predictions")
      .select("id")
      .eq("user_id", input.userId)
      .eq("period_id", input.periodId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("predictions")
        .update({
          cookie_id: input.cookieId,
          entry_type: input.entryType,
          player_win: input.playerWin,
          player_tri: input.playerTri,
          pit_win: input.pitWin,
          pit_tri: input.pitTri,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (existing as { id: number }).id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return mapRow(data as Row);
    }
  }

  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        cookie_id: input.cookieId,
        user_id: input.userId ?? null,
        period_id: input.periodId,
        entry_type: input.entryType,
        player_win: input.playerWin,
        player_tri: input.playerTri,
        pit_win: input.pitWin,
        pit_tri: input.pitTri,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "cookie_id,period_id" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Row);
}

/**
 * Stage 内の予想数を返す（簡易集計）
 */
export async function countPredictionsForPeriod(
  periodId: string
): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("predictions")
    .select("*", { count: "exact", head: true })
    .eq("period_id", periodId);
  return count ?? 0;
}

// =====================================================================
// 集計
// =====================================================================

export type SlotKey = "playerWin" | "playerTri" | "pitWin" | "pitTri";

/**
 * 各スロット×順位×メンバーの投票数。
 * 例: playerWin[0] = 1着の集計 {memberId, count}[]
 */
export type SummarySlotTally = {
  positionIndex: number; // 0 = 1着, 1 = 2着, 2 = 3着
  rows: { memberId: string; count: number }[];
};

export type PredictionSummary = {
  totalCount: number;
  bySlot: Record<SlotKey, SummarySlotTally[]>;
};

// =====================================================================
// 的中判定
// =====================================================================

export type PredictionScore = {
  predictionId: number;
  cookieId: string;
  entryType: PredictionEntryType;
  totalScore: number;
  slotScores: {
    playerWin: number[]; // 0 or 1 × 2
    playerTri: number[]; // 0 or 1 × 3
    pitWin: number[];
    pitTri: number[];
  };
};

/**
 * Stage 確定後、その Stage の全予想を採点して predictions に保存する。
 *
 * スコアリングルール:
 *   PLAYER 連単:  player_win[0] が確定 rank 1 と一致なら +1、[1] が rank 2 と一致なら +1
 *   PLAYER 3連単: player_tri[i] が確定 rank i+1 と一致なら +1 ずつ
 *   PIT 連単:     pit_win[0] が確定 rank 7、[1] が rank 8
 *   PIT 3連単:    pit_tri[i] が確定 rank i+7
 *   total は全部の合計（最大 10 点）
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

  // 確定 rank が存在しない Stage（= finalize 未実行）はスコア付け不可
  if (rankToMember.size === 0) {
    return { scored: 0, scores: [] };
  }

  // 2) 全予想を取得
  const { data: preds, error: predsErr } = await supabase
    .from("predictions")
    .select("id, cookie_id, entry_type, player_win, player_tri, pit_win, pit_tri")
    .eq("period_id", periodId);
  if (predsErr) throw new Error(predsErr.message);

  const rows = (preds ?? []) as Array<{
    id: number;
    cookie_id: string;
    entry_type: string;
    player_win: unknown;
    player_tri: unknown;
    pit_win: unknown;
    pit_tri: unknown;
  }>;

  function scoreArr(
    arr: unknown,
    expectedRanks: number[]
  ): number[] {
    const out: number[] = [];
    const list = Array.isArray(arr) ? arr : [];
    for (let i = 0; i < expectedRanks.length; i++) {
      const picked = typeof list[i] === "string" ? (list[i] as string) : null;
      const expected = rankToMember.get(expectedRanks[i]);
      out.push(picked && expected && picked === expected ? 1 : 0);
    }
    return out;
  }

  const scores: PredictionScore[] = [];
  const nowIso = new Date().toISOString();

  // バッチ更新
  for (const r of rows) {
    const playerWin = scoreArr(r.player_win, [1, 2]);
    const playerTri = scoreArr(r.player_tri, [1, 2, 3]);
    const pitWin = scoreArr(r.pit_win, [7, 8]);
    const pitTri = scoreArr(r.pit_tri, [7, 8, 9]);
    const total =
      playerWin.reduce((s, v) => s + v, 0) +
      playerTri.reduce((s, v) => s + v, 0) +
      pitWin.reduce((s, v) => s + v, 0) +
      pitTri.reduce((s, v) => s + v, 0);

    const slot = { playerWin, playerTri, pitWin, pitTri };
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
      // 1件失敗しても他を続行する
      console.error("score update failed:", upErr.message);
    }
  }

  return { scored: scores.length, scores };
}

export type SlotScores = {
  playerWin: number[];
  playerTri: number[];
  pitWin: number[];
  pitTri: number[];
};

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
};

function parseSlotScores(v: unknown): SlotScores | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  const arr = (x: unknown): number[] =>
    Array.isArray(x) ? x.map((y) => (y === 1 ? 1 : 0)) : [];
  return {
    playerWin: arr(s.playerWin),
    playerTri: arr(s.playerTri),
    pitWin: arr(s.pitWin),
    pitTri: arr(s.pitTri),
  };
}

export async function listPredictionsForUser(
  userId: string
): Promise<UserPredictionHistory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("predictions")
    .select(
      "id, period_id, total_score, slot_scores, scored_at, created_at, periods(name, start_date, end_date)"
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
    periods:
      | { name: string | null; start_date: string | null; end_date: string | null }
      | null;
  };
  return (data as unknown as Joined[]).map((r) => ({
    predictionId: r.id,
    periodId: r.period_id,
    periodName: r.periods?.name ?? null,
    periodStartDate: r.periods?.start_date ?? null,
    periodEndDate: r.periods?.end_date ?? null,
    totalScore: r.total_score,
    slotScores: parseSlotScores(r.slot_scores),
    scoredAt: r.scored_at,
    createdAt: r.created_at,
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
  const { data, error } = await supabase
    .from("predictions")
    .select("player_win, player_tri, pit_win, pit_tri")
    .eq("period_id", periodId);
  if (error) throw new Error(error.message);

  type PredRow = {
    player_win: unknown;
    player_tri: unknown;
    pit_win: unknown;
    pit_tri: unknown;
  };
  const rows = (data ?? []) as PredRow[];

  function buildTally(
    extract: (r: PredRow) => unknown,
    size: number
  ): SummarySlotTally[] {
    // position -> memberId -> count
    const perPos: Map<string, number>[] = Array.from(
      { length: size },
      () => new Map()
    );
    for (const r of rows) {
      const arr = extract(r);
      if (!Array.isArray(arr)) continue;
      for (let i = 0; i < size; i++) {
        const v = arr[i];
        if (typeof v !== "string" || !v) continue;
        perPos[i].set(v, (perPos[i].get(v) ?? 0) + 1);
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
      playerWin: buildTally((r) => r.player_win, 2),
      playerTri: buildTally((r) => r.player_tri, 3),
      pitWin: buildTally((r) => r.pit_win, 2),
      pitTri: buildTally((r) => r.pit_tri, 3),
    },
  };
}
