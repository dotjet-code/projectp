import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { takeSnapshotForMember } from "@/lib/projectp/snapshot";
import { notifyDiscord } from "@/lib/projectp/notify";

/**
 * 日次バッチ：連携済みメンバー全員のスナップショットを取得して保存。
 *
 * 認証:
 *   - Vercel Cron からの呼び出しは `Authorization: Bearer <CRON_SECRET>` を付ける
 *   - ローカル / 手動確認は同じヘッダーを付けて curl で叩く
 *
 * 例:
 *   curl -H "Authorization: Bearer dev-local-cron-secret" \
 *        http://localhost:3000/api/batch/snapshot
 */
export const dynamic = "force-dynamic";
// バッチは長めの実行時間を許容（Vercel Hobby は最大60秒）
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // ------------------------------------------------------
  // auth
  // ------------------------------------------------------
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";
  // Vercel Cron は自動で `Authorization: Bearer <CRON_SECRET>` を付与する仕様
  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // ------------------------------------------------------
  // load connected members
  // ------------------------------------------------------
  const supabase = createAdminClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, google_refresh_token")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  const list = members ?? [];
  const startedAt = new Date().toISOString();

  // ------------------------------------------------------
  // run sequentially (API quota friendly)
  // ------------------------------------------------------
  const succeeded: unknown[] = [];
  const failed: { id: string; name: string; error: string }[] = [];

  for (const m of list) {
    try {
      const result = await takeSnapshotForMember(
        {
          id: m.id,
          name: m.name,
          google_refresh_token: m.google_refresh_token,
        },
        { persist: true }
      );
      succeeded.push(result);
    } catch (e) {
      failed.push({
        id: m.id,
        name: m.name,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (failed.length > 0) {
    const lines = failed.map((f) => `- ${f.name}: ${f.error}`).join("\n");
    await notifyDiscord(
      `🛑 **Project P バッチ失敗**\n${failed.length}/${list.length} 件で失敗しました。\n\`\`\`\n${lines}\n\`\`\``
    );
  }

  return NextResponse.json({
    ok: failed.length === 0,
    startedAt,
    finishedAt: new Date().toISOString(),
    total: list.length,
    succeededCount: succeeded.length,
    failedCount: failed.length,
    succeeded,
    failed,
  });
}
