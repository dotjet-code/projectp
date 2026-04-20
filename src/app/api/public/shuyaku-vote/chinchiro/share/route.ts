import { NextRequest, NextResponse } from "next/server";
import { claimChinchiroShareBonus } from "@/lib/projectp/shuyaku-vote";
import {
  readOrCreateVoteCookie,
  VOTE_COOKIE,
  VOTE_COOKIE_MAX_AGE,
} from "@/lib/projectp/vote-cookie";

/**
 * POST /api/public/shuyaku-vote/chinchiro/share
 *
 * 「今日の賽」結果を X でシェアした報酬として、推しに +1 票する。
 * 1 日 1 回のみ (chinchiro_rolls.shared_at の update で once-only 担保)。
 */
export const dynamic = "force-dynamic";

function withCookie(res: NextResponse, cookieId: string, created: boolean) {
  if (created) {
    res.cookies.set(VOTE_COOKIE, cookieId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: VOTE_COOKIE_MAX_AGE,
    });
  }
  return res;
}

export async function POST(req: NextRequest) {
  const { cookieId, created } = readOrCreateVoteCookie(req);
  const r = await claimChinchiroShareBonus(cookieId);
  if (!r.ok) {
    const status = r.code === "not_rolled" ? 409 : 500;
    const res = NextResponse.json(
      { error: r.error, code: r.code },
      { status },
    );
    return withCookie(res, cookieId, created);
  }
  const res = NextResponse.json({
    ok: true,
    addedVote: r.addedVote,
    bonusValue: r.bonusValue,
  });
  return withCookie(res, cookieId, created);
}
