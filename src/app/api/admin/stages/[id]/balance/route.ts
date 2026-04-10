import { NextRequest, NextResponse } from "next/server";
import {
  deleteBalance,
  listBalanceForStage,
  upsertBalance,
} from "@/lib/projectp/balance-special";

/**
 * GET    /api/admin/stages/:id/balance         一覧
 * PUT    /api/admin/stages/:id/balance         { memberId, amount, note? } を upsert
 * DELETE /api/admin/stages/:id/balance?entryId=xxx  個別削除
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const entries = await listBalanceForStage(id);
  return NextResponse.json({ entries });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.memberId !== "string" ||
    typeof body.amount !== "number"
  ) {
    return NextResponse.json(
      { error: "memberId and amount are required" },
      { status: 400 }
    );
  }
  try {
    const entry = await upsertBalance({
      memberId: body.memberId,
      periodId: id,
      amount: body.amount,
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
    await deleteBalance(entryId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
