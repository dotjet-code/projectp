import { createAdminClient } from "@/lib/supabase/admin";

export type Notification = {
  id: number;
  title: string;
  body: string | null;
  category: "info" | "feedback" | "urgent";
  isGlobal: boolean;
  isRead: boolean;
  createdAt: string;
};

/**
 * メンバー向けのお知らせ一覧。
 * 全体向け + 自分宛を新しい順に返す。既読状態も含む。
 */
export async function getNotificationsForMember(
  memberId: string,
  limit = 50
): Promise<Notification[]> {
  const supabase = createAdminClient();

  // 全体 + 自分宛
  const { data, error } = await supabase
    .from("member_notifications")
    .select("id, title, body, category, target_member_id, created_at")
    .or(`target_member_id.is.null,target_member_id.eq.${memberId}`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  // 既読チェック
  const ids = (data as { id: number }[]).map((r) => r.id);
  const { data: reads } = await supabase
    .from("member_notification_reads")
    .select("notification_id")
    .eq("member_id", memberId)
    .in("notification_id", ids.length > 0 ? ids : [0]);
  const readSet = new Set(
    ((reads ?? []) as { notification_id: number }[]).map(
      (r) => r.notification_id
    )
  );

  type Row = {
    id: number;
    title: string;
    body: string | null;
    category: string;
    target_member_id: string | null;
    created_at: string;
  };

  return (data as Row[]).map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    category: (r.category === "feedback" || r.category === "urgent"
      ? r.category
      : "info") as Notification["category"],
    isGlobal: !r.target_member_id,
    isRead: readSet.has(r.id),
    createdAt: r.created_at,
  }));
}

export async function getUnreadCount(memberId: string): Promise<number> {
  const all = await getNotificationsForMember(memberId);
  return all.filter((n) => !n.isRead).length;
}

export async function markAsRead(
  notificationId: number,
  memberId: string
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("member_notification_reads")
    .upsert(
      { notification_id: notificationId, member_id: memberId },
      { onConflict: "notification_id,member_id" }
    );
}

export async function markAllAsRead(memberId: string): Promise<void> {
  const unread = await getNotificationsForMember(memberId);
  const supabase = createAdminClient();
  const rows = unread
    .filter((n) => !n.isRead)
    .map((n) => ({ notification_id: n.id, member_id: memberId }));
  if (rows.length > 0) {
    await supabase
      .from("member_notification_reads")
      .upsert(rows, { onConflict: "notification_id,member_id" });
  }
}

export async function createNotification(input: {
  targetMemberId?: string | null;
  title: string;
  body?: string | null;
  category?: "info" | "feedback" | "urgent";
  createdBy?: string;
}): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("member_notifications").insert({
    target_member_id: input.targetMemberId ?? null,
    title: input.title,
    body: input.body ?? null,
    category: input.category ?? "info",
    created_by: input.createdBy ?? null,
  });
}
