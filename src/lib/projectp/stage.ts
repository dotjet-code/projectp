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

export async function updateStage(
  id: string,
  patch: {
    name?: string;
    seriesNumber?: number | null;
    stageNumber?: number | null;
    title?: string | null;
    subtitle?: string | null;
    startDate?: string;
    endDate?: string;
    status?: "active" | "closed";
  }
): Promise<Stage> {
  const supabase = createAdminClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.seriesNumber !== undefined)
    update.series_number = patch.seriesNumber;
  if (patch.stageNumber !== undefined) update.stage_number = patch.stageNumber;
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.subtitle !== undefined) update.subtitle = patch.subtitle;
  if (patch.startDate !== undefined) update.start_date = patch.startDate;
  if (patch.endDate !== undefined) update.end_date = patch.endDate;
  if (patch.status !== undefined) update.status = patch.status;

  const { data, error } = await supabase
    .from("periods")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function deleteStage(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("periods").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * 確定済み Stage の period_points を data.ts のメンバー情報と
 * マージして公開ページ用に整形する。
 */
export type StageResultRow = {
  rank: number;
  position: "PLAYER" | "PIT";
  memberId: string;
  memberName: string;
  slug: string | null;
  avatarUrl: string | null;
  buzzPoints: number;
  livePoints: number;
  balancePoints: number;
  specialPoints: number;
  totalPoints: number;
};

export async function getStageResults(
  stageId: string
): Promise<StageResultRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("period_points")
    .select(
      "rank, position, member_id, buzz_points, live_points, balance_points, special_points, total_points, members:member_id (name)"
    )
    .eq("period_id", stageId)
    .order("rank", { ascending: true });
  if (error) throw new Error(error.message);

  // data.ts の slug/avatar と紐付け
  const { members: dummyMembers } = await import("@/lib/data");
  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));

  return (data ?? []).map((r) => {
    const row = r as unknown as {
      rank: number | null;
      position: "PLAYER" | "PIT" | null;
      member_id: string;
      buzz_points: number;
      live_points: number;
      balance_points: number;
      special_points: number;
      total_points: number;
      members: { name: string } | null;
    };
    const name = row.members?.name ?? "(unknown)";
    const dummy = dummyByName.get(name);
    return {
      rank: row.rank ?? 0,
      position: row.position ?? "PIT",
      memberId: row.member_id,
      memberName: name,
      slug: dummy?.slug ?? null,
      avatarUrl: dummy?.avatarUrl ?? null,
      buzzPoints: Number(row.buzz_points),
      livePoints: Number(row.live_points),
      balancePoints: Number(row.balance_points),
      specialPoints: Number(row.special_points),
      totalPoints: Number(row.total_points),
    };
  });
}
