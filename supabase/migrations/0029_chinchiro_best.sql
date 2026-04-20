-- 「今日の賽」ベスト版対応
--
-- 1) 1 日 1 回の振り判定・ストリーク・シェア管理を chinchiro_rolls に集約
-- 2) ヒフミを「全員 1票お裾分け」にするため、shuyaku_votes の chinchiro 制約を
--    (cookie_id, member_id, vote_date) に変更
-- 3) ピンゾロ 100 票に対応するため value 上限を 200 へ拡張

-- 「振ったか」の原子的ゲート + ストリーク + シェア状態
create table if not exists chinchiro_rolls (
  cookie_id text not null,
  vote_date date not null,
  rolled_at timestamptz not null default now(),
  hand text not null check (hand in ('pinzoro','zorome','shigoro','normal','hifumi','menashi')),
  dice smallint[] not null check (array_length(dice, 1) = 3),
  -- ユーザーが最初に選んだメンバー (ヒフミでもこの人がメイン)
  picked_member_id uuid references members(id) on delete set null,
  total_value int not null check (total_value between 0 and 200),
  streak_days int not null default 1 check (streak_days >= 1),
  shared_at timestamptz,
  primary key (cookie_id, vote_date)
);

create index if not exists chinchiro_rolls_date_idx on chinchiro_rolls (vote_date desc);
create index if not exists chinchiro_rolls_cookie_idx on chinchiro_rolls (cookie_id, vote_date desc);

alter table chinchiro_rolls enable row level security;

-- shuyaku_votes.value 上限を 30 → 200 に
alter table shuyaku_votes drop constraint if exists shuyaku_votes_value_check;
alter table shuyaku_votes
  add constraint shuyaku_votes_value_check check (value between 0 and 200);

-- chinchiro の partial unique を (cookie_id, member_id, vote_date) に変更
-- (ヒフミで 12 人に撒けるように member_id を含める。同じ人に 2 重は引き続き防止)
drop index if exists shuyaku_votes_chinchiro_unique_idx;
create unique index if not exists shuyaku_votes_chinchiro_member_unique_idx
  on shuyaku_votes (cookie_id, member_id, vote_date)
  where kind = 'chinchiro';
