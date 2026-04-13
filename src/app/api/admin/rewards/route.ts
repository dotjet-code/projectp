import { NextRequest, NextResponse } from "next/server";
import { listRewardsForPeriod } from "@/lib/projectp/reward";

/**
 * GET /api/admin/rewards?periodId=...
 */
export async function GET(req: NextRequest) {
  const periodId = req.nextUrl.searchParams.get("periodId");
  if (!periodId) {
    return NextResponse.json({ rewards: [] });
  }
  const rewards = await listRewardsForPeriod(periodId);
  return NextResponse.json({ rewards });
}
