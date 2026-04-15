import { NextRequest, NextResponse } from "next/server";
import { previewRewardCandidates, type RewardType } from "@/lib/projectp/reward";

/**
 * GET /api/admin/rewards/preview?periodId=...&rewardType=...&minScore=...
 *
 * 発行 dry-run: 対象者数を返すだけで DB は更新しない。
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const periodId = params.get("periodId");
  const rewardTypeRaw = params.get("rewardType");
  const minScoreRaw = params.get("minScore");

  if (!periodId || !rewardTypeRaw || minScoreRaw === null) {
    return NextResponse.json(
      { error: "periodId / rewardType / minScore は必須" },
      { status: 400 }
    );
  }
  const rewardType: RewardType =
    rewardTypeRaw === "cheki_free" ? "cheki_free" : "live_vote_bonus";
  const minScore = Math.max(0, Math.floor(Number(minScoreRaw) || 0));

  try {
    const result = await previewRewardCandidates({
      periodId,
      rewardType,
      minScore,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
