import { NextRequest, NextResponse } from "next/server";
import {
  castEventVote,
  getEventTally,
  validateCode,
} from "@/lib/projectp/live-event";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * POST /api/public/event-vote/validate
 *   body: { code } → イベント情報 + 残りチケット数を返す
 *
 * POST /api/public/event-vote
 *   body: { code, memberId } → 1チケット消費して投票
 *
 * GET /api/public/event-vote?eventId=xxx
 *   集計を返す（MC 発表用）
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }
  const tally = await getEventTally(eventId);
  return NextResponse.json({ tally });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  // validate のみ
  if (body.action === "validate") {
    // ファン会員かどうかを判定
    let fanUserId: string | null = null;
    try {
      const supabase = await createServerSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const role =
          (user.app_metadata as { role?: string } | null | undefined)?.role ??
          null;
        if (role !== "admin") fanUserId = user.id;
      }
    } catch {
      // ignore
    }

    const result = await validateCode(body.code, fanUserId);
    if (!result) {
      return NextResponse.json(
        { error: "無効なコードです" },
        { status: 400 }
      );
    }
    if (result.event.status !== "open") {
      return NextResponse.json(
        {
          error:
            result.event.status === "closed"
              ? "投票は締め切られました"
              : "投票はまだ開始されていません",
          event: result.event,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({
      event: result.event,
      ticketsRemaining: result.ticketsRemaining,
      ticketsTotal: result.codeRow.ticketsTotal,
      codeId: result.codeRow.id,
      bonusMultiplier: result.codeRow.bonusMultiplier,
      bonusApplied: result.bonusApplied,
    });
  }

  // 投票
  if (!body.memberId || !body.codeId) {
    return NextResponse.json(
      { error: "memberId and codeId are required" },
      { status: 400 }
    );
  }

  // コードを再検証
  const valid = await validateCode(body.code);
  if (!valid) {
    return NextResponse.json({ error: "無効なコードです" }, { status: 400 });
  }

  const result = await castEventVote(
    Number(body.codeId),
    valid.event.id,
    body.memberId
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    ticketsRemaining: result.ticketsRemaining,
  });
}
