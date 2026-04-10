import { NextRequest, NextResponse } from "next/server";
import {
  createStage,
  getActiveStage,
  listStages,
} from "@/lib/projectp/stage";

/**
 * GET /api/admin/stages
 *   Stage 一覧を返す。
 *
 * POST /api/admin/stages
 *   新しい Stage を作成。既存の active があれば先に finalize しないと失敗する
 *   （部分ユニークインデックスで弾かれる）。
 */
export async function GET() {
  const stages = await listStages();
  const active = await getActiveStage();
  return NextResponse.json({ stages, activeStageId: active?.id ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const {
    name,
    seriesNumber,
    stageNumber,
    title,
    subtitle,
    startDate,
    endDate,
    status,
  } = body as {
    name?: string;
    seriesNumber?: number;
    stageNumber?: number;
    title?: string;
    subtitle?: string;
    startDate?: string;
    endDate?: string;
    status?: "active" | "closed";
  };

  if (!name || !startDate || !endDate) {
    return NextResponse.json(
      { error: "name, startDate, endDate are required" },
      { status: 400 }
    );
  }

  try {
    const stage = await createStage({
      name,
      seriesNumber: seriesNumber ?? null,
      stageNumber: stageNumber ?? null,
      title: title ?? null,
      subtitle: subtitle ?? null,
      startDate,
      endDate,
      status: status ?? "active",
    });
    return NextResponse.json({ stage });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
