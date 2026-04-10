import { NextRequest, NextResponse } from "next/server";
import { getStageById } from "@/lib/projectp/stage";
import { scoreStagePredictions } from "@/lib/projectp/prediction";

/**
 * POST /api/admin/stages/:id/score-predictions
 *
 * 確定済み Stage の予想を再採点する。
 * Stage の finalize 時にも自動で走るが、後から predictions が増えた場合や
 * period_points を手動で直した時などに使う。
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

  try {
    const result = await scoreStagePredictions(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
