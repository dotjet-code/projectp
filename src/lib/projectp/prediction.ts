import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stage 順位予想ヘルパー。
 * 匿名 Cookie × Stage で1つの予想を upsert。
 */

export type PredictionEntryType = "normal" | "welcome";

export type Prediction = {
  id: number;
  cookieId: string;
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
  periodId: string
): Promise<Prediction | null> {
  const supabase = createAdminClient();
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
  periodId: string;
  entryType: PredictionEntryType;
  playerWin: string[];
  playerTri: string[];
  pitWin: string[];
  pitTri: string[];
}): Promise<Prediction> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        cookie_id: input.cookieId,
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

export type TopPredictor = {
  rank: number;
  cookieIdMasked: string; // 表示用にマスクした Cookie ID
  totalScore: number;
  entryType: PredictionEntryType;
};

/**
 * Stage の的中スコアランキング（上位N件）。
 * cookie_id は表示用にマスク。
 */
export async function getTopPredictors(
  periodId: string,
  limit = 10
): Promise<TopPredictor[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("cookie_id, entry_type, total_score")
    .eq("period_id", periodId)
    .not("total_score", "is", null)
    .order("total_score", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    cookie_id: string;
    entry_type: string;
    total_score: number | null;
  }>;

  return rows.map((r, i) => ({
    rank: i + 1,
    cookieIdMasked: `${r.cookie_id.slice(0, 4)}…${r.cookie_id.slice(-2)}`,
    totalScore: r.total_score ?? 0,
    entryType: r.entry_type === "welcome" ? "welcome" : "normal",
  }));
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
