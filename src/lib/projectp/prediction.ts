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
