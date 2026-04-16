import { NextRequest, NextResponse } from "next/server";
import { validateStaffToken } from "@/lib/projectp/staff-token";
import { redeemReward, getRewardByCodeWithFan } from "@/lib/projectp/reward";
import { logAudit } from "@/lib/projectp/audit";

/**
 * POST /api/staff/redeem
 * body: { staffToken, code }
 *
 * ログイン不要。staff_scan_tokens で認証し、景品を消込む。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const staffToken = typeof body?.staffToken === "string" ? body.staffToken : null;
  const code = typeof body?.code === "string" ? body.code : null;

  if (!staffToken || !code) {
    return NextResponse.json(
      { error: "staffToken and code are required" },
      { status: 400 }
    );
  }

  const valid = await validateStaffToken(staffToken);
  if (!valid) {
    return NextResponse.json(
      { error: "無効または期限切れのスタッフトークンです" },
      { status: 403 }
    );
  }

  const result = await redeemReward({
    rewardCode: code,
    redeemedBy: "staff:" + staffToken.slice(0, 8),
  });

  if (!result.ok) {
    const status =
      result.reason === "not_found"
        ? 404
        : result.reason === "expired"
        ? 410
        : 409;
    const msg =
      result.reason === "not_found"
        ? "コードが見つかりません"
        : result.reason === "already_redeemed"
        ? "既に消込済みです"
        : "有効期限切れです";
    return NextResponse.json({ error: msg, reason: result.reason }, { status });
  }

  await logAudit({
    action: "reward.redeem.staff",
    actor: "staff:" + staffToken.slice(0, 8),
    targetType: "reward",
    targetId: String(result.reward.id),
    detail: `${result.reward.rewardType} code=${result.reward.rewardCode}`,
  });

  const withFan = await getRewardByCodeWithFan(result.reward.rewardCode);
  return NextResponse.json({ ok: true, reward: withFan ?? result.reward });
}
