import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  castShuyakuVote,
  getTodaysShuyakuByCookie,
  getShuyakuTotalsByMember,
  DICE_MIN,
  DICE_MAX,
} from "@/lib/projectp/shuyaku-vote";
import {
  readOrCreateVoteCookie,
  VOTE_COOKIE,
  VOTE_COOKIE_MAX_AGE,
} from "@/lib/projectp/vote-cookie";
import { getActiveStage } from "@/lib/projectp/stage";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/public/shuyaku-vote
 *   - 今日この Cookie が指名済みのメンバー一覧（出目つき）
 *   - 各メンバーの累計指名スコア (active stage 内, SUM(value))
 *
 * POST /api/public/shuyaku-vote
 *   body: { memberId }
 *   - サーバー側で 1〜6 の出目を生成 (crypto.randomInt)
 *   - 1 (cookie_id, member_id, vote_date) につき 1 票
 *   - 既に投票済みなら 409
 *
 * セキュリティ:
 *   - 値はサーバー側決定 (クライアント送信値は受け付けない)
 *   - memberId は UUID 形式チェック + members 存在確認
 *   - per-IP レート制限 (auth_attempts kind='shuyaku.vote', 60 req/hour)
 *   - Cookie は httpOnly, sameSite=lax
 *   - DB UNIQUE(cookie_id, member_id, vote_date) で原子的に重複防止
 *   - サイコロの出目は INSERT 成功後にだけクライアントへ返す
 */
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RATE_LIMIT_PER_HOUR = 60;
const RATE_LIMIT_KIND = "shuyaku.vote";

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

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

async function checkAndRecordIpRate(ip: string | null): Promise<boolean> {
  if (!ip) return true; // IP 取れない環境ではスキップ (Cookie + UNIQUE で守る)
  const supabase = createAdminClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("auth_attempts")
    .select("*", { count: "exact", head: true })
    .eq("kind", RATE_LIMIT_KIND)
    .eq("ip", ip)
    .gte("created_at", since);

  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return false;
  }

  await supabase.from("auth_attempts").insert({
    kind: RATE_LIMIT_KIND,
    ip,
    email_hash: null,
    ua: null,
  });

  return true;
}

async function memberExists(memberId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle();
  return Boolean(data);
}

export async function GET(req: NextRequest) {
  const { cookieId, created } = readOrCreateVoteCookie(req);
  const stage = await getActiveStage().catch(() => null);

  const [votedToday, totals] = await Promise.all([
    created ? Promise.resolve([]) : getTodaysShuyakuByCookie(cookieId),
    getShuyakuTotalsByMember(stage?.id ?? null),
  ]);

  const res = NextResponse.json({
    votedToday,
    totals: Object.fromEntries(totals),
  });
  return withCookie(res, cookieId, created);
}

export async function POST(req: NextRequest) {
  // 1. body 検証
  const body = await req.json().catch(() => null);
  const memberId =
    body && typeof body.memberId === "string" ? body.memberId.trim() : null;
  if (!memberId || !UUID_RE.test(memberId)) {
    return NextResponse.json(
      { error: "memberId is required (uuid)" },
      { status: 400 },
    );
  }

  // 2. Cookie
  const { cookieId, created } = readOrCreateVoteCookie(req);

  // 3. レート制限 (per-IP, 60/hr)
  const ip = clientIp(req);
  const rateOk = await checkAndRecordIpRate(ip);
  if (!rateOk) {
    const res = NextResponse.json(
      { error: "rate limited", code: "rate_limited" },
      { status: 429 },
    );
    return withCookie(res, cookieId, created);
  }

  // 4. メンバー実在チェック
  if (!(await memberExists(memberId))) {
    const res = NextResponse.json(
      { error: "member not found" },
      { status: 404 },
    );
    return withCookie(res, cookieId, created);
  }

  // 5. サーバー側で出目を決定 (crypto secure)
  const value = randomInt(DICE_MIN, DICE_MAX + 1); // [1, 6]

  // 6. INSERT — UNIQUE(cookie_id, member_id, vote_date) で原子的に重複弾く
  const result = await castShuyakuVote(cookieId, memberId, value);
  if (!result.ok) {
    const status = result.code === "already_voted_today" ? 409 : 500;
    const res = NextResponse.json(
      { error: result.error, code: result.code },
      { status },
    );
    return withCookie(res, cookieId, created);
  }

  // 7. 成功時のみ value を返す
  const votedToday = await getTodaysShuyakuByCookie(cookieId);
  const res = NextResponse.json({
    ok: true,
    value,
    votedToday,
  });
  return withCookie(res, cookieId, created);
}
