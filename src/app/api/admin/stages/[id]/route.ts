import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/projectp/audit";
import {
  deleteStage,
  getStageById,
  updateStage,
} from "@/lib/projectp/stage";

/**
 * PATCH /api/admin/stages/:id
 *   Stage の編集（タイトル、期間、Series/Stage 番号、ステータスなど）
 *
 * DELETE /api/admin/stages/:id
 *   Stage を完全削除（紐付くスナップショットの period_id は NULL に、
 *   period_points はカスケード削除）
 */
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const stage = await getStageById(id);
  if (!stage) {
    return NextResponse.json({ error: "stage not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    const updated = await updateStage(id, body);
    return NextResponse.json({ stage: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const stage = await getStageById(id);
    await deleteStage(id);
    await logAudit({
      action: "stage.delete",
      targetType: "stage",
      targetId: id,
      detail: `${stage?.title ?? stage?.name ?? id} を削除`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
