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

/**
 * Series（半年）の累計集計。
 * 同じ series_number を持つ closed Stage の period_points を全部足し込む。
 */
export type SeriesTotalRow = {
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
  stagesCounted: number;
};

export async function getSeriesTotals(
  seriesNumber: number
): Promise<{
  series: number;
  stages: Stage[];
  rows: SeriesTotalRow[];
}> {
  const supabase = createAdminClient();

  // 該当 series の Stage を取得（closed のみ集計対象、active は途中経過なので除外）
  const { data: stageRows, error: stagesErr } = await supabase
    .from("periods")
    .select("*")
    .eq("series_number", seriesNumber)
    .eq("status", "closed")
    .order("stage_number", { ascending: true });
  if (stagesErr) throw new Error(stagesErr.message);
  const stages = (stageRows ?? []).map((r) =>
    mapRow(r as Record<string, unknown>)
  );

  if (stages.length === 0) {
    return { series: seriesNumber, stages: [], rows: [] };
  }

  // それらの period_points を一括取得
  const { data: pps, error: ppsErr } = await supabase
    .from("period_points")
    .select(
      "member_id, buzz_points, live_points, balance_points, special_points, total_points, members:member_id (name)"
    )
    .in(
      "period_id",
      stages.map((s) => s.id)
    );
  if (ppsErr) throw new Error(ppsErr.message);

  // メンバーごとに集計
  type Acc = {
    memberId: string;
    memberName: string;
    buzz: number;
    live: number;
    balance: number;
    special: number;
    total: number;
    count: number;
  };
  const accByMember = new Map<string, Acc>();
  for (const r of pps ?? []) {
    const row = r as unknown as {
      member_id: string;
      buzz_points: number;
      live_points: number;
      balance_points: number;
      special_points: number;
      total_points: number;
      members: { name: string } | null;
    };
    const key = row.member_id;
    const cur = accByMember.get(key) ?? {
      memberId: key,
      memberName: row.members?.name ?? "(unknown)",
      buzz: 0,
      live: 0,
      balance: 0,
      special: 0,
      total: 0,
      count: 0,
    };
    cur.buzz += Number(row.buzz_points);
    cur.live += Number(row.live_points);
    cur.balance += Number(row.balance_points);
    cur.special += Number(row.special_points);
    cur.total += Number(row.total_points);
    cur.count += 1;
    accByMember.set(key, cur);
  }

  // data.ts と紐付け
  const { members: dummyMembers } = await import("@/lib/data");
  const dummyByName = new Map(dummyMembers.map((d) => [d.name, d]));

  const rows: SeriesTotalRow[] = [...accByMember.values()]
    .map((a) => {
      const dummy = dummyByName.get(a.memberName);
      return {
        rank: 0, // あとで埋める
        position: "PIT" as "PLAYER" | "PIT",
        memberId: a.memberId,
        memberName: a.memberName,
        slug: dummy?.slug ?? null,
        avatarUrl: dummy?.avatarUrl ?? null,
        buzzPoints: a.buzz,
        livePoints: a.live,
        balancePoints: a.balance,
        specialPoints: a.special,
        totalPoints: a.total,
        stagesCounted: a.count,
      };
    })
    .sort((x, y) => y.totalPoints - x.totalPoints)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      position: i < 6 ? "PLAYER" : "PIT",
    }));

  return { series: seriesNumber, stages, rows };
}

/**
 * 指定メンバーの過去 Stage 成績（closed のみ）を新しい順で返す。
 */
export type MemberStageHistoryRow = {
  stageId: string;
  stageName: string;
  stageTitle: string | null;
  seriesNumber: number | null;
  stageNumber: number | null;
  startDate: string;
  endDate: string;
  rank: number | null;
  position: "PLAYER" | "PIT" | null;
  totalPoints: number;
};

export async function getMemberStageHistory(
  memberName: string
): Promise<MemberStageHistoryRow[]> {
  const supabase = createAdminClient();

  // まず名前から member_id を引く
  const { data: m } = await supabase
    .from("members")
    .select("id")
    .eq("name", memberName)
    .maybeSingle();
  if (!m) return [];

  // その member の period_points を join して periods 情報も取得
  const { data, error } = await supabase
    .from("period_points")
    .select(
      "rank, position, total_points, periods:period_id (id, name, title, series_number, stage_number, start_date, end_date, status)"
    )
    .eq("member_id", m.id);
  if (error) return [];

  type Row = {
    rank: number | null;
    position: "PLAYER" | "PIT" | null;
    total_points: number;
    periods: {
      id: string;
      name: string;
      title: string | null;
      series_number: number | null;
      stage_number: number | null;
      start_date: string;
      end_date: string;
      status: string;
    } | null;
  };

  const rows = (data ?? []) as unknown as Row[];

  return rows
    .filter((r) => r.periods && r.periods.status === "closed")
    .map((r) => ({
      stageId: r.periods!.id,
      stageName: r.periods!.name,
      stageTitle: r.periods!.title,
      seriesNumber: r.periods!.series_number,
      stageNumber: r.periods!.stage_number,
      startDate: r.periods!.start_date,
      endDate: r.periods!.end_date,
      rank: r.rank,
      position: r.position,
      totalPoints: Number(r.total_points),
    }))
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
}

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
