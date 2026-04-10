import { NextRequest, NextResponse } from "next/server";
import {
  castLiveVote,
  getTodaysTally,
  getTodaysVoteByCookie,
} from "@/lib/projectp/live-vote";
import {
  readOrCreateVoteCookie,
  VOTE_COOKIE,
  VOTE_COOKIE_MAX_AGE,
} from "@/lib/projectp/vote-cookie";

/**
 * GET /api/public/live-vote
 *   今日の集計 + この Cookie が既に投票しているかを返す
 *
 * POST /api/public/live-vote
 *   body: { memberId }
 *   1 (cookie_id, 今日の日付) につき 1票の upsert。
 *   既に投票していた場合は上書き（気が変わっても変更できる）
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

export async function GET(req: NextRequest) {
  const { cookieId, created } = readOrCreateVoteCookie(req);

  const [tally, existing] = await Promise.all([
    getTodaysTally().catch((e) => ({
      voteDate: "",
      totalVotes: 0,
      rows: [],
      error: e instanceof Error ? e.message : String(e),
    })),
    // 既に投票していれば memberId を返す。Cookie が新規なら当然 null
    created ? null : getTodaysVoteByCookie(cookieId).catch(() => null),
  ]);

  const res = NextResponse.json({
    tally,
    myVote: existing,
  });
  return withCookie(res, cookieId, created);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.memberId !== "string") {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const { cookieId, created } = readOrCreateVoteCookie(req);

  const result = await castLiveVote(cookieId, body.memberId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const tally = await getTodaysTally().catch(() => ({
    voteDate: "",
    totalVotes: 0,
    rows: [],
  }));

  const res = NextResponse.json({
    ok: true,
    tally,
    myVote: { memberId: body.memberId },
  });
  return withCookie(res, cookieId, created);
}
