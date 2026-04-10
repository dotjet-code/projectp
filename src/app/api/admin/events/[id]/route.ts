import { NextRequest, NextResponse } from "next/server";
import {
  generateCodes,
  getEventCodes,
  getEventTally,
  getLiveEvent,
  updateEventStatus,
} from "@/lib/projectp/live-event";

/**
 * GET  /api/admin/events/:id       イベント詳細 + コード + 集計
 * PATCH /api/admin/events/:id      ステータス変更 (draft/open/closed)
 * POST /api/admin/events/:id       コード生成 { count, ticketsPerCode }
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const event = await getLiveEvent(id);
  if (!event) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const [codes, tally] = await Promise.all([
    getEventCodes(id),
    getEventTally(id),
  ]);
  const totalCodes = codes.length;
  const activatedCodes = codes.filter((c) => c.activatedAt).length;
  const totalVotes = codes.reduce((s, c) => s + c.ticketsUsed, 0);

  return NextResponse.json({
    event,
    codes,
    tally,
    stats: { totalCodes, activatedCodes, totalVotes },
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.status || !["draft", "open", "closed"].includes(body.status)) {
    return NextResponse.json(
      { error: "status must be draft/open/closed" },
      { status: 400 }
    );
  }
  try {
    await updateEventStatus(id, body.status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const count = Number(body?.count) || 100;
  const ticketsPerCode = Number(body?.ticketsPerCode) || 3;

  try {
    const result = await generateCodes(id, count, ticketsPerCode);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
