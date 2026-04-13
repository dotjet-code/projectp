import { NextRequest, NextResponse } from "next/server";
import { getFanDetail } from "@/lib/projectp/fan-profile";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const detail = await getFanDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
