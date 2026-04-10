import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 監査ログヘルパー。
 * 主要な管理操作を audit_log テーブルに記録する。
 * 失敗しても本処理には影響させない（catch して console.error のみ）。
 */
export async function logAudit(entry: {
  action: string;
  actor?: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_log").insert({
      action: entry.action,
      actor: entry.actor ?? null,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      detail: entry.detail ?? null,
    });
  } catch (e) {
    console.error("[audit] failed to write log:", e);
  }
}

export type AuditEntry = {
  id: number;
  action: string;
  actor: string | null;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
};

export async function listRecentAuditLogs(
  limit = 30
): Promise<AuditEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id as number,
    action: r.action as string,
    actor: (r.actor as string | null) ?? null,
    targetType: (r.target_type as string | null) ?? null,
    targetId: (r.target_id as string | null) ?? null,
    detail: (r.detail as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}
