import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  castChinchiroRoll,
  getTodaysChinchiroByCookie,
  judgeChinchiro,
  type ChinchiroResult,
  type ChinchiroRollRecord,
} from "@/lib/projectp/shuyaku-vote";
import {
  readOrCreateVoteCookie,
  VOTE_COOKIE,
  VOTE_COOKIE_MAX_AGE,
} from "@/lib/projectp/vote-cookie";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET  /api/public/shuyaku-vote/chinchiro
 *   - 今日 cookie がチンチロを振ったか (result 同梱)
 *
 * POST /api/public/shuyaku-vote/chinchiro
 *   body: { memberId }
 *   - サーバー側で 3 個サイコロを振る。
 *     役なし (menashi) は 1 回まで自動で振り直し、2 回目も menashi なら
 *     「1 票救済」として確定させる。
 *   - 1 日 1 回 (cookie 単位) の制約は DB partial unique で担保。
 *
 * セキュリティ:
 *   - 出目はサーバー側 crypto.randomInt で決定。クライアント送信値は無視。
 *   - per-IP レート制限 (30/hr, 通常投票より厳しめ)
 *   - UNIQUE(cookie_id, vote_date) WHERE kind='chinchiro' で原子的に重複弾く
 */
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RATE_LIMIT_PER_HOUR = 30;
const RATE_LIMIT_KIND = "shuyaku.chinchiro";

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
  if (!ip) return true;
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

function rollThreeDice(): [number, number, number] {
  return [
    randomInt(1, 7),
    randomInt(1, 7),
    randomInt(1, 7),
  ];
}

/** サーバー側で役が出るまで最大 2 回振る。2 回目も menashi なら 1 票で確定。 */
function rollChinchiroWithReroll(): ChinchiroResult {
  const first = rollThreeDice();
  const r1 = judgeChinchiro(first[0], first[1], first[2]);
  if (r1.hand !== "menashi") return r1;

  const second = rollThreeDice();
  const r2 = judgeChinchiro(second[0], second[1], second[2]);
  if (r2.hand !== "menashi") return r2;

  // 2 回とも menashi → 1 票救済
  return { ...r2, value: 1 };
}

async function listActiveMemberIds(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("members")
    .select("id")
    .eq("is_active", true);
  return (data ?? []).map((r) => r.id as string);
}

export async function GET(req: NextRequest) {
  const { cookieId, created } = readOrCreateVoteCookie(req);
  const rolled = created ? null : await getTodaysChinchiroByCookie(cookieId);

  // 手動 open (CTA 経由) からの再表示用に役ラベルも載せる
  const enriched = rolled ? enrichRollWithLabel(rolled) : null;

  const res = NextResponse.json({ rolledToday: enriched });
  return withCookie(res, cookieId, created);
}

function enrichRollWithLabel(r: ChinchiroRollRecord) {
  const d = r.dice;
  if (d.length !== 3) return { ...r, handLabel: "" };
  const judged = judgeChinchiro(d[0], d[1], d[2]);
  return { ...r, handLabel: judged.handLabel };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const memberId =
    body && typeof body.memberId === "string" ? body.memberId.trim() : null;
  if (!memberId || !UUID_RE.test(memberId)) {
    return NextResponse.json(
      { error: "memberId is required (uuid)" },
      { status: 400 },
    );
  }

  const { cookieId, created } = readOrCreateVoteCookie(req);

  const ip = clientIp(req);
  const rateOk = await checkAndRecordIpRate(ip);
  if (!rateOk) {
    const res = NextResponse.json(
      { error: "rate limited", code: "rate_limited" },
      { status: 429 },
    );
    return withCookie(res, cookieId, created);
  }

  if (!(await memberExists(memberId))) {
    const res = NextResponse.json(
      { error: "member not found" },
      { status: 404 },
    );
    return withCookie(res, cookieId, created);
  }

  const result = rollChinchiroWithReroll();
  const allMemberIds = await listActiveMemberIds();

  const saved = await castChinchiroRoll(
    cookieId,
    memberId,
    result,
    allMemberIds,
  );
  if (!saved.ok) {
    const status = saved.code === "already_rolled_today" ? 409 : 500;
    const res = NextResponse.json(
      { error: saved.error, code: saved.code },
      { status },
    );
    return withCookie(res, cookieId, created);
  }

  const res = NextResponse.json({
    ok: true,
    dice: result.dice,
    hand: result.hand,
    handLabel: result.handLabel,
    /** 選んだメンバーに加算される票数 (ヒフミは 1、他役は役の票数) */
    value: result.value,
    /** 全メンバー合計 (ヒフミなら 12、他役なら value と同じ) */
    totalValue: saved.record.totalValue,
    /** 連続ログイン日数 */
    streakDays: saved.record.streakDays,
  });
  return withCookie(res, cookieId, created);
}
