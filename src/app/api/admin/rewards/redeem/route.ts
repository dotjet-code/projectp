import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { redeemReward, getRewardByCodeWithFan } from "@/lib/projectp/reward";
import { logAudit } from "@/lib/projectp/audit";

/**
 * POST /api/admin/rewards/redeem
 * body: { code, note? }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : null;
  const note = typeof body?.note === "string" ? body.note : null;
  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // live_vote_bonus はスタッフ/admin 消込の対象外
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const checkDb = createAdminClient();
  const { data: rewardRow } = await checkDb
    .from("prediction_rewards")
    .select("reward_type")
    .eq("reward_code", code.trim().toUpperCase())
    .maybeSingle();
  if (rewardRow && (rewardRow as { reward_type: string }).reward_type === "live_vote_bonus") {
    return NextResponse.json(
      { error: "投票ボーナスはライブ投票時に自動適用されます" },
      { status: 400 }
    );
  }

  const result = await redeemReward({
    rewardCode: code,
    redeemedBy: user.id,
    note,
  });

  if (!result.ok) {
    const status =
      result.reason === "not_found"
        ? 404
        : result.reason === "expired"
        ? 410
        : 409;
    return NextResponse.json({ error: result.reason }, { status });
  }
  await logAudit({
    action: "reward.redeem",
    actor: user.email ?? user.id,
    targetType: "reward",
    targetId: String(result.reward.id),
    detail: `${result.reward.rewardType} code=${result.reward.rewardCode}`,
  });
  // 消込後にファン情報付きで返す(スタッフが本人確認できるように)
  const withFan = await getRewardByCodeWithFan(result.reward.rewardCode);
  return NextResponse.json({ ok: true, reward: withFan ?? result.reward });
}
