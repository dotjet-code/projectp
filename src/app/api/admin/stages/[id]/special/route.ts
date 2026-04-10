import { NextRequest, NextResponse } from "next/server";
import {
  createSpecial,
  deleteSpecial,
  listSpecialForStage,
} from "@/lib/projectp/balance-special";

/**
 * GET    /api/admin/stages/:id/special                       一覧
 * POST   /api/admin/stages/:id/special                       { memberId, liveDate, points, note? } 追加
 * DELETE /api/admin/stages/:id/special?entryId=xxx           個別削除
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const entries = await listSpecialForStage(id);
  return NextResponse.json({ entries });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.memberId !== "string" ||
    typeof body.liveDate !== "string" ||
    typeof body.points !== "number"
  ) {
    return NextResponse.json(
      { error: "memberId, liveDate, points are required" },
      { status: 400 }
    );
  }
  try {
    const entry = await createSpecial({
      memberId: body.memberId,
      periodId: id,
      liveDate: body.liveDate,
      points: body.points,
      note: body.note ?? null,
    });
    return NextResponse.json({ entry });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  const entryId = req.nextUrl.searchParams.get("entryId");
  if (!entryId) {
    return NextResponse.json({ error: "entryId is required" }, { status: 400 });
  }
  try {
    await deleteSpecial(entryId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
