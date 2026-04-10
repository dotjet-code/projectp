import { NextRequest, NextResponse } from "next/server";
import { runSnapshotBatch } from "@/lib/projectp/batch";

/**
 * 日次バッチ：Vercel Cron からの呼び出しは
 * `Authorization: Bearer <CRON_SECRET>` を付ける仕様。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (provided !== expected) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const result = await runSnapshotBatch("cron");
  return NextResponse.json(result);
}
