import type { NextRequest } from "next/server";

/**
 * 投票用の匿名 Cookie ID。
 * 既存があればそれを、無ければランダム生成する。
 * 呼び出し側で NextResponse に Set-Cookie を仕込む前提。
 */
export const VOTE_COOKIE = "pp_vote_id";
export const VOTE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

export function readOrCreateVoteCookie(req: NextRequest): {
  cookieId: string;
  created: boolean;
} {
  const existing = req.cookies.get(VOTE_COOKIE)?.value;
  if (existing && existing.length >= 8) {
    return { cookieId: existing, created: false };
  }
  const cookieId = crypto.randomUUID();
  return { cookieId, created: true };
}
