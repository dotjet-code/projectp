import { createAdminClient } from "@/lib/supabase/admin";
import { takeSnapshotForMember, type SnapshotResult } from "./snapshot";
import { notifyDiscord } from "./notify";

export type BatchRunResult = {
  runId: number | null;
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  total: number;
  succeededCount: number;
  failedCount: number;
  succeeded: SnapshotResult[];
  failed: { id: string; name: string; error: string }[];
};

/**
 * 全メンバーぶんのスナップショットを取得し、batch_runs に履歴を残す。
 * 失敗があれば Discord 通知も行う。
 */
export async function runSnapshotBatch(
  source: "cron" | "admin"
): Promise<BatchRunResult> {
  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();

  // 履歴行を先に作成（完了時に更新）
  let runId: number | null = null;
  {
    const { data, error } = await supabase
      .from("batch_runs")
      .insert({
        source,
        started_at: startedAt,
      })
      .select("id")
      .single();
    if (!error && data) {
      runId = data.id as number;
    }
  }

  // 連携済みメンバー
  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, google_refresh_token")
    .eq("is_active", true)
    .not("google_refresh_token", "is", null);

  const list = members ?? [];
  const succeeded: SnapshotResult[] = [];
  const failed: { id: string; name: string; error: string }[] = [];

  if (!error) {
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
  }

  const finishedAt = new Date().toISOString();

  // 履歴行を更新
  if (runId !== null) {
    const summary =
      failed.length > 0
        ? failed.map((f) => `${f.name}: ${f.error}`).join(" | ").slice(0, 500)
        : null;
    await supabase
      .from("batch_runs")
      .update({
        finished_at: finishedAt,
        total: list.length,
        succeeded_count: succeeded.length,
        failed_count: failed.length,
        failed_summary: summary,
      })
      .eq("id", runId);
  }

  // 失敗時 Discord 通知
  if (failed.length > 0) {
    const lines = failed.map((f) => `- ${f.name}: ${f.error}`).join("\n");
    await notifyDiscord(
      `🛑 **Project P バッチ失敗** (${source})\n${failed.length}/${list.length} 件で失敗しました。\n\`\`\`\n${lines}\n\`\`\``
    );
  }

  return {
    runId,
    ok: failed.length === 0,
    startedAt,
    finishedAt,
    total: list.length,
    succeededCount: succeeded.length,
    failedCount: failed.length,
    succeeded,
    failed,
  };
}
