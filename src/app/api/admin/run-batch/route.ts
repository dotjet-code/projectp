import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { takeSnapshotForMember } from "@/lib/projectp/snapshot";

/**
 * POST /api/admin/run-batch
 *
 * 管理画面から「今すぐバッチ実行」ボタンで叩く用。
 * middleware が /api/admin/* を Supabase セッションで保護しているので、
 * 運営ログインが必須。
 *
 * Vercel Cron 用の /api/batch/snapshot とロジックは同じ
 * （共通ヘルパー takeSnapshotForMember を使う）。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
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
