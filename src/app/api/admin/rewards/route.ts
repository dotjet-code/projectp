import { NextRequest, NextResponse } from "next/server";
import { listRewardsForPeriodWithFan } from "@/lib/projectp/reward";

/**
 * GET /api/admin/rewards?periodId=...
 * ファン情報(表示名/メール)込みで返す。
 */
export async function GET(req: NextRequest) {
  const periodId = req.nextUrl.searchParams.get("periodId");
  if (!periodId) {
    return NextResponse.json({ rewards: [] });
  }
  const rewards = await listRewardsForPeriodWithFan(periodId);
  return NextResponse.json({ rewards });
}
