-- 主役指名投票
-- 「この子が主役」と思うメンバーに 1日 1回 / 人 まで投票できる人気投票。
-- Sanrio キャラクター大賞方式: 1日に何人にでも投票可、ただし同じ人には1日1回まで。
-- 匿名 Cookie ベース。
create table if not exists shuyaku_votes (
  id bigserial primary key,
  cookie_id text not null,
  member_id uuid not null references members(id) on delete cascade,
  period_id uuid references periods(id) on delete set null,
  vote_date date not null,
  created_at timestamptz not null default now(),
  unique (cookie_id, member_id, vote_date)
);

create index if not exists shuyaku_votes_date_idx on shuyaku_votes (vote_date desc);
create index if not exists shuyaku_votes_member_idx on shuyaku_votes (member_id);
create index if not exists shuyaku_votes_period_member_idx
  on shuyaku_votes (period_id, member_id);

alter table shuyaku_votes enable row level security;
-- 公開 API 経由（service_role）からのみアクセス
