import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stage 単位での収支ポイント (balance_entries) と
 * 特別ポイント (special_point_entries) のヘルパー。
 *
 * 収支ポイント:
 *   1メンバー × 1Stage = 1行で上書き運用。amount = 期間終了時の残金。
 *
 * 特別ポイント:
 *   ライブ開催日ごとに複数行を許容。日付 + メンバー単位で記録。
 */

// =====================================================================
// balance_entries
// =====================================================================
export type BalanceEntry = {
  id: string;
  memberId: string;
  periodId: string;
  amount: number;
  note: string | null;
  createdAt: string;
};

function mapBalance(row: Record<string, unknown>): BalanceEntry {
  return {
    id: row.id as string,
    memberId: row.member_id as string,
    periodId: row.period_id as string,
    amount: Number(row.amount),
    note: (row.note as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function listBalanceForStage(
  stageId: string
): Promise<BalanceEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("balance_entries")
    .select("*")
    .eq("period_id", stageId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapBalance(r as Record<string, unknown>));
}

export async function upsertBalance(input: {
  memberId: string;
  periodId: string;
  amount: number;
  note?: string | null;
}): Promise<BalanceEntry> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("balance_entries")
    .upsert(
      {
        member_id: input.memberId,
        period_id: input.periodId,
        amount: input.amount,
        note: input.note ?? null,
      },
      { onConflict: "member_id,period_id" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapBalance(data as Record<string, unknown>);
}

export async function deleteBalance(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("balance_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Stage 全員ぶんの収支合計を memberId -> amount で返す。
 * 「1メンバー1行」前提なのでそのまま amount を返すだけ。
 */
export async function getBalanceTotalsByStage(
  stageId: string
): Promise<Map<string, number>> {
  const rows = await listBalanceForStage(stageId);
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.memberId, r.amount);
  return map;
}

// =====================================================================
// special_point_entries
// =====================================================================
export type SpecialEntry = {
  id: string;
  memberId: string;
  periodId: string;
  liveDate: string; // YYYY-MM-DD
  points: number;
  note: string | null;
  createdAt: string;
};

function mapSpecial(row: Record<string, unknown>): SpecialEntry {
  return {
    id: row.id as string,
    memberId: row.member_id as string,
    periodId: row.period_id as string,
    liveDate: row.live_date as string,
    points: Number(row.points),
    note: (row.note as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function listSpecialForStage(
  stageId: string
): Promise<SpecialEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("special_point_entries")
    .select("*")
    .eq("period_id", stageId)
    .order("live_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapSpecial(r as Record<string, unknown>));
}

export async function createSpecial(input: {
  memberId: string;
  periodId: string;
  liveDate: string;
  points: number;
  note?: string | null;
}): Promise<SpecialEntry> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("special_point_entries")
    .insert({
      member_id: input.memberId,
      period_id: input.periodId,
      live_date: input.liveDate,
      points: input.points,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapSpecial(data as Record<string, unknown>);
}

export async function deleteSpecial(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("special_point_entries")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Stage 全員ぶんの特別ポイント合計を memberId -> sum で返す。
 */
export async function getSpecialTotalsByStage(
  stageId: string
): Promise<Map<string, number>> {
  const rows = await listSpecialForStage(stageId);
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.memberId, (map.get(r.memberId) ?? 0) + r.points);
  }
  return map;
}
