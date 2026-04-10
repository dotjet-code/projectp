import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStageById, updateStageStatus } from "@/lib/projectp/stage";
import { logAudit } from "@/lib/projectp/audit";
import {
  getBalanceTotalsByStage,
  getSpecialTotalsByStage,
} from "@/lib/projectp/balance-special";
import { scoreStagePredictions } from "@/lib/projectp/prediction";

/**
 * POST /api/admin/stages/:id/finalize
 *
 * 指定 Stage を確定する：
 *   1. その Stage の最新スナップショット（メンバーごと）を取得
 *   2. buzz/live/balance/special ポイントを集計
 *   3. period_points に upsert（finalized_at, rank, position を記録）
 *   4. Stage を status='closed' に
 *
 * 収支・特別は現状未入力なので 0 として扱う（後続で実装予定）。
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const stage = await getStageById(id);
  if (!stage) {
    return NextResponse.json({ error: "stage not found" }, { status: 404 });
  }
  if (stage.status === "closed") {
    return NextResponse.json(
      { error: "stage is already closed" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 1) 連携済みメンバー
  const { data: members, error: mErr } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true);
  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }

  const memberIds = (members ?? []).map((m) => m.id);

  // 2) その Stage の期間内スナップショット（各メンバー最新 1件）
  const { data: snaps, error: sErr } = await supabase
    .from("daily_snapshots")
    .select("member_id, snapshot_date, top_video_views, live_view_total")
    .eq("period_id", stage.id)
    .in("member_id", memberIds)
    .order("snapshot_date", { ascending: false });
  if (sErr) {
    return NextResponse.json({ error: sErr.message }, { status: 500 });
  }

  const latestByMember = new Map<
    string,
    { top_video_views: number | null; live_view_total: number | null }
  >();
  for (const s of snaps ?? []) {
    if (!latestByMember.has(s.member_id)) {
      latestByMember.set(s.member_id, {
        top_video_views: s.top_video_views,
        live_view_total: s.live_view_total,
      });
    }
  }

  // 3) 収支・特別ポイントを集計（DB から取得）
  const balanceMap = await getBalanceTotalsByStage(stage.id);
  const specialMap = await getSpecialTotalsByStage(stage.id);

  type Row = {
    member_id: string;
    buzz_points: number;
    live_points: number;
    balance_points: number;
    special_points: number;
  };
  const rows: Row[] = (members ?? []).map((m) => {
    const snap = latestByMember.get(m.id);
    const buzz = snap?.top_video_views ?? 0;
    const livePts = (snap?.live_view_total ?? 0) * 10;
    return {
      member_id: m.id,
      buzz_points: buzz,
      live_points: livePts,
      balance_points: balanceMap.get(m.id) ?? 0,
      special_points: specialMap.get(m.id) ?? 0,
    };
  });

  // 4) ポイント降順で rank / position を割り当て
  const enriched = rows
    .map((r) => ({
      ...r,
      total: r.buzz_points + r.live_points + r.balance_points,
    }))
    .sort((a, b) => b.total - a.total)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      position: (i < 6 ? "PLAYER" : "PIT") as "PLAYER" | "PIT",
    }));

  // 5) period_points に upsert
  const finalizedAt = new Date().toISOString();
  const upsertRows = enriched.map((r) => ({
    period_id: stage.id,
    member_id: r.member_id,
    buzz_points: r.buzz_points,
    live_points: r.live_points,
    balance_points: r.balance_points,
    special_points: r.special_points,
    rank: r.rank,
    position: r.position,
    finalized_at: finalizedAt,
    updated_at: finalizedAt,
  }));

  if (upsertRows.length > 0) {
    const { error: upErr } = await supabase
      .from("period_points")
      .upsert(upsertRows, { onConflict: "period_id,member_id" });
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
  }

  // 6) Stage を closed に
  await updateStageStatus(stage.id, "closed");
  await logAudit({
    action: "stage.finalize",
    targetType: "stage",
    targetId: stage.id,
    detail: `${stage.title ?? stage.name} を確定`,
  });

  // 7) 予想の的中を自動採点（失敗しても finalize 自体は成功扱い）
  let predictionScoring: { scored: number } = { scored: 0 };
  try {
    const s = await scoreStagePredictions(stage.id);
    predictionScoring = { scored: s.scored };
  } catch (e) {
    console.error("scoreStagePredictions failed:", e);
  }

  return NextResponse.json({
    ok: true,
    predictionScoring,
    stage: { ...stage, status: "closed" },
    finalized: enriched,
  });
}
