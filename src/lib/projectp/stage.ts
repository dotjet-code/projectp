import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Project P の Stage (= 内部テーブルは periods) ヘルパー。
 *
 * 階層:
 *   Series (半年) > Stage (1ヶ月、特番〜特番) > daily_snapshots (日次)
 */

export type Stage = {
  id: string;
  name: string;
  seriesNumber: number | null;
  stageNumber: number | null;
  title: string | null;
  subtitle: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (inclusive)
  status: "active" | "closed";
  createdAt: string;
};

function mapRow(row: Record<string, unknown>): Stage {
  return {
    id: row.id as string,
    name: row.name as string,
    seriesNumber: (row.series_number as number | null) ?? null,
    stageNumber: (row.stage_number as number | null) ?? null,
    title: (row.title as string | null) ?? null,
    subtitle: (row.subtitle as string | null) ?? null,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    status: row.status as "active" | "closed",
    createdAt: row.created_at as string,
  };
}

/**
 * 現在 active な Stage を1つ返す。存在しなければ null。
 * 公開ページのポイント計算はこの Stage を基準にする。
 */
export async function getActiveStage(): Promise<Stage | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function getStageById(id: string): Promise<Stage | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function listStages(): Promise<Stage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

/**
 * 新しい Stage を作成。既存の active があれば自動で closed に落とさない
 * （部分ユニークインデックスで失敗するので、呼び出し側で先に finalize すること）。
 */
export async function createStage(input: {
  name: string;
  seriesNumber?: number | null;
  stageNumber?: number | null;
  title?: string | null;
  subtitle?: string | null;
  startDate: string;
  endDate: string;
  status?: "active" | "closed";
}): Promise<Stage> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("periods")
    .insert({
      name: input.name,
      series_number: input.seriesNumber ?? null,
      stage_number: input.stageNumber ?? null,
      title: input.title ?? null,
      subtitle: input.subtitle ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      status: input.status ?? "active",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function updateStageStatus(
  id: string,
  status: "active" | "closed"
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("periods")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
