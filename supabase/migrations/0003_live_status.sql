-- ライブ中判定用のデータ構造
-- - members.recent_video_ids: 日次バッチで各メンバーの直近50本の動画IDをキャッシュ
-- - live_status: 30秒ごとに API で更新する現在のライブ状態

alter table members
  add column if not exists recent_video_ids jsonb;

create table if not exists live_status (
  member_id uuid primary key references members(id) on delete cascade,
  is_live boolean not null default false,
  video_id text,
  title text,
  thumbnail_url text,
  concurrent_viewers int,
  started_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table live_status enable row level security;
-- service_role からのみアクセス（公開用 API 経由で読む）
