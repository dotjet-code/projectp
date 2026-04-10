import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStageById, getStageResults } from "@/lib/projectp/stage";

/**
 * GET /api/admin/stages/:id/export-csv
 *
 * 確定済み Stage の順位・ポイントを CSV で返す。
 * active Stage の場合は最新スナップショットベースで生成。
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const stage = await getStageById(id);
  if (!stage) {
    return NextResponse.json({ error: "stage not found" }, { status: 404 });
  }

  let rows: {
    rank: number;
    name: string;
    position: string;
    buzz: number;
    live: number;
    balance: number;
    special: number;
    total: number;
  }[];

  if (stage.status === "closed") {
    const results = await getStageResults(id);
    rows = results.map((r) => ({
      rank: r.rank,
      name: r.memberName,
      position: r.position,
      buzz: r.buzzPoints,
      live: r.livePoints,
      balance: r.balancePoints,
      special: r.specialPoints,
      total: r.totalPoints,
    }));
  } else {
    // active: 最新スナップショットから
    const supabase = createAdminClient();
    const { data: members } = await supabase
      .from("members")
      .select("id, name")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    const { data: snaps } = await supabase
      .from("daily_snapshots")
      .select("member_id, top_video_views, live_view_total")
      .eq("period_id", id)
      .order("snapshot_date", { ascending: false });

    const latestByMember = new Map<string, { buzz: number; live: number }>();
    for (const s of snaps ?? []) {
      if (!latestByMember.has(s.member_id)) {
        latestByMember.set(s.member_id, {
          buzz: Number(s.top_video_views ?? 0),
          live: Number(s.live_view_total ?? 0) * 10,
        });
      }
    }

    const raw = (members ?? []).map((m) => {
      const snap = latestByMember.get(m.id);
      const buzz = snap?.buzz ?? 0;
      const live = snap?.live ?? 0;
      return { name: m.name as string, buzz, live, total: buzz + live };
    });
    raw.sort((a, b) => b.total - a.total);
    rows = raw.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      position: i < 6 ? "PLAYER" : "PIT",
      buzz: r.buzz,
      live: r.live,
      balance: 0,
      special: 0,
      total: r.total,
    }));
  }

  // CSV 生成
  const header = "順位,名前,ポジション,バズ,配信,収支,特別,合計";
  const lines = rows.map(
    (r) =>
      `${r.rank},"${r.name}",${r.position},${r.buzz},${r.live},${r.balance},${r.special},${r.total}`
  );
  const csv = [header, ...lines].join("\n");
  const bom = "\uFEFF"; // Excel 対応 BOM

  const filename = `projectp_${stage.name.replace(/\s+/g, "_")}.csv`;

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
