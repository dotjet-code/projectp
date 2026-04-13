import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { issueRewardsForPeriod, RewardType } from "@/lib/projectp/reward";
import { logAudit } from "@/lib/projectp/audit";

/**
 * POST /api/admin/rewards/issue
 * body: { periodId, rewardType, minScore }
 *
 * 指定 Stage の予想のうち totalScore >= minScore のログイン済ユーザーに景品を発行。
 * 既発行分はスキップ。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const periodId = typeof body.periodId === "string" ? body.periodId : null;
  const rewardType: RewardType =
    body.rewardType === "cheki_free" ? "cheki_free" : "live_vote_bonus";
  const minScore =
    typeof body.minScore === "number" && body.minScore >= 0
      ? Math.floor(body.minScore)
      : null;
  if (!periodId || minScore === null) {
    return NextResponse.json(
      { error: "periodId と minScore は必須" },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await issueRewardsForPeriod({
      periodId,
      rewardType,
      minScore,
      issuedBy: user.id,
    });
    await logAudit({
      action: "reward.issue",
      actor: user.email ?? user.id,
      targetType: "period",
      targetId: periodId,
      detail: `${rewardType} minScore=${minScore} → issued=${result.issued} skipped=${result.skipped}`,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
