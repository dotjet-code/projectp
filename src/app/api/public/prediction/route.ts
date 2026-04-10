import { NextRequest, NextResponse } from "next/server";
import { getActiveStage } from "@/lib/projectp/stage";
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

  const [myPrediction, totalCount, summary] = await Promise.all([
    created ? null : getMyPrediction(cookieId, stage.id).catch(() => null),
    countPredictionsForPeriod(stage.id).catch(() => 0),
    getPredictionSummary(stage.id).catch(() => null),
  ]);

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
    },
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

  const entryType: "normal" | "welcome" =
    body.entryType === "welcome" ? "welcome" : "normal";

  function normalize(v: unknown, size: number): string[] {
    if (!Array.isArray(v)) return [];
    const ids = v
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .slice(0, size);
    return ids;
  }

  const playerWin = normalize(body.playerWin, 2);
  const playerTri = normalize(body.playerTri, 3);
  const pitWin = normalize(body.pitWin, 2);
  const pitTri = normalize(body.pitTri, 3);

  // 全スロット埋まっていることを期待
  if (
    playerWin.length !== 2 ||
    playerTri.length !== 3 ||
    pitWin.length !== 2 ||
    pitTri.length !== 3
  ) {
    return NextResponse.json(
      { error: "全ての予想枠を埋めてください" },
      { status: 400 }
    );
  }

  const { cookieId, created } = readOrCreateVoteCookie(req);

  try {
    const prediction = await upsertPrediction({
      cookieId,
      periodId: stage.id,
      entryType,
      playerWin,
      playerTri,
      pitWin,
      pitTri,
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
