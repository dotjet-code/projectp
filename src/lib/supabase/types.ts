// Minimal row types aligned with supabase/migrations/0001_init.sql
// 後で `supabase gen types typescript` で自動生成に切り替え可能。

export type Member = {
  id: string;
  name: string;
  handle: string | null;
  youtube_channel_id: string | null;
  avatar_url: string | null;
  google_refresh_token: string | null;
  google_scopes: string | null;
  google_connected_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Period = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: "active" | "closed";
  created_at: string;
};

export type DailySnapshot = {
  id: number;
  member_id: string;
  snapshot_date: string;
  top_video_id: string | null;
  top_video_title: string | null;
  top_video_views: number | null;
  live_view_total: number | null;
  live_broadcast_count: number | null;
  live_peak_concurrent_max: number | null;
  channel_total_views: number | null;
  channel_subscriber_count: number | null;
  raw: unknown;
  fetched_at: string;
};

export type PeriodPoints = {
  id: string;
  period_id: string;
  member_id: string;
  buzz_points: number;
  live_points: number;
  balance_points: number;
  special_points: number;
  total_points: number;
  rank: number | null;
  position: "PLAYER" | "PIT" | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
};
