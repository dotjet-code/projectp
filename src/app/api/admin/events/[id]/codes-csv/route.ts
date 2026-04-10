import { NextRequest, NextResponse } from "next/server";
import { getEventCodes, getLiveEvent } from "@/lib/projectp/live-event";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const event = await getLiveEvent(id);
  if (!event) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const codes = await getEventCodes(id);

  const header = "コード,チケット数,使用済み,状態";
  const lines = codes.map(
    (c) =>
      `${c.code},${c.ticketsTotal},${c.ticketsUsed},${c.activatedAt ? "使用済み" : "未使用"}`
  );
  const csv = [header, ...lines].join("\n");
  const bom = "\uFEFF";
  const filename = `codes_${event.title.replace(/\s+/g, "_")}.csv`;

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
