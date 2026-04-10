import { NextRequest, NextResponse } from "next/server";
import {
  getActiveStage,
  getStageById,
  updateStageStatus,
} from "@/lib/projectp/stage";

/**
 * POST /api/admin/stages/:id/reopen
 *
 * 確定済み Stage を再オープン (closed → active) する。
 *
 * 制約: active な Stage は同時に1つだけなので、既に他に active があれば 400。
 * period_points は残す（次に finalize し直すと上書きされる）。
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
  if (stage.status === "active") {
    return NextResponse.json({ error: "stage is already active" }, { status: 400 });
  }

  const otherActive = await getActiveStage();
  if (otherActive && otherActive.id !== id) {
    return NextResponse.json(
      {
        error: `他に active な Stage があります: ${otherActive.title ?? otherActive.name}。先にそちらを確定 (close) してください。`,
      },
      { status: 400 }
    );
  }

  try {
    await updateStageStatus(id, "active");
    return NextResponse.json({ ok: true, stage: { ...stage, status: "active" } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
