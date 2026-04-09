-- Project P: initial schema
-- Run this in Supabase SQL Editor

-- =========================================================
-- drop existing (dev only — wipes data!)
-- =========================================================
drop table if exists special_point_entries cascade;
drop table if exists balance_entries cascade;
drop table if exists period_points cascade;
drop table if exists daily_snapshots cascade;
drop table if exists periods cascade;
drop table if exists members cascade;

-- =========================================================
-- extensions
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- members
-- Project P の参加者（12人想定）
-- =========================================================
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text,                          -- 表示用ハンドル（@xxx）
  youtube_channel_id text unique,       -- UCxxxx
  avatar_url text,

  -- YouTube OAuth（本人が認可後に埋まる）
  google_refresh_token text,            -- 暗号化カラムにするのが理想。MVP では service_role 経由のみアクセス
  google_scopes text,
  google_connected_at timestamptz,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- periods
-- 月次サイクルの単位（2026-04 など）
-- =========================================================
create table if not exists periods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,            -- '2026-04'
  start_date date not null,
  end_date date not null,
  status text not null default 'active',-- 'active' | 'closed'
  created_at timestamptz not null default now()
);

-- =========================================================
-- daily_snapshots
-- バッチが日次で API から取得した生データ
-- =========================================================
create table if not exists daily_snapshots (
  id bigserial primary key,
  member_id uuid not null references members(id) on delete cascade,
  snapshot_date date not null,

  -- バズ指標の素材
  top_video_id text,
  top_video_title text,
  top_video_views bigint,               -- 期間内最大再生の1本

  -- ライブ視聴の素材
  live_view_total bigint,               -- 期間内ライブの視聴回数合計（YouTube Analytics API）
  live_broadcast_count int,             -- 集計対象のライブ配信数
  live_peak_concurrent_max int,         -- 参考値

  -- チャンネル全体の累計値（参考）
  channel_total_views bigint,
  channel_subscriber_count bigint,

  raw jsonb,                            -- 生レスポンスを保存（後から見返せる）
  fetched_at timestamptz not null default now(),

  unique (member_id, snapshot_date)
);
create index if not exists daily_snapshots_member_date_idx
  on daily_snapshots (member_id, snapshot_date desc);

-- =========================================================
-- period_points
-- 期間確定ポイント（月1特番で確定）
-- =========================================================
create table if not exists period_points (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references periods(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,

  buzz_points bigint not null default 0,     -- 最大再生1本 × 1
  live_points bigint not null default 0,     -- ライブ視聴 × 10 の合計
  balance_points bigint not null default 0,  -- 残金（手動入力）
  special_points bigint not null default 0,  -- ライブ当日応援ポイント

  total_points bigint generated always as
    (buzz_points + live_points + balance_points) stored,  -- special は別レイヤー

  rank int,
  position text,                              -- 'PLAYER' | 'PIT'

  finalized_at timestamptz,                   -- 特番後に確定
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (period_id, member_id)
);

-- =========================================================
-- balance_entries
-- 収支（手動入力）
-- =========================================================
create table if not exists balance_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  amount bigint not null,                     -- 収支差分（プラス/マイナス）
  note text,
  created_at timestamptz not null default now()
);
create index if not exists balance_entries_member_period_idx
  on balance_entries (member_id, period_id);

-- =========================================================
-- special_points
-- ライブ当日応援ポイント（SPECIAL / LIVE DAY ONLY）
-- =========================================================
create table if not exists special_point_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  period_id uuid not null references periods(id) on delete cascade,
  live_date date not null,
  points bigint not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists special_point_entries_member_period_idx
  on special_point_entries (member_id, period_id);

-- =========================================================
-- Row Level Security
-- 最初は service_role からのみ読み書き。公開用 view は後で別途作る。
-- =========================================================
alter table members                enable row level security;
alter table periods                enable row level security;
alter table daily_snapshots        enable row level security;
alter table period_points          enable row level security;
alter table balance_entries        enable row level security;
alter table special_point_entries  enable row level security;

-- anon / authenticated には何も許可しない（service_role は RLS をバイパスする）
-- 公開ページは将来的に「公開 view + select policy」で制御する。
