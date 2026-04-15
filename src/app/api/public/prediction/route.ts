import { NextRequest, NextResponse } from "next/server";
import { getActiveStage, isPredictionClosed } from "@/lib/projectp/stage";
import {
  countPredictionsForPeriod,
  getMyPrediction,
  getPredictionSummary,
  upsertPrediction,
} from "@/lib/projectp/prediction";
import {
  readOrCreateVoteCookie,
  VOTE_COOKIE,
  VOTE_COOKIE_MAX_AGE,
} from "@/lib/projectp/vote-cookie";
import { createServerSupabase } from "@/lib/supabase/server";

async function getFanUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const role =
      (user.app_metadata as { role?: string } | null | undefined)?.role ?? null;
    // admin は景品対象外。通常のファンのみ紐付ける。
    if (role === "admin") return null;
    return user.id;
  } catch {
    return null;
  }
}

/**
 * GET  /api/public/prediction
 *   現在の active Stage 情報、ログイン Cookie、既存予想、提出数を返す
 *
 * POST /api/public/prediction
 *   body: { entryType, playerWin, playerTri, pitWin, pitTri }
 *   active Stage に対して upsert（既存があれば上書き）
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
  const stage = await getActiveStage().catch(() => null);

  if (!stage) {
    const res = NextResponse.json({
      stage: null,
      myPrediction: null,
      totalCount: 0,
    });
    return withCookie(res, cookieId, created);
  }

  const userId = await getFanUserId();

  const [myPrediction, totalCount, summary] = await Promise.all([
    created && !userId
      ? null
      : getMyPrediction(cookieId, stage.id, userId).catch(() => null),
    countPredictionsForPeriod(stage.id).catch(() => 0),
    getPredictionSummary(stage.id).catch(() => null),
  ]);

  const closed = isPredictionClosed(stage);
  const res = NextResponse.json({
    stage: {
      id: stage.id,
      name: stage.name,
      title: stage.title,
      subtitle: stage.subtitle,
      seriesNumber: stage.seriesNumber,
      stageNumber: stage.stageNumber,
      startDate: stage.startDate,
      endDate: stage.endDate,
      predictionsCloseAt: stage.predictionsCloseAt,
    },
    isLoggedIn: !!userId,
    isClosed: closed,
    myPrediction,
    totalCount,
    summary,
  });
  return withCookie(res, cookieId, created);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const stage = await getActiveStage().catch(() => null);
  if (!stage) {
    return NextResponse.json(
      { error: "現在 active な Stage がありません" },
      { status: 400 }
    );
  }
  if (isPredictionClosed(stage)) {
    return NextResponse.json(
      { error: "この Stage の予想は締切済みです" },
      { status: 400 }
    );
  }

  const entryType: "normal" | "welcome" =
    body.entryType === "welcome" ? "welcome" : "normal";

  function normalize(v: unknown, size: number): string[] {
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .slice(0, size);
  }

  const bets = {
    fukusho: normalize(body.fukusho, 1),
    tansho: normalize(body.tansho, 1),
    nirenpuku: normalize(body.nirenpuku, 2),
    nirentan: normalize(body.nirentan, 2),
    sanrenpuku: normalize(body.sanrenpuku, 3),
    sanrentan: normalize(body.sanrentan, 3),
  };

  // 全枠埋まっていることを期待
  if (
    bets.fukusho.length !== 1 ||
    bets.tansho.length !== 1 ||
    bets.nirenpuku.length !== 2 ||
    bets.nirentan.length !== 2 ||
    bets.sanrenpuku.length !== 3 ||
    bets.sanrentan.length !== 3
  ) {
    return NextResponse.json(
      { error: "全ての予想枠を埋めてください" },
      { status: 400 }
    );
  }

  // 順不同賭式は同一人物が2回以上選ばれていないか
  if (new Set(bets.nirenpuku).size !== 2) {
    return NextResponse.json(
      { error: "二連複は異なる 2 名を選んでください" },
      { status: 400 }
    );
  }
  if (new Set(bets.sanrenpuku).size !== 3) {
    return NextResponse.json(
      { error: "三連複は異なる 3 名を選んでください" },
      { status: 400 }
    );
  }

  const { cookieId, created } = readOrCreateVoteCookie(req);
  const userId = await getFanUserId();

  // 予想はファン会員限定。未ログインや管理者は受け付けない。
  if (!userId) {
    return NextResponse.json(
      { error: "予想の提出にはファン会員ログインが必要です", requiresLogin: true },
      { status: 401 }
    );
  }

  try {
    const prediction = await upsertPrediction({
      cookieId,
      userId,
      periodId: stage.id,
      entryType,
      bets,
    });
    const res = NextResponse.json({ ok: true, prediction });
    return withCookie(res, cookieId, created);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
