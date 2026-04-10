import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 日次スナップショットの差分から「最近の動き」を自動生成する。
 *
 * ダミーテキストを使わず、実データから観測できた変化だけを並べる。
 *
 * 検出するイベント:
 *   - バズ急上昇: 直近スナップショット と 7日前 を比較し、
 *     top_video_views が 50% 以上増えたら「バズ急上昇」
 *   - 新規動画/配信: top_video_id が前日と変わっていたら「新しい動画が
 *     トップに躍り出た」
 *   - 配信実施: live_broadcast_count が前日より増えていたら「ライブ配信を実施」
 *   - 視聴数アップ: live_view_total が前日より 20% 以上増えたら
 *     「ライブ視聴が伸びた」
 */

export type ActivityItem = {
  occurredAt: string; // ISO
  text: string;
  kind: "buzz" | "video" | "live" | "view";
};

type SnapshotRow = {
  snapshot_date: string;
  fetched_at: string;
  top_video_id: string | null;
  top_video_title: string | null;
  top_video_views: number | null;
  live_view_total: number | null;
  live_broadcast_count: number | null;
};

export async function getRecentActivitiesByMemberName(
  memberName: string,
  limit = 8
): Promise<ActivityItem[]> {
  const supabase = createAdminClient();

  // 名前 → member_id
  const { data: m } = await supabase
    .from("members")
    .select("id")
    .eq("name", memberName)
    .maybeSingle();
  if (!m) return [];

  // 直近 14 日ぶんのスナップショット
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data: snaps } = await supabase
    .from("daily_snapshots")
    .select(
      "snapshot_date, fetched_at, top_video_id, top_video_title, top_video_views, live_view_total, live_broadcast_count"
    )
    .eq("member_id", m.id)
    .gte("snapshot_date", since)
    .order("snapshot_date", { ascending: false });

  const rows = (snaps ?? []) as SnapshotRow[];
  if (rows.length === 0) return [];

  const items: ActivityItem[] = [];

  // i=0 が最新、i+1 が前日
  for (let i = 0; i < rows.length - 1; i++) {
    const cur = rows[i];
    const prev = rows[i + 1];
    const occurredAt = cur.fetched_at;

    // 1. バズ急上昇 (7日前比 50%+)
    const sevenAgo = rows[Math.min(i + 7, rows.length - 1)];
    if (
      cur.top_video_views &&
      sevenAgo?.top_video_views &&
      sevenAgo.top_video_views > 0 &&
      cur.top_video_views >= sevenAgo.top_video_views * 1.5
    ) {
      items.push({
        occurredAt,
        kind: "buzz",
        text: `🔥 バズ急上昇 — 「${cur.top_video_title ?? "動画"}」が ${cur.top_video_views.toLocaleString()} 再生`,
      });
    }

    // 2. 新規動画がトップに（top_video_id 変化）
    if (
      cur.top_video_id &&
      prev.top_video_id &&
      cur.top_video_id !== prev.top_video_id
    ) {
      items.push({
        occurredAt,
        kind: "video",
        text: `🎬 新しい動画がトップに — 「${cur.top_video_title ?? "動画"}」`,
      });
    }

    // 3. ライブ配信を実施
    if (
      (cur.live_broadcast_count ?? 0) > (prev.live_broadcast_count ?? 0)
    ) {
      const diff =
        (cur.live_broadcast_count ?? 0) - (prev.live_broadcast_count ?? 0);
      items.push({
        occurredAt,
        kind: "live",
        text: `📡 ライブ配信を実施 (+${diff})`,
      });
    }

    // 4. ライブ視聴が +20%
    if (
      cur.live_view_total &&
      prev.live_view_total &&
      prev.live_view_total > 0 &&
      cur.live_view_total >= prev.live_view_total * 1.2
    ) {
      items.push({
        occurredAt,
        kind: "view",
        text: `📈 ライブ視聴が伸びた — ${cur.live_view_total.toLocaleString()} 回`,
      });
    }
  }

  // 同じ日 + 同じ kind の重複は1つに（先頭優先）
  const dedup = new Map<string, ActivityItem>();
  for (const it of items) {
    const key = `${it.occurredAt.slice(0, 10)}-${it.kind}`;
    if (!dedup.has(key)) dedup.set(key, it);
  }
  return [...dedup.values()].slice(0, limit);
}

/**
 * occurredAt から「3時間前」「昨日」「3日前」のような相対表記を返す。
 */
export function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffMs = now - t;
  if (diffMs < 0) return "今";
  const min = Math.floor(diffMs / (60 * 1000));
  const hour = Math.floor(diffMs / (60 * 60 * 1000));
  const day = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  if (hour < 24) return `${hour}時間前`;
  if (day === 1) return "昨日";
  if (day < 7) return `${day}日前`;
  if (day < 30) return `${Math.floor(day / 7)}週間前`;
  return iso.slice(0, 10);
}
