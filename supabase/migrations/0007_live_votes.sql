-- ライブ応援投票
-- 匿名 Cookie ベース。1 (cookie_id, vote_date) につき 1票。
create table if not exists live_votes (
  id bigserial primary key,
  cookie_id text not null,
  member_id uuid not null references members(id) on delete cascade,
  period_id uuid references periods(id) on delete set null,
  vote_date date not null,
  created_at timestamptz not null default now(),
  unique (cookie_id, vote_date)
);

create index if not exists live_votes_date_idx on live_votes (vote_date desc);
create index if not exists live_votes_period_member_idx
  on live_votes (period_id, member_id);

alter table live_votes enable row level security;
-- 公開 API 経由（service_role）からのみアクセス
